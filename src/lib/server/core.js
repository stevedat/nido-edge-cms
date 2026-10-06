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

	const jwtSecret =
		overrides.jwtSecret ||
		env.JWT_SECRET ||
		(typeof process !== 'undefined' ? process.env?.JWT_SECRET : undefined);

	const adminPassword =
		overrides.adminPassword ||
		env.ADMIN_PASSWORD ||
		(typeof process !== 'undefined' ? process.env?.ADMIN_PASSWORD : undefined);

	if (!jwtSecret) {
		console.warn(
			'⚠️ WARNING: JWT_SECRET is not defined. Please set it in your environment variables.'
		);
		// In a real production setup we should throw, but to allow local builds without .env we use a random fallback
		// that resets on every startup, rendering stored tokens invalid and preventing hardcoded bypass.
	}
	const finalJwtSecret =
		jwtSecret || crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');

	if (!adminPassword) {
		console.warn(
			'⚠️ WARNING: ADMIN_PASSWORD is not defined. Admin login will be disabled/inaccessible.'
		);
	}
	const finalAdminPassword = adminPassword || crypto.randomUUID();

	const rootDomain =
		overrides.rootDomain ||
		env.ROOT_DOMAIN ||
		(typeof process !== 'undefined' ? process.env?.ROOT_DOMAIN : undefined) ||
		'example.com';

	const antispamSalt =
		overrides.antispamSalt ||
		env.ANTISPAM_SALT ||
		(typeof process !== 'undefined' ? process.env?.ANTISPAM_SALT : undefined) ||
		adminPassword;

	const powDifficulty =
		overrides.powDifficulty ||
		env.POW_DIFFICULTY ||
		(typeof process !== 'undefined' ? process.env?.POW_DIFFICULTY : undefined) ||
		'000';

	/** @type {import('$lib/core/storage/interface.js').StorageAdapter} */
	let storage;
	if (overrides.storage) {
		storage = overrides.storage;
	} else {
		const githubToken =
			env.GITHUB_TOKEN || (typeof process !== 'undefined' ? process.env?.GITHUB_TOKEN : undefined);
		const githubRepo =
			env.GITHUB_REPO ||
			(typeof process !== 'undefined' ? process.env?.GITHUB_REPO : undefined) ||
			((env.GITHUB_REPO_OWNER ||
				(typeof process !== 'undefined' ? process.env?.GITHUB_REPO_OWNER : undefined)) &&
			(env.GITHUB_REPO_NAME ||
				(typeof process !== 'undefined' ? process.env?.GITHUB_REPO_NAME : undefined))
				? `${env.GITHUB_REPO_OWNER || process.env?.GITHUB_REPO_OWNER}/${env.GITHUB_REPO_NAME || process.env?.GITHUB_REPO_NAME}`
				: null);

		const storageType =
			env.STORAGE_ADAPTER ||
			(typeof process !== 'undefined' ? process.env?.STORAGE_ADAPTER : undefined);

		if (storageType === 'cloudflare-kv') {
			// In Cloudflare Workers, bindings are available on event.platform.env
			// We expose a global reference that hooks.server.js will populate
			storage = new CloudflareKVAdapter(() => /** @type {any} */ (globalThis).__KV_BINDING__);
		} else if (storageType === 'github' && githubToken && githubRepo) {
			storage = new GitHubStorageAdapter({
				token: githubToken,
				repo: githubRepo,
				branch:
					env.GITHUB_BRANCH ||
					(typeof process !== 'undefined' ? process.env?.GITHUB_BRANCH : undefined) ||
					'main'
			});
		} else {
			const basePath =
				env.CONTENT_DIR ||
				(typeof process !== 'undefined' ? process.env?.CONTENT_DIR : undefined) ||
				process.cwd();
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
 * Global EdgeCMSCore server singleton
 */
export const core = getCore();
