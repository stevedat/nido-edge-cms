// @ts-check
import { error } from '@sveltejs/kit';
import { getBinaryFile } from '$lib/server/github.js';
import { base64ToUint8Array } from '$lib/utils/base64.js';

/** @type {Record<string, string>} */
const MIME_MAP = {
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.gif': 'image/gif',
	'.webp': 'image/webp',
	'.svg': 'image/svg+xml'
};

/**
 * Pure Edge-safe extension lookup (avoids node:path)
 * @param {string} filename
 */
const lookupMime = (filename) => {
	const dotIdx = filename.lastIndexOf('.');
	if (dotIdx === -1) return 'application/octet-stream';
	return MIME_MAP[filename.slice(dotIdx).toLowerCase()] ?? 'application/octet-stream';
};

/**
 * Validate relative upload path strictly against path traversal and injection
 * @param {string | undefined} rawPath
 * @returns {string | null}
 */
function sanitizeUploadPath(rawPath) {
	if (!rawPath || typeof rawPath !== 'string') return null;
	if (
		rawPath.startsWith('/') ||
		rawPath.includes('..') ||
		rawPath.includes('\\') ||
		rawPath.includes('\0') ||
		/[?#]/.test(rawPath)
	) {
		return null;
	}

	const segments = rawPath.split('/');
	if (segments.length === 0) return null;
	for (const seg of segments) {
		if (!seg || seg === '.' || seg === '..' || !/^[a-zA-Z0-9._-]+$/.test(seg)) {
			return null;
		}
	}

	return segments.join('/');
}

/** @type {import('./$types').RequestHandler} */
export const GET = async ({ params }) => {
	const safePath = sanitizeUploadPath(params.path);

	if (!safePath) {
		throw error(400, 'Invalid upload path');
	}

	const file = await getBinaryFile(`static/uploads/${safePath}`);

	if (!file || !file.content) {
		throw error(404, 'Upload not found');
	}

	let binary;
	try {
		binary = base64ToUint8Array(file.content);
	} catch {
		throw error(500, 'Failed to decode uploaded file');
	}

	const mime = lookupMime(safePath);
	/** @type {Record<string, string>} */
	const headers = {
		'Content-Type': mime,
		'Cache-Control': 'public, max-age=3600, immutable',
		'X-Content-Type-Options': 'nosniff'
	};

	// Sandbox SVG responses to prevent inline script execution (Stored XSS)
	if (mime === 'image/svg+xml') {
		headers['Content-Security-Policy'] = "default-src 'none'; sandbox";
	} else if (mime === 'application/octet-stream') {
		headers['Content-Disposition'] = 'attachment';
	}

	return new Response(new Uint8Array(binary), { headers });
};
