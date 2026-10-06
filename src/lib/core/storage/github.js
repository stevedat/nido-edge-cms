// @ts-check
import { StorageAdapter } from './interface.js';

/**
 * Pure Web Standards UTF-8 to Base64 encoder (Strictly NO Node Buffer)
 * @param {string} str
 * @returns {string}
 */
function utf8ToBase64(str) {
	const bytes = new TextEncoder().encode(str);
	let binary = '';
	for (let i = 0; i < bytes.length; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
}

/**
 * Pure Web Standards Base64 to UTF-8 decoder (Strictly NO Node Buffer)
 * @param {string} b64
 * @returns {string}
 */
function base64ToUtf8(b64) {
	const binary = atob(b64.replace(/\s/g, ''));
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return new TextDecoder().decode(bytes);
}

/**
 * StorageAdapter backed by remote GitHub REST API v3 using standard Web fetch.
 */
export class GitHubStorageAdapter extends StorageAdapter {
	/**
	 * @param {Object} options
	 * @param {string} options.token - GitHub personal access token
	 * @param {string} options.repo - Repository in "owner/repo" format
	 * @param {string} [options.branch='main'] - Git branch name
	 * @param {{ name: string; email: string }} [options.committer] - Git committer identity
	 * @param {string} [options.apiUrl='https://api.github.com'] - GitHub API base URL
	 */
	constructor(options) {
		super();
		if (!options || !options.token || !options.repo) {
			throw new Error('GitHubStorageAdapter requires token and repo options');
		}
		this.token = options.token;
		this.repo = options.repo;
		this.branch = options.branch || 'main';
		this.committer = options.committer || {
			name: 'Edge CMS Admin',
			email: 'noreply@edge-cms.local'
		};
		this.apiUrl = options.apiUrl || 'https://api.github.com';
		/** @type {Map<string, string>} */
		this.shaMap = new Map();
	}

	/**
	 * @private
	 * @returns {Record<string, string>}
	 */
	getHeaders() {
		return {
			Authorization: `Bearer ${this.token}`,
			Accept: 'application/vnd.github.v3+json',
			'X-GitHub-Api-Version': '2022-11-28',
			'Content-Type': 'application/json',
			'User-Agent': 'Svelte-EdgeCMS/1.0'
		};
	}

	/**
	 * Read file from GitHub repository
	 * @param {string} path
	 * @returns {Promise<string | null>}
	 */
	async read(path) {
		const cleanPath = path.replace(/^\/+/, '');
		const url = `${this.apiUrl}/repos/${this.repo}/contents/${cleanPath}?ref=${this.branch}`;

		const response = await fetch(url, { headers: this.getHeaders() });
		if (response.status === 404) return null;
		if (!response.ok) {
			const text = await response.text();
			throw new Error(`GitHub API error (${response.status}): ${text}`);
		}

		const data = await response.json();
		if (data.sha) {
			this.shaMap.set(cleanPath, data.sha);
		}

		if (data.content) {
			return base64ToUtf8(data.content);
		}
		return '';
	}

	/**
	 * Write file to GitHub repository
	 * @param {string} path
	 * @param {string} content
	 * @param {string} [commitMessage]
	 * @returns {Promise<void>}
	 */
	async write(path, content, commitMessage = 'Update file') {
		const cleanPath = path.replace(/^\/+/, '');
		const url = `${this.apiUrl}/repos/${this.repo}/contents/${cleanPath}`;

		// Get latest SHA if not cached
		let sha = this.shaMap.get(cleanPath);
		if (!sha) {
			try {
				const checkRes = await fetch(`${url}?ref=${this.branch}`, { headers: this.getHeaders() });
				if (checkRes.ok) {
					const existing = await checkRes.json();
					sha = existing.sha;
				}
			} catch {
				// File may not exist yet on remote branch
			}
		}

		/** @type {Record<string, any>} */
		const body = {
			message: commitMessage,
			content: utf8ToBase64(content),
			branch: this.branch,
			committer: this.committer
		};
		if (sha) {
			body.sha = sha;
		}

		const response = await fetch(url, {
			method: 'PUT',
			headers: this.getHeaders(),
			body: JSON.stringify(body)
		});

		if (!response.ok) {
			const text = await response.text();
			throw new Error(`GitHub API write error (${response.status}): ${text}`);
		}

		const resData = await response.json();
		if (resData.content?.sha) {
			this.shaMap.set(cleanPath, resData.content.sha);
		}
	}

	/**
	 * Delete file from GitHub repository
	 * @param {string} path
	 * @param {string} [commitMessage]
	 * @returns {Promise<void>}
	 */
	async delete(path, commitMessage = 'Delete file') {
		const cleanPath = path.replace(/^\/+/, '');
		const url = `${this.apiUrl}/repos/${this.repo}/contents/${cleanPath}`;

		let sha = this.shaMap.get(cleanPath);
		if (!sha) {
			const checkRes = await fetch(`${url}?ref=${this.branch}`, { headers: this.getHeaders() });
			if (checkRes.status === 404) return;
			if (!checkRes.ok) {
				const text = await checkRes.text();
				throw new Error(`GitHub API delete error (${checkRes.status}): ${text}`);
			}
			const existing = await checkRes.json();
			sha = existing.sha;
		}

		const response = await fetch(url, {
			method: 'DELETE',
			headers: this.getHeaders(),
			body: JSON.stringify({
				message: commitMessage,
				sha,
				branch: this.branch,
				committer: this.committer
			})
		});

		if (response.status === 404) return;
		if (!response.ok) {
			const text = await response.text();
			throw new Error(`GitHub API delete error (${response.status}): ${text}`);
		}

		this.shaMap.delete(cleanPath);
	}

	/**
	 * List directory contents from GitHub repository
	 * @param {string} prefix
	 * @returns {Promise<string[]>}
	 */
	async list(prefix = '') {
		const cleanPath = prefix.replace(/^\/+|\/+$/g, '');
		const url = `${this.apiUrl}/repos/${this.repo}/contents/${cleanPath}?ref=${this.branch}`;

		const response = await fetch(url, { headers: this.getHeaders() });
		if (response.status === 404) return [];
		if (!response.ok) {
			const text = await response.text();
			throw new Error(`GitHub API list error (${response.status}): ${text}`);
		}

		const data = await response.json();
		if (Array.isArray(data)) {
			return data.map((item) => item.path);
		}
		return [];
	}
}
