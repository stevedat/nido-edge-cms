// @ts-check
import fs from 'node:fs/promises';
import path from 'node:path';
import { StorageAdapter } from './interface.js';

/**
 * Filesystem storage adapter for Node/server environments.
 * Reads and writes directly to disk.
 */
export class FsStorageAdapter extends StorageAdapter {
	/**
	 * @param {{ basePath?: string }} [options]
	 */
	constructor(options = {}) {
		super();
		this.basePath = options.basePath || process.cwd();
	}

	/**
	 * Resolve path against basePath and check for directory traversal
	 * @param {string} relativePath
	 * @returns {string}
	 */
	resolvePath(relativePath) {
		const resolved = path.resolve(this.basePath, relativePath);
		const normalizedBase = path.resolve(this.basePath);
		const baseWithSep = normalizedBase.endsWith(path.sep)
			? normalizedBase
			: normalizedBase + path.sep;
		if (resolved !== normalizedBase && !resolved.startsWith(baseWithSep)) {
			throw new Error(`Path traversal denied: ${relativePath}`);
		}
		return resolved;
	}

	/**
	 * @param {string} filePath
	 * @returns {Promise<string | null>}
	 */
	async read(filePath) {
		try {
			const fullPath = this.resolvePath(filePath);
			return await fs.readFile(fullPath, 'utf-8');
		} catch (err) {
			if (/** @type {any} */ (err).code === 'ENOENT') {
				return null;
			}
			throw err;
		}
	}

	/**
	 * @param {string} filePath
	 * @param {string} content
	 * @returns {Promise<void>}
	 */
	async write(filePath, content) {
		const fullPath = this.resolvePath(filePath);
		const dir = path.dirname(fullPath);
		await fs.mkdir(dir, { recursive: true });
		await fs.writeFile(fullPath, content, 'utf-8');
	}

	/**
	 * @param {string} filePath
	 * @returns {Promise<void>}
	 */
	async delete(filePath) {
		try {
			const fullPath = this.resolvePath(filePath);
			await fs.unlink(fullPath);
		} catch (err) {
			if (/** @type {any} */ (err).code !== 'ENOENT') {
				throw err;
			}
		}
	}

	/**
	 * @param {string} prefix
	 * @returns {Promise<string[]>}
	 */
	async list(prefix = '') {
		const fullTarget = this.resolvePath(prefix);
		/** @type {string[]} */
		const results = [];

		/**
		 * @param {string} currentDir
		 */
		const scanDir = async (currentDir) => {
			try {
				const entries = await fs.readdir(currentDir, { withFileTypes: true });
				for (const entry of entries) {
					const entryPath = path.join(currentDir, entry.name);
					if (entry.isDirectory()) {
						await scanDir(entryPath);
					} else if (entry.isFile()) {
						results.push(entryPath);
					}
				}
			} catch (err) {
				if (/** @type {any} */ (err).code !== 'ENOENT') {
					throw err;
				}
			}
		};

		try {
			const stat = await fs.stat(fullTarget);
			if (stat.isDirectory()) {
				await scanDir(fullTarget);
			} else if (stat.isFile()) {
				results.push(fullTarget);
			}
		} catch {
			// If prefix is not a directory itself, check its parent
			const parent = path.dirname(fullTarget);
			try {
				const entries = await fs.readdir(parent, { withFileTypes: true });
				for (const entry of entries) {
					const entryFullPath = path.join(parent, entry.name);
					if (entryFullPath.startsWith(fullTarget) && entry.isFile()) {
						results.push(entryFullPath);
					}
				}
			} catch {
				// Ignore non-existent parent directory
			}
		}

		const normBase = path.normalize(this.basePath);
		return results.map((p) => path.relative(normBase, p).replace(/\\/g, '/'));
	}
}
