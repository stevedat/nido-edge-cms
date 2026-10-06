/**
 * Nido Edge CMS - Edge JWT Authentication Service
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
import { SignJWT, jwtVerify } from 'jose';

/**
 * Sign a JWT using HS256 algorithm via jose
 * @param {Record<string, any>} payload
 * @param {string} secret
 * @param {string} [expiresIn='7d']
 * @returns {Promise<string>}
 */
export async function signToken(payload, secret, expiresIn = '7d') {
	if (!secret || typeof secret !== 'string') {
		throw new Error('JWT secret must be a non-empty string');
	}
	const secretKey = new TextEncoder().encode(secret);
	return await new SignJWT({ ...payload })
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime(expiresIn)
		.sign(secretKey);
}

/**
 * Verify a JWT using HS256 algorithm via jose
 * @param {string} token
 * @param {string} secret
 * @returns {Promise<{ valid: boolean; payload?: any; error?: string; code?: string }>}
 */
export async function verifyToken(token, secret) {
	if (!token || typeof token !== 'string') {
		return { valid: false, error: 'Missing token', code: 'ERR_MISSING_TOKEN' };
	}
	if (!secret || typeof secret !== 'string') {
		return { valid: false, error: 'Missing secret', code: 'ERR_MISSING_SECRET' };
	}

	try {
		const secretKey = new TextEncoder().encode(secret);
		const { payload } = await jwtVerify(token, secretKey, { algorithms: ['HS256'] });
		return { valid: true, payload };
	} catch (err) {
		return {
			valid: false,
			error: err instanceof Error ? err.message : 'Invalid token',
			code: /** @type {any} */ (err)?.code || 'ERR_INVALID_TOKEN'
		};
	}
}

/**
 * Factory for a stateful JWT service bound to a specific secret
 * @param {{ secret: string; expiresIn?: string }} config
 */
export function createJwtService(config) {
	const secret = config.secret;
	const defaultExpiresIn = config.expiresIn || '7d';

	return {
		/**
		 * @param {Record<string, any>} payload
		 * @param {string} [expiresIn]
		 */
		sign: (payload, expiresIn) => signToken(payload, secret, expiresIn || defaultExpiresIn),
		/**
		 * @param {string} token
		 */
		verify: (token) => verifyToken(token, secret)
	};
}
