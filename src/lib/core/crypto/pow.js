/**
 * Nido Edge CMS - Zero-Captcha Proof-of-Work Anti-Spam Engine
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
import { toBase64Url, fromBase64Url, constantTimeEqual, bytesToHex } from './utils.js';

const DEFAULT_POW_DIFFICULTY = '000';
const DEFAULT_MAX_TOKEN_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

/** @type {Map<string, number>} */
const consumedTokens = new Map();

/** @type {Set<string>} */
const inFlightTokens = new Set();

/**
 * Clear the replay protection cache (useful for testing)
 */
export function resetUsedTokens() {
	consumedTokens.clear();
	inFlightTokens.clear();
}

/**
 * Clean up expired consumed tokens
 */
function cleanupConsumedTokens() {
	const now = Date.now();
	for (const [token, ts] of consumedTokens.entries()) {
		if (now - ts > DEFAULT_MAX_TOKEN_AGE_MS) {
			consumedTokens.delete(token);
		}
	}
}

/**
 * Get HMAC-SHA256 signing key from secret string
 * @param {string} secret
 * @returns {Promise<CryptoKey>}
 */
async function getHmacKey(secret) {
	const encoder = new TextEncoder();
	return await crypto.subtle.importKey(
		'raw',
		encoder.encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign', 'verify']
	);
}

/**
 * Create an anti-spam PoW challenge
 * @param {string} resource - Identifier of target resource (e.g. 'leads', slug)
 * @param {string} secret - Cryptographic HMAC secret
 * @param {string} [difficulty='000'] - Leading hex zeros required
 * @returns {Promise<{ challenge: string; token: string; salt: string; difficulty: string; timestamp: number; resource: string }>}
 */
export async function createAntiSpamChallenge(
	resource,
	secret,
	difficulty = DEFAULT_POW_DIFFICULTY
) {
	if (!resource || typeof resource !== 'string') {
		throw new TypeError('resource must be a non-empty string');
	}
	if (!secret || typeof secret !== 'string') {
		throw new TypeError('secret must be a non-empty string');
	}

	const timestamp = Date.now();
	const salt = Math.random().toString(36).substring(2, 10);
	const payload = `${resource}:${timestamp}:${salt}`;

	const key = await getHmacKey(secret);
	const encoder = new TextEncoder();
	const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
	const sigHex = bytesToHex(signatureBuffer);

	const token = `${toBase64Url(payload)}.${sigHex}`;
	const challenge = `${resource}_${salt}_${timestamp}`;

	return {
		challenge,
		token,
		salt,
		difficulty,
		timestamp,
		resource
	};
}

/**
 * Helper to extract challenge string from token
 * @param {string} token
 * @returns {string}
 */
export function extractChallengeFromToken(token) {
	const parts = token.split('.');
	if (parts.length !== 2) {
		throw new Error('Malformed token');
	}
	const payload = fromBase64Url(parts[0]);
	const payloadParts = payload.split(':');
	if (payloadParts.length < 3) {
		throw new Error('Malformed token payload');
	}
	const salt = payloadParts.pop();
	const timestamp = payloadParts.pop();
	const resource = payloadParts.join(':');
	if (!resource || !timestamp || !salt) {
		throw new Error('Malformed token payload');
	}
	return `${resource}_${salt}_${timestamp}`;
}

/**
 * Client/Test solver for Proof-of-Work puzzle.
 * Accepts either a token, a challenge string, or a challenge object.
 * @param {string | { challenge?: string; token?: string; difficulty?: string }} tokenOrChallenge
 * @param {string} [difficulty]
 * @param {number} [maxIterations=1000000]
 * @returns {Promise<number>} Found nonce
 */
export async function solvePoW(tokenOrChallenge, difficulty, maxIterations = 1000000) {
	let challenge = '';
	let targetDifficulty = difficulty || DEFAULT_POW_DIFFICULTY;

	if (typeof tokenOrChallenge === 'object' && tokenOrChallenge !== null) {
		if (tokenOrChallenge.challenge) {
			challenge = tokenOrChallenge.challenge;
		} else if (tokenOrChallenge.token) {
			challenge = extractChallengeFromToken(tokenOrChallenge.token);
		}
		if (tokenOrChallenge.difficulty && !difficulty) {
			targetDifficulty = tokenOrChallenge.difficulty;
		}
	} else if (typeof tokenOrChallenge === 'string') {
		if (tokenOrChallenge.includes('.')) {
			challenge = extractChallengeFromToken(tokenOrChallenge);
		} else {
			challenge = tokenOrChallenge;
		}
	}

	if (!challenge) {
		throw new Error('Invalid challenge or token provided to solvePoW');
	}

	const encoder = new TextEncoder();
	for (let nonce = 0; nonce < maxIterations; nonce++) {
		const data = encoder.encode(challenge + nonce);
		const hashBuffer = await crypto.subtle.digest('SHA-256', data);
		const hashHex = bytesToHex(hashBuffer);

		if (hashHex.startsWith(targetDifficulty)) {
			return nonce;
		}
	}

	throw new Error(`Failed to solve PoW within ${maxIterations} iterations`);
}

/**
 * Verify Proof-of-Work challenge, HMAC signature, and nonce solution.
 * @param {string} token
 * @param {number|string} nonce
 * @param {string} resource
 * @param {string} secret
 * @param {object} [options]
 * @param {string} [options.difficulty='000']
 * @param {number} [options.minTimeMs=0]
 * @param {number} [options.maxAgeMs=DEFAULT_MAX_TOKEN_AGE_MS]
 * @param {boolean} [options.preventReplay=true]
 * @returns {Promise<boolean>}
 */
export async function verifyPoW(token, nonce, resource, secret, options = {}) {
	if (
		!token ||
		typeof token !== 'string' ||
		nonce === undefined ||
		nonce === null ||
		!resource ||
		!secret
	) {
		return false;
	}

	const difficulty = options.difficulty || DEFAULT_POW_DIFFICULTY;
	const minTimeMs = options.minTimeMs ?? 0;
	const maxAgeMs = options.maxAgeMs ?? DEFAULT_MAX_TOKEN_AGE_MS;
	const preventReplay = options.preventReplay ?? true;

	const parts = token.split('.');
	if (parts.length !== 2) return false;

	const [payloadB64, sigHex] = parts;
	let payload = '';
	try {
		payload = fromBase64Url(payloadB64);
	} catch {
		return false;
	}

	const payloadParts = payload.split(':');
	if (payloadParts.length < 3) return false;

	const salt = payloadParts.pop();
	const tokenTimeStr = payloadParts.pop();
	const tokenResource = payloadParts.join(':');
	if (!salt || !tokenTimeStr || !tokenResource) {
		return false;
	}
	if (tokenResource !== resource) {
		return false;
	}

	const timestamp = parseInt(tokenTimeStr, 10);
	if (isNaN(timestamp)) return false;

	const now = Date.now();
	// Reject tokens with timestamps in the future beyond 60s clock skew tolerance
	if (timestamp > now + 60000) {
		return false;
	}
	if (minTimeMs > 0 && now - timestamp < minTimeMs) {
		return false;
	}
	if (now - timestamp > maxAgeMs) {
		return false;
	}

	// Replay prevention check with synchronous in-flight reservation
	if (preventReplay) {
		if (consumedTokens.has(token) || inFlightTokens.has(token)) {
			return false; // Token already consumed or currently being processed
		}
		inFlightTokens.add(token);
	}

	try {
		// Verify HMAC signature
		try {
			const key = await getHmacKey(secret);
			const encoder = new TextEncoder();
			const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
			const expectedSigHex = bytesToHex(signatureBuffer);
			if (!constantTimeEqual(sigHex, expectedSigHex)) {
				return false;
			}
		} catch {
			return false;
		}

		// Verify PoW solution
		try {
			const challenge = `${resource}_${salt}_${timestamp}`;
			const encoder = new TextEncoder();
			const data = encoder.encode(challenge + nonce);
			const hashBuffer = await crypto.subtle.digest('SHA-256', data);
			const hashHex = bytesToHex(hashBuffer);

			if (!hashHex.startsWith(difficulty)) {
				return false;
			}
		} catch {
			return false;
		}

		// Mark token as consumed
		if (preventReplay) {
			consumedTokens.set(token, now);
			if (consumedTokens.size > 1000) {
				cleanupConsumedTokens();
			}
		}

		return true;
	} finally {
		if (preventReplay) {
			inFlightTokens.delete(token);
		}
	}
}
