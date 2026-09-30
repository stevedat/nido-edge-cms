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
 * GET /api/v1/auth/verify
 * Authenticates caller via Bearer token or sb-access-token cookie and returns claims.
 *
 * @type {import('./$types').RequestHandler}
 */
export async function GET({ request }) {
	const cookieHeader = request.headers.get('cookie');
	const token = core.auth.extractToken(request, cookieHeader);

	if (!token) {
		return jsonError('Missing authentication token', 401);
	}

	const verification = await core.auth.verifyToken(token);
	if (!verification.valid || !verification.payload) {
		return jsonError('Invalid or expired token', 401);
	}

	const payload = verification.payload;
	return jsonOk({
		user: payload,
		tenant: payload.tenant || 'default'
	});
}
