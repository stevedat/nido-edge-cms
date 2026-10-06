/**
 * Nido Edge CMS - Universal Edge Core Engine
 *
 * Copyright (c) 2026 Steve Dat (@stevedat). All rights reserved.
 * Engineered and Copyrighted by Nido Holdings.
 *
 * This source code is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0-or-later).
 * For commercial, proprietary, or closed-source licensing, see COMMERCIAL.md.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
// @ts-check

// Storage Adapters
export { StorageAdapter } from './storage/interface.js';
export { MemoryStorageAdapter } from './storage/memory.js';
export { FsStorageAdapter } from './storage/fs.js';
export { GitHubStorageAdapter } from './storage/github.js';
export { CloudflareKVAdapter } from './storage/cloudflare-kv.js';

// Content Engine
export { ContentEngine, slugify } from './content/engine.js';

// Multi-Tenant Resolver
export { resolveTenant, sanitizeTenantDomain } from './tenant/resolver.js';

// Cryptography & PoW
export {
	toBase64Url,
	fromBase64Url,
	constantTimeEqual,
	bytesToHex,
	hexToBytes
} from './crypto/utils.js';
export { hashPassword, verifyPassword, generateRandomPassword } from './crypto/password.js';
export {
	createAntiSpamChallenge,
	verifyPoW,
	solvePoW,
	extractChallengeFromToken,
	resetUsedTokens
} from './crypto/pow.js';

// Authentication & JWT
export { signToken, verifyToken, createJwtService } from './auth/jwt.js';
export { authenticate, getUserFromToken } from './auth/auth-service.js';
export { extractToken, extractBearerToken, extractCookieToken } from './auth/token-extractor.js';

// Core Factory
import { StorageAdapter } from './storage/interface.js';
import { ContentEngine } from './content/engine.js';
import { resolveTenant } from './tenant/resolver.js';
import { hashPassword, verifyPassword, generateRandomPassword } from './crypto/password.js';
import { createAntiSpamChallenge, verifyPoW, solvePoW } from './crypto/pow.js';
import { signToken, verifyToken } from './auth/jwt.js';
import { authenticate, getUserFromToken } from './auth/auth-service.js';
import { extractToken } from './auth/token-extractor.js';

/**
 * @typedef {Object} CoreConfig
 * @property {string} [rootDomain='example.com'] - Root domain mapping to default tenant
 * @property {string} jwtSecret - Secret key for signing and verifying HS256 JWTs
 * @property {string} [jwtExpiresIn='7d'] - Expiration duration for signed JWTs
 * @property {string} [adminPassword] - Master admin override password
 * @property {string} [antispamSalt] - Secret key for HMAC anti-spam tokens
 * @property {string} [powDifficulty='000'] - Proof-of-Work difficulty prefix
 * @property {StorageAdapter} storage - Persistence storage adapter
 */

/**
 * Factory creating an isolated EdgeCMSCore instance with dependency-injected configuration.
 * Contains ZERO imports from @sveltejs/kit, $app/*, or $env/*.
 *
 * @param {CoreConfig} config
 */
export function createEdgeCMSCore(config) {
	if (!config) {
		throw new Error('createEdgeCMSCore requires a configuration object');
	}
	if (!config.storage || !(config.storage instanceof StorageAdapter)) {
		throw new Error('createEdgeCMSCore requires a valid StorageAdapter instance');
	}
	if (!config.jwtSecret) {
		throw new Error('createEdgeCMSCore requires jwtSecret');
	}

	const storage = config.storage;
	const content = new ContentEngine(storage);

	const rootDomain = config.rootDomain || 'example.com';
	const jwtSecret = config.jwtSecret;
	const jwtExpiresIn = config.jwtExpiresIn || '7d';
	const antispamSecret =
		config.antispamSalt || config.adminPassword || 'edge-cms-core-antispam-salt';
	const powDifficulty = config.powDifficulty || '000';

	return {
		config,
		tenant: {
			/**
			 * @param {Request | { headers: Headers | { get(name: string): string | null }, url?: string }} request
			 * @param {{ rootDomain?: string }} [opt]
			 * @returns {string}
			 */
			resolveTenant: (request, opt) =>
				resolveTenant(request, { rootDomain: opt?.rootDomain || rootDomain })
		},
		crypto: {
			hashPassword,
			verifyPassword,
			generateRandomPassword,
			/**
			 * @param {string} resource
			 */
			createPoWChallenge: (resource) =>
				createAntiSpamChallenge(resource, antispamSecret, powDifficulty),
			/**
			 * @param {string} token
			 * @param {number|string} nonce
			 * @param {string} resource
			 * @param {any} [options]
			 */
			verifyPoW: (token, nonce, resource, options = {}) =>
				verifyPoW(token, nonce, resource, antispamSecret, {
					difficulty: powDifficulty,
					...options
				}),
			/**
			 * @param {string | { challenge?: string; token?: string; difficulty?: string }} tokenOrChallenge
			 * @param {string} [diff]
			 */
			solvePoW: (tokenOrChallenge, diff) => solvePoW(tokenOrChallenge, diff || powDifficulty)
		},
		auth: {
			/**
			 * @param {Record<string, any>} payload
			 * @param {string} [expiresIn]
			 */
			signToken: (payload, expiresIn) => signToken(payload, jwtSecret, expiresIn || jwtExpiresIn),
			/**
			 * @param {string} token
			 */
			verifyToken: (token) => verifyToken(token, jwtSecret),
			/**
			 * @param {{ password: string; identifier?: string; username?: string; domain?: string }} credentials
			 * @param {any} [tenantSettings]
			 */
			authenticate: (credentials, tenantSettings) =>
				authenticate(credentials, config, tenantSettings),
			/**
			 * @param {any} request
			 * @param {string | null} [cookieHeader]
			 */
			extractToken: (request, cookieHeader) => extractToken(request, cookieHeader),
			/**
			 * @param {string} token
			 */
			getUserFromToken: (token) => getUserFromToken(token, jwtSecret)
		},
		content,
		storage
	};
}
