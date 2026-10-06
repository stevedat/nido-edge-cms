// @ts-check
import { StorageAdapter } from './interface.js';

export class CloudflareKVAdapter extends StorageAdapter {
	/**
	 * @param {() => any} getKv - Function returning the Cloudflare KV Namespace binding
	 */
	constructor(getKv) {
		super();
		if (typeof getKv !== 'function') {
			throw new Error('Cloudflare KV binding getter function is required');
		}
		this.getKv = getKv;
	}

	get kv() {
		const kv = this.getKv();
		if (!kv) {
			throw new Error('KV binding is currently not available');
		}
		return kv;
	}

	/**
	 * @param {string} path
	 * @returns {Promise<string | null>}
	 */
	async read(path) {
		const content = await this.kv.get(path);
		return content;
	}

	/**
	 * @param {string} path
	 * @param {string} content
	 * @param {string} [commitMessage]
	 * @returns {Promise<void>}
	 */
	async write(path, content, commitMessage) {
		await this.kv.put(path, content);
	}

	/**
	 * @param {string} path
	 * @param {string} [commitMessage]
	 * @returns {Promise<void>}
	 */
	async delete(path, commitMessage) {
		await this.kv.delete(path);
	}

	/**
	 * @param {string} prefix
	 * @returns {Promise<string[]>}
	 */
	async list(prefix) {
		/** @type {string[]} */
		const keys = [];
		let cursor = undefined;
		let isComplete = false;

		while (!isComplete) {
			/** @type {any} */
			const result = await this.kv.list({ prefix, cursor });
			keys.push(...result.keys.map((/** @type {any} */ k) => k.name));
			isComplete = result.list_complete;
			cursor = result.cursor;
		}

		return keys;
	}
}
