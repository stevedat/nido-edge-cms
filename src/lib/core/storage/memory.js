// @ts-check
import { StorageAdapter } from './interface.js';

/**
 * In-memory storage adapter for unit testing and ephemeral environments.
 * Stores files in a JavaScript Map.
 */
export class MemoryStorageAdapter extends StorageAdapter {
	/**
	 * @param {Record<string, string> | Map<string, string>} [initialData]
	 */
	constructor(initialData) {
		super();
		/** @type {Map<string, string>} */
		this.files = new Map();

		if (initialData) {
			if (initialData instanceof Map) {
				for (const [k, v] of initialData.entries()) {
					this.files.set(k, v);
				}
			} else {
				for (const [k, v] of Object.entries(initialData)) {
					this.files.set(k, v);
				}
			}
		}
	}

	/**
	 * @param {string} path
	 * @returns {Promise<string | null>}
	 */
	async read(path) {
		if (this.files.has(path)) {
			return this.files.get(path) ?? null;
		}
		return null;
	}

	/**
	 * @param {string} path
	 * @param {string} content
	 * @returns {Promise<void>}
	 */
	async write(path, content) {
		this.files.set(path, String(content));
	}

	/**
	 * @param {string} path
	 * @returns {Promise<void>}
	 */
	async delete(path) {
		this.files.delete(path);
	}

	/**
	 * @param {string} prefix
	 * @returns {Promise<string[]>}
	 */
	async list(prefix = '') {
		const result = [];
		for (const key of this.files.keys()) {
			if (key.startsWith(prefix)) {
				result.push(key);
			}
		}
		return result;
	}

	/**
	 * Seed in-memory data
	 * @param {Record<string, string>} data
	 */
	seed(data) {
		for (const [k, v] of Object.entries(data)) {
			this.files.set(k, v);
		}
	}

	/**
	 * Clear all files from memory
	 */
	clear() {
		this.files.clear();
	}
}
