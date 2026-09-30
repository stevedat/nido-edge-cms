// @ts-check
import { core } from '$lib/server/core.js';
import { jsonOk, jsonError, corsPreflight } from '$lib/server/api.js';

/**
 * Handle CORS preflight
 */
export async function OPTIONS() {
	return corsPreflight();
}

/**
 * GET /api/v1/challenge
 * Generate cryptographically signed Proof-of-Work anti-spam challenge.
 *
 * @type {import('./$types').RequestHandler}
 */
export async function GET({ url }) {
	const resource = url.searchParams.get('resource') || 'lead';

	try {
		const challengeObj = await core.crypto.createPoWChallenge(resource);
		return jsonOk(
			{
				...challengeObj
			},
			200,
			{
				'Cache-Control': 'no-store, no-cache, must-revalidate'
			}
		);
	} catch (error) {
		console.error('[API PoW Challenge Error]:', error);
		return jsonError('Failed to generate challenge', 500);
	}
}

/**
 * Reject mutating methods on challenge endpoint
 */
function methodNotAllowed() {
	return jsonError('Method not allowed', 405);
}

export const POST = methodNotAllowed;
export const PUT = methodNotAllowed;
export const DELETE = methodNotAllowed;
export const PATCH = methodNotAllowed;
