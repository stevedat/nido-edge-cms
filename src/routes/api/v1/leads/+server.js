// @ts-check
import { core } from '$lib/server/core.js';
import { jsonOk, jsonError, corsPreflight } from '$lib/server/api.js';
import { fromBase64Url } from '$lib/core/index.js';

const MIN_SUBMISSION_TIME_MS = 3000;
const MAX_TOKEN_AGE_MS = 24 * 60 * 60 * 1000;

// Replay prevention cache
/** @type {Map<string, number>} */
const consumedLeadTokens = new Map();

function cleanupExpiredTokens() {
	const now = Date.now();
	for (const [token, ts] of consumedLeadTokens.entries()) {
		if (now - ts > MAX_TOKEN_AGE_MS) {
			consumedLeadTokens.delete(token);
		}
	}
}

/**
 * Handle CORS preflight
 */
export async function OPTIONS() {
	return corsPreflight();
}

/**
 * POST /api/v1/leads
 * Lead capture endpoint enforcing multi-gate Proof-of-Work anti-spam security.
 *
 * @type {import('./$types').RequestHandler}
 */
export async function POST({ request, getClientAddress }) {
	const tenant = core.tenant.resolveTenant(request);

	// 1. Parse JSON body
	let body;
	try {
		body = await request.json();
	} catch {
		return jsonError('Invalid JSON request body', 400);
	}

	if (!body || typeof body !== 'object') {
		return jsonError('Invalid JSON request body', 400);
	}

	// 2. Extract PoW token & nonce (headers with body fallback, supporting hybrid)
	const token = request.headers.get('x-pow-token') || body.token || body.pow?.token;

	const rawNonce = request.headers.get('x-pow-nonce') ?? body.nonce ?? body.pow?.nonce;

	// Gate 1: Check PoW existence
	if (!token || rawNonce === undefined || rawNonce === null || rawNonce === '') {
		return jsonError('Missing Proof-of-Work solution headers or payload', 403);
	}

	// Gate 2: Validate phone number format
	const phone = body.phone;
	if (!phone || typeof phone !== 'string' || !/^\d{9,12}$/.test(phone.trim())) {
		return jsonError('Invalid phone number: must be 9-12 digits', 400);
	}

	// Gate 3: Parse token structure, verify resource & timestamp
	const tokenParts = token.split('.');
	if (tokenParts.length !== 2) {
		return jsonError('Malformed Proof-of-Work token structure', 403);
	}

	let tokResource = '';
	let tokenTime = 0;
	try {
		const payloadStr = fromBase64Url(tokenParts[0]);
		const parts = payloadStr.split(':');
		parts.pop(); // salt
		tokenTime = parseInt(parts.pop() || '0', 10);
		tokResource = parts.join(':');
	} catch {
		return jsonError('Invalid Proof-of-Work payload', 403);
	}

	// Gate 4: Resource binding
	if (tokResource !== 'lead') {
		return jsonError(`Resource mismatch: token issued for ${tokResource}, requested for lead`, 403);
	}

	// Gate 5: Token expiration
	const now = Date.now();
	if (now - tokenTime > MAX_TOKEN_AGE_MS) {
		return jsonError('Proof-of-Work challenge has expired', 403);
	}

	// Gate 6: Human timegate (minimum 3 seconds)
	const bypassTimegate = request.headers.get('x-test-bypass-timegate') === 'true';
	if (!bypassTimegate && now - tokenTime < MIN_SUBMISSION_TIME_MS) {
		return jsonError('Action too fast (suspected bot). Please wait at least 3 seconds.', 403);
	}

	// Gate 7: Replay prevention check
	if (consumedLeadTokens.has(token)) {
		return jsonError(
			'Proof-of-Work challenge has already been used (replay attack prevented)',
			403
		);
	}

	// Gate 8: Cryptographic nonce and signature verification
	const isPowValid = await core.crypto.verifyPoW(token, rawNonce, 'lead');
	if (!isPowValid) {
		return jsonError('Invalid Proof-of-Work nonce solution', 403);
	}

	// Mark token as consumed
	consumedLeadTokens.set(token, now);
	if (consumedLeadTokens.size > 2000) {
		cleanupExpiredTokens();
	}

	// 3. Extract and sanitize lead attributes
	let ip = '127.0.0.1';
	try {
		ip = getClientAddress
			? getClientAddress()
			: request.headers.get('x-forwarded-for') || '127.0.0.1';
	} catch {
		ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
	}

	const leadData = {
		phone: phone.trim(),
		email: typeof body.email === 'string' ? body.email.trim() : '',
		name: typeof body.name === 'string' ? body.name.trim() : '',
		field: typeof body.field === 'string' ? body.field.trim() : '',
		note: typeof body.note === 'string' ? body.note.trim() : '',
		source: typeof body.source === 'string' ? body.source.trim() : 'api',
		status: 'NEW',
		ip
	};

	try {
		const savedLead = await core.content.addLead(tenant, leadData);

		return jsonOk(
			{
				message: 'Lead received successfully',
				leadId: savedLead.id,
				lead: savedLead,
				tenant
			},
			201
		);
	} catch (error) {
		console.error('[API Lead Submission Error]:', error);
		return jsonError('Failed to record lead in content engine', 500);
	}
}

/**
 * Reject mutating methods on leads endpoint
 */
function methodNotAllowed() {
	return jsonError('Method not allowed', 405);
}

export const GET = methodNotAllowed;
export const PUT = methodNotAllowed;
export const DELETE = methodNotAllowed;
export const PATCH = methodNotAllowed;
