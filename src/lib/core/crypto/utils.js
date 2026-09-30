/**
 * Nido Edge CMS - Pure Web Standards Crypto Utilities
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

/**
 * Pure Web Standards base64url encoding (RFC 4648 §5).
 * Uses standard TextEncoder and btoa. Strictly NO Node Buffer.
 * @param {string} str - UTF-8 string to encode
 * @returns {string} base64url-encoded string
 */
export function toBase64Url(str) {
	if (typeof str !== 'string') {
		throw new TypeError('Expected string for toBase64Url');
	}
	const bytes = new TextEncoder().encode(str);
	let binary = '';
	for (let i = 0; i < bytes.length; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Pure Web Standards base64url decoding (RFC 4648 §5).
 * Uses standard atob and TextDecoder. Strictly NO Node Buffer.
 * @param {string} b64 - base64url-encoded string
 * @returns {string} Decoded UTF-8 string
 */
export function fromBase64Url(b64) {
	if (typeof b64 !== 'string') {
		throw new TypeError('Expected string for fromBase64Url');
	}
	let str = b64.replace(/-/g, '+').replace(/_/g, '/');
	while (str.length % 4) {
		str += '=';
	}
	const binary = atob(str);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return new TextDecoder().decode(bytes);
}

/**
 * Timing attack-safe constant time string equality check.
 * Compares all characters without short-circuiting to prevent side-channel timing leaks.
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
export function constantTimeEqual(a, b) {
	if (typeof a !== 'string' || typeof b !== 'string') {
		return false;
	}
	if (a.length !== b.length) {
		return false;
	}
	let mismatch = 0;
	for (let i = 0; i < a.length; i++) {
		mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
	}
	return mismatch === 0;
}

/**
 * Convert Uint8Array or ArrayBuffer to hex string.
 * @param {Uint8Array|ArrayBuffer} bytes
 * @returns {string}
 */
export function bytesToHex(bytes) {
	const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
	let hex = '';
	for (let i = 0; i < u8.length; i++) {
		hex += u8[i].toString(16).padStart(2, '0');
	}
	return hex;
}

/**
 * Convert hex string to Uint8Array.
 * @param {string} hex
 * @returns {Uint8Array}
 */
export function hexToBytes(hex) {
	if (typeof hex !== 'string' || hex.length % 2 !== 0) {
		throw new Error('Invalid hex string');
	}
	const buffer = new ArrayBuffer(hex.length / 2);
	const bytes = new Uint8Array(buffer);
	for (let i = 0; i < hex.length; i += 2) {
		bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
	}
	return bytes;
}
