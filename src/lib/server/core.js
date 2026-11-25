// @ts-check
import { env } from '$env/dynamic/private';
import {
	createEdgeCMSCore,
	FsStorageAdapter,
	GitHubStorageAdapter,
	CloudflareKVAdapter
} from '$lib/core/index.js';

/** @type {ReturnType<typeof createEdgeCMSCore> | null} */
let coreInstance = null;

/**
 * Read a server environment variable safely across Cloudflare Workers, Vercel Edge, and Node.js
 * @param {string} key
 * @returns {string | undefined}
 */
function readEnv(key) {
	const platformEnv = /** @type {any} */ (globalThis).__PLATFORM_ENV__;
	if (platformEnv && typeof platformEnv[key] === 'string' && platformEnv[key]) {
		return platformEnv[key];
	}
	if (env && typeof env[key] === 'string' && env[key]) {
		return env[key];
	}
	if (typeof process !== 'undefined' && process.env?.[key]) {
		return process.env[key];
	}
	return undefined;
}

/**
 * Reset the cached singleton core instance (useful for tests or runtime re-binding)
 */
export function resetCore() {
	coreInstance = null;
}

/**
 * Get or initialize the singleton EdgeCMSCore instance.
 * Injects environment secrets into the decoupled core factory.
 *
 * @param {Partial<import('$lib/core').CoreConfig>} [overrides]
 * @returns {ReturnType<typeof createEdgeCMSCore>}
 */
export function getCore(overrides = {}) {
	if (coreInstance && Object.keys(overrides).length === 0) {
		return coreInstance;
	}

	const jwtSecret = overrides.jwtSecret || readEnv('JWT_SECRET');
	const adminPassword = overrides.adminPassword || readEnv('ADMIN_PASSWORD');

	if (!jwtSecret) {
		console.warn(
			'⚠️ WARNING: JWT_SECRET is not defined. Please set it in your environment variables.'
		);
	}
	const finalJwtSecret =
		jwtSecret || crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');

	if (!adminPassword) {
		console.warn(
			'⚠️ WARNING: ADMIN_PASSWORD is not defined. Admin login will be disabled/inaccessible.'
		);
	}
	const finalAdminPassword = adminPassword || crypto.randomUUID();

	const rootDomain = overrides.rootDomain || readEnv('ROOT_DOMAIN') || 'example.com';
	const antispamSalt = overrides.antispamSalt || readEnv('ANTISPAM_SALT') || finalAdminPassword;
	const powDifficulty = overrides.powDifficulty || readEnv('POW_DIFFICULTY') || '000';

	/** @type {import('$lib/core/storage/interface.js').StorageAdapter} */
	let storage;
	if (overrides.storage) {
		storage = overrides.storage;
	} else {
		const githubToken = readEnv('GITHUB_TOKEN');
		const githubOwner = readEnv('GITHUB_REPO_OWNER');
		const githubName = readEnv('GITHUB_REPO_NAME');
		const githubRepo =
			readEnv('GITHUB_REPO') || (githubOwner && githubName ? `${githubOwner}/${githubName}` : null);

		const storageType = readEnv('STORAGE_ADAPTER');

		if (storageType === 'cloudflare-kv') {
			storage = new CloudflareKVAdapter(() => /** @type {any} */ (globalThis).__KV_BINDING__);
		} else if (storageType === 'github' && githubToken && githubRepo) {
			storage = new GitHubStorageAdapter({
				token: githubToken,
				repo: githubRepo,
				branch: readEnv('GITHUB_BRANCH') || 'main'
			});
		} else {
			const basePath =
				readEnv('CONTENT_DIR') || (typeof process !== 'undefined' ? process.cwd() : '.');
			storage = new FsStorageAdapter({
				basePath
			});
		}
	}

	const instance = createEdgeCMSCore({
		jwtSecret: finalJwtSecret,
		jwtExpiresIn: overrides.jwtExpiresIn || '7d',
		adminPassword: finalAdminPassword,
		rootDomain,
		antispamSalt,
		powDifficulty,
		storage,
		...overrides
	});

	if (Object.keys(overrides).length === 0) {
		coreInstance = instance;
	}

	return instance;
}

/**
 * Lazily-initialized EdgeCMSCore server singleton.
 * Defers initialization until first property access so Cloudflare Workers
 * per-request platform env & KV bindings are available before boot.
 * @type {ReturnType<typeof createEdgeCMSCore>}
 */
export const core = new Proxy(/** @type {ReturnType<typeof createEdgeCMSCore>} */ ({}), {
	get(_target, prop, receiver) {
		const instance = getCore();
		const value = Reflect.get(instance, prop, receiver);
		return typeof value === 'function' ? value.bind(instance) : value;
	}
});
