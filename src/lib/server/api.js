// @ts-check
import { json } from '@sveltejs/kit';

/**
 * Standard CORS headers for all Headless REST API responses
 */
export const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
	'Access-Control-Allow-Headers':
		'Content-Type, Authorization, x-tenant-domain, x-pow-token, x-pow-nonce, x-test-bypass-timegate',
	'Access-Control-Max-Age': '86400'
};

/**
 * Respond to OPTIONS preflight requests
 * @returns {Response}
 */
export function corsPreflight() {
	return new Response(null, {
		status: 204,
		headers: CORS_HEADERS
	});
}

/**
 * Standardized JSON success response
 * @param {Record<string, any>} data
 * @param {number} [status=200]
 * @param {HeadersInit} [extraHeaders]
 */
export function jsonOk(data, status = 200, extraHeaders = {}) {
	return json(
		{ success: true, ...data },
		{
			status,
			headers: {
				...CORS_HEADERS,
				...extraHeaders
			}
		}
	);
}

/**
 * Standardized JSON error response
 * @param {string} error
 * @param {number} [status=400]
 * @param {Record<string, any>} [extra]
 */
export function jsonError(error, status = 400, extra = {}) {
	return json(
		{ success: false, error, ...extra },
		{
			status,
			headers: {
				...CORS_HEADERS
			}
		}
	);
}
