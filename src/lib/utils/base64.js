/**
 * Encode a string (including UTF-8 characters) to Base64
 * Compatible with Edge runtimes (Cloudflare Pages, Vercel Edge, Deno)
 * @param {string} str
 * @returns {string}
 */
export function utf8ToBase64(str) {
	const bytes = new TextEncoder().encode(str);
	const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join('');
	return btoa(binString);
}

/**
 * Decode a Base64 string back to UTF-8
 * Compatible with Edge runtimes (Cloudflare Pages, Vercel Edge, Deno)
 * @param {string} b64
 * @returns {string}
 */
export function base64ToUtf8(b64) {
	const binString = atob(b64);
	const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0) || 0);
	return new TextDecoder().decode(bytes);
}

/**
 * Convert an ArrayBuffer (e.g. from File or Blob) to Base64
 * @param {ArrayBuffer} buffer
 * @returns {string}
 */
export function arrayBufferToBase64(buffer) {
	const bytes = new Uint8Array(buffer);
	let binary = '';
	for (let i = 0; i < bytes.byteLength; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
}
