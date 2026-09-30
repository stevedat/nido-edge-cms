// @ts-check
import { core } from '$lib/server/core.js';
import { jsonOk, jsonError, corsPreflight } from '$lib/server/api.js';

const SENSITIVE_FIELDS = [
	'adminPassword',
	'adminPasswordHash',
	'jwtSecret',
	'secret',
	'githubToken',
	'antispamSalt',
	'antispamSecret',
	'encryptionKey'
];

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

	// Strictly mask all private credentials, hashes, and secrets
	const publicSettings = { ...rawSettings };
	for (const key of SENSITIVE_FIELDS) {
		delete publicSettings[key];
	}

	return jsonOk({
		tenant,
		settings: publicSettings
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
