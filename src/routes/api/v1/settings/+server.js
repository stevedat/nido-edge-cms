// @ts-check
import { core } from '$lib/server/core.js';
import { sanitizePublicSettings } from '$lib/server/content.js';
import { jsonOk, jsonError, corsPreflight } from '$lib/server/api.js';

/**
 * Handle CORS preflight
 */
export async function OPTIONS() {
	return corsPreflight();
}

/**
 * GET /api/v1/settings
 * Public tenant configuration with strict secret masking.
 *
 * @type {import('./$types').RequestHandler}
 */
export async function GET({ request }) {
	const tenant = core.tenant.resolveTenant(request);
	const rawSettings = (await core.content.getSettings(tenant)) || {};

	return jsonOk({
		tenant,
		settings: sanitizePublicSettings(rawSettings)
	});
}

/**
 * Reject mutating methods on public settings endpoint
 */
function methodNotAllowed() {
	return jsonError('Method not allowed', 405);
}

export const POST = methodNotAllowed;
export const PUT = methodNotAllowed;
export const DELETE = methodNotAllowed;
export const PATCH = methodNotAllowed;
