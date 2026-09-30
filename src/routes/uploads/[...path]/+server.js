import { error } from '@sveltejs/kit';
import { extname } from 'node:path';
import { getBinaryFile } from '$lib/server/github.js';

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
 * @param {string} filename
 */
const lookupMime = (filename) => MIME_MAP[extname(filename).toLowerCase()] ?? 'application/octet-stream';

export const GET = async ({ params }) => {
	const relativePath = params.path;

	if (!relativePath) {
		throw error(404, 'Missing upload path');
	}

	const file = await getBinaryFile(`static/uploads/${relativePath}`);

	if (!file) {
		throw error(404, 'Upload not found');
	}

	return new Response(file.content, {
		headers: {
			'Content-Type': lookupMime(relativePath),
			'Cache-Control': 'public, max-age=3600, immutable'
		}
	});
};
