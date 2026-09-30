import { env } from '$env/dynamic/private';
import { utf8ToBase64, base64ToUtf8, arrayBufferToBase64 } from '$lib/utils/base64.js';

const GITHUB_API_URL = 'https://api.github.com';

function getHeaders() {
	if (!env.GITHUB_TOKEN) {
		throw new Error('GITHUB_TOKEN is not configured in environment variables');
	}
	return {
		Authorization: `Bearer ${env.GITHUB_TOKEN}`,
		Accept: 'application/vnd.github.v3+json',
		'X-GitHub-Api-Version': '2022-11-28',
		'Content-Type': 'application/json',
		'User-Agent': 'Svelte-EdgeCMS/1.0'
	};
}

/**
 * Safely parse error from GitHub API response (preventing Unexpected token 'R' on plain text)
 * @param {Response} response
 */
async function parseError(response) {
	try {
		const text = await response.text();
		try {
			const json = JSON.parse(text);
			return json.message || text;
		} catch (_) {
			return text.trim() || `HTTP ${response.status} ${response.statusText}`;
		}
	} catch (err) {
		return `HTTP ${response.status} ${response.statusText}`;
	}
}

function getRepoParams() {
	const repoFullName = env.GITHUB_REPO || (env.GITHUB_REPO_OWNER && env.GITHUB_REPO_NAME ? `${env.GITHUB_REPO_OWNER}/${env.GITHUB_REPO_NAME}` : null);
	if (!repoFullName) {
		throw new Error('GITHUB_REPO is not configured (e.g., your-username/your-repo)');
	}
	return {
		repo: repoFullName,
		branch: env.GITHUB_BRANCH || 'main'
	};
}

export const isGitHubConfigured = Boolean(
	env.GITHUB_TOKEN && (env.GITHUB_REPO || (env.GITHUB_REPO_OWNER && env.GITHUB_REPO_NAME))
);

function getCommitter() {
	return {
		name: env.GITHUB_COMMITTER_NAME || 'Edge CMS Admin',
		email: env.GITHUB_COMMITTER_EMAIL || 'noreply@edge-cms.local'
	};
}

/**
 * Fetch a file from GitHub repository
 * @param {string} path
 * @param {string} [branch]
 */
export async function getFile(path, branch = getRepoParams().branch) {
	if (!isGitHubConfigured) return null;
	const { repo } = getRepoParams();
	const url = `${GITHUB_API_URL}/repos/${repo}/contents/${path}?ref=${branch}`;

	const response = await fetch(url, { headers: getHeaders() });
	if (response.status === 404) return null;
	if (!response.ok) {
		const errorMsg = await parseError(response);
		throw new Error(`GitHub API Error (getFile): ${errorMsg}`);
	}

	const data = await response.json();
	if (data.content) {
		return { path: data.path, content: base64ToUtf8(data.content.replace(/\n/g, '')), sha: data.sha };
	}
	return { path: data.path, content: '', sha: data.sha };
}

/**
 * Legacy alias for getFile
 */
export const getGithubFile = getFile;

/**
 * Fetches a file as binary Base64 for serving static assets like uploads.
 * @param {string} path
 * @param {string} [branch]
 */
export async function getBinaryFile(path, branch = getRepoParams().branch) {
	if (!isGitHubConfigured) return null;
	const { repo } = getRepoParams();
	const url = `${GITHUB_API_URL}/repos/${repo}/contents/${path}?ref=${branch}`;

	const response = await fetch(url, { headers: getHeaders() });
	if (response.status === 404) return null;
	if (!response.ok) {
		const errorMsg = await parseError(response);
		throw new Error(`GitHub API Error (getBinaryFile): ${errorMsg}`);
	}

	const data = await response.json();
	return {
		sha: data.sha,
		path: data.path,
		content: data.content // keep base64 encoded
	};
}

/**
 * Save (Create or Update) a file in GitHub repository
 * @param {string} path
 * @param {string} content
 * @param {string} commitMessage
 * @param {any} [options]
 */
export async function createOrUpdateFile(path, content, commitMessage, options = {}) {
	if (!isGitHubConfigured) {
		throw new Error('GitHub is not configured. Cannot save file.');
	}
	const branch = options.branch || getRepoParams().branch;
	const { repo } = getRepoParams();
	
	let sha = options.sha;
	if (!sha) {
		const existingFile = await getFile(path, branch);
		sha = existingFile?.sha;
	}
	
	const skipCi = options.skipCi !== false; // default true
	let finalMessage = commitMessage;
	if (skipCi && !finalMessage.includes('[skip ci]')) {
		finalMessage += ' [skip ci]';
	}
	
	// If the content is an image, it might already be base64. But we need a robust way.
	// For text files, utf8ToBase64 will be used.
	let encodedContent = content;
	if (options.isBase64) {
		encodedContent = content;
	} else if (typeof content === 'string') {
		encodedContent = utf8ToBase64(content);
	}
	
	const committer = getCommitter();
	/** @type {any} */
	const body = {
		message: finalMessage,
		content: encodedContent,
		committer: committer,
		author: committer,
		branch: branch
	};

	if (sha) {
		body.sha = sha;
	}

	const url = `${GITHUB_API_URL}/repos/${repo}/contents/${path}`;
	const response = await fetch(url, {
		method: 'PUT',
		headers: getHeaders(),
		body: JSON.stringify(body)
	});

	if (!response.ok) {
		const errorMsg = await parseError(response);
		throw new Error(`GitHub API Error (createOrUpdateFile): ${errorMsg}`);
	}

	return await response.json();
}

/**
 * Legacy alias for saveGithubFile
 * @param {string} path
 * @param {string} content
 * @param {string} commitMessage
 * @param {string} [branch]
 * @param {boolean} [skipCi]
 */
export const saveGithubFile = async (path, content, commitMessage, branch, skipCi) => {
	return createOrUpdateFile(path, content, commitMessage, { branch, skipCi });
};

/**
 * List directory contents
 * @param {string} dirPath
 * @param {string} [branch]
 */
export async function listDirectory(dirPath, branch = getRepoParams().branch) {
	if (!isGitHubConfigured) return [];
	const { repo } = getRepoParams();
	try {
		const url = `${GITHUB_API_URL}/repos/${repo}/contents/${dirPath}?ref=${branch}`;
		const response = await fetch(url, { headers: getHeaders() });
		if (response.status === 404) return [];
		if (!response.ok) throw new Error('Failed to list directory');
		return response.json();
	} catch (error) {
		console.error('List directory error:', error);
		return [];
	}
}

/**
 * Delete a file in GitHub repository
 * @param {string} path
 * @param {string} [sha]
 * @param {string} [commitMessage]
 * @param {string} [branch]
 */
export async function deleteFile(path, sha, commitMessage, branch = getRepoParams().branch) {
	if (!isGitHubConfigured) return;
	const { repo } = getRepoParams();
	
	if (!sha) {
		const existingFile = await getFile(path, branch);
		if (!existingFile) return true; // Already deleted
		sha = existingFile.sha;
	}

	const committer = getCommitter();
	const url = `${GITHUB_API_URL}/repos/${repo}/contents/${path}`;
	const response = await fetch(url, {
		method: 'DELETE',
		headers: getHeaders(),
		body: JSON.stringify({
			message: commitMessage,
			sha: sha,
			committer: committer,
			author: committer,
			branch: branch
		})
	});

	if (!response.ok) {
		const errorMsg = await parseError(response);
		throw new Error(`GitHub API Error (deleteFile): ${errorMsg}`);
	}

	return true;
}

/**
 * Upload Image
 * @param {any} file
 */
export async function uploadImage(file) {
	const arrayBuffer = await file.arrayBuffer();
	const base64Content = arrayBufferToBase64(arrayBuffer);
	
	const fileName = file.name?.toLowerCase().replace(/[^a-z0-9.-]+/g, '-').replace(/^-+|-+$/g, '') || 'upload.jpg';
	const targetPath = `static/uploads/${Date.now()}-${fileName}`;

	// Pass the base64 content directly to createOrUpdateFile
	await createOrUpdateFile(targetPath, base64Content, `Upload ${fileName}`, { isBase64: true });

	return `/${targetPath.replace(/^static\//, '')}`;
}

/**
 * Trigger Vercel Deploy by pushing a commit without [skip ci]
 */
export async function triggerDeploy(branchName = getRepoParams().branch) {
	const timestamp = new Date().toISOString();
	const content = `Deploy triggered at: ${timestamp}`;
	return createOrUpdateFile('src/content/.deploy', content, '🚀 Xuất bản giao diện mới', { branch: branchName, skipCi: false });
}
