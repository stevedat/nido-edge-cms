/**
 * Nido Edge CMS - Web Standards PBKDF2 Password Hashing
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
import { bytesToHex, hexToBytes, constantTimeEqual } from './utils.js';

/**
 * Hashes a password using PBKDF2-SHA256 with a random salt.
 * 100% Web Crypto API compatible (Node.js 18+, Vercel Edge, Cloudflare Workers).
 *
 * @param {string} password
 * @returns {Promise<string>} Format: "pbkdf2:salt_hex:hash_hex"
 */
export async function hashPassword(password) {
	if (typeof password !== 'string') {
		throw new TypeError('Password must be a string');
	}

	const salt = crypto.getRandomValues(new Uint8Array(16));
	const saltHex = bytesToHex(salt);

	const keyMaterial = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(password),
		{ name: 'PBKDF2' },
		false,
		['deriveBits']
	);

	const derivedBits = await crypto.subtle.deriveBits(
		{
			name: 'PBKDF2',
			salt,
			iterations: 100000,
			hash: 'SHA-256'
		},
		keyMaterial,
		256
	);

	const hashHex = bytesToHex(derivedBits);
	return `pbkdf2:${saltHex}:${hashHex}`;
}

/**
 * Verifies a password against a stored PBKDF2 hash using constant-time comparison.
 *
 * @param {string} password
 * @param {string} storedHash Format: "pbkdf2:salt_hex:hash_hex"
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(password, storedHash) {
	if (
		typeof password !== 'string' ||
		typeof storedHash !== 'string' ||
		!storedHash.startsWith('pbkdf2:')
	) {
		return false;
	}

	const parts = storedHash.split(':');
	if (parts.length !== 3) return false;

	const saltHex = parts[1];
	const expectedHashHex = parts[2];

	if (!saltHex || !expectedHashHex || saltHex.length !== 32 || expectedHashHex.length !== 64) {
		return false;
	}

	try {
		const salt = hexToBytes(saltHex);

		const keyMaterial = await crypto.subtle.importKey(
			'raw',
			new TextEncoder().encode(password),
			{ name: 'PBKDF2' },
			false,
			['deriveBits']
		);

		const derivedBits = await crypto.subtle.deriveBits(
			{
				name: 'PBKDF2',
				salt: /** @type {BufferSource} */ (salt),
				iterations: 100000,
				hash: 'SHA-256'
			},
			keyMaterial,
			256
		);

		const hashHex = bytesToHex(derivedBits);
		return constantTimeEqual(hashHex, expectedHashHex);
	} catch {
		return false;
	}
}

/**
 * Generates a human-friendly random password (alphanumeric, no confusing chars like 0/O, 1/l)
 * @param {number} [length=8]
 * @returns {string}
 */
export function generateRandomPassword(length = 8) {
	const chars = '23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
	const randomValues = crypto.getRandomValues(new Uint8Array(length));
	let result = '';
	for (let i = 0; i < length; i++) {
		result += chars[randomValues[i] % chars.length];
	}
	return result;
}
