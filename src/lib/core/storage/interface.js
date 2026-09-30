// @ts-check

/**
 * Base abstract class defining the StorageAdapter interface contract.
 * Storage adapters implement persistence for content files across runtimes
 * (Memory, Local Filesystem, GitHub API, Cloudflare KV, etc.).
 */
export class StorageAdapter {
	/**
	 * Read file content as string. Returns null if file does not exist.
	 * @param {string} path - Relative file path (e.g. 'src/content/default/posts.json')
	 * @returns {Promise<string | null>}
	 */
	async read(path) {
		throw new Error(`StorageAdapter.read("${path}") is not implemented`);
	}

	/**
	 * Write file content as UTF-8 string.
	 * @param {string} path - Relative file path
	 * @param {string} content - Text content to write
	 * @param {string} [commitMessage] - Optional message for versioned backends (e.g. Git)
	 * @returns {Promise<void>}
	 */
	async write(path, content, commitMessage) {
		throw new Error(
			`StorageAdapter.write("${path}", "${typeof content}", "${commitMessage || ''}") is not implemented`
		);
	}

	/**
	 * Delete a file.
	 * @param {string} path - Relative file path
	 * @param {string} [commitMessage] - Optional message for versioned backends
	 * @returns {Promise<void>}
	 */
	async delete(path, commitMessage) {
		throw new Error(
			`StorageAdapter.delete("${path}", "${commitMessage || ''}") is not implemented`
		);
	}

	/**
	 * List all files starting with prefix or inside a directory.
	 * @param {string} prefix - Path prefix to filter by
	 * @returns {Promise<string[]>} List of matching file paths
	 */
	async list(prefix) {
		throw new Error(`StorageAdapter.list("${prefix}") is not implemented`);
	}
}
