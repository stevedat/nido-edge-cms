// @ts-check

/**
 * Parse a standard Cookie header string into key-value pairs
 * @param {string} cookieHeader
 * @returns {Record<string, string>}
 */
function parseCookies(cookieHeader) {
	/** @type {Record<string, string>} */
	const cookies = {};
	if (!cookieHeader || typeof cookieHeader !== 'string') return cookies;

	const pairs = cookieHeader.split(';');
	for (let i = 0; i < pairs.length; i++) {
		const pair = pairs[i].trim();
		const eqIdx = pair.indexOf('=');
		if (eqIdx !== -1) {
			const key = pair.substring(0, eqIdx).trim();
			const val = pair.substring(eqIdx + 1).trim();
			try {
				cookies[key] = decodeURIComponent(val);
			} catch {
				cookies[key] = val;
			}
		}
	}
	return cookies;
}

/**
 * Extract bearer token from Authorization header string
 * @param {string | null | undefined} authHeader
 * @returns {string | null}
 */
export function extractBearerToken(authHeader) {
	if (!authHeader || typeof authHeader !== 'string') return null;
	const match = authHeader.match(
		/^Bearer\s+([A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*)$/i
	);
	if (match) {
		return match[1];
	}
	if (authHeader.startsWith('Bearer ')) {
		return authHeader.substring(7).trim() || null;
	}
	return null;
}

/**
 * Extract token from cookie string with fallback names
 * @param {string | null | undefined} cookieHeader
 * @param {string[]} [cookieNames=['sb-access-token', 'auth-token']]
 * @returns {string | null}
 */
export function extractCookieToken(cookieHeader, cookieNames = ['sb-access-token', 'auth-token']) {
	if (!cookieHeader || typeof cookieHeader !== 'string') return null;
	const cookies = parseCookies(cookieHeader);
	for (const name of cookieNames) {
		if (cookies[name]) {
			return cookies[name];
		}
	}
	return null;
}

/**
 * Extract auth token from Request (headers & cookies) or explicit cookie header
 * @param {Request | { headers: Headers | { get(name: string): string | null } } | null | undefined} request
 * @param {string | null} [cookieHeader]
 * @returns {string | null}
 */
export function extractToken(request, cookieHeader = null) {
	// 1. Check Authorization header
	if (request && typeof request === 'object' && 'headers' in request && request.headers) {
		const authHeader = request.headers.get('authorization');
		const bearerToken = extractBearerToken(authHeader);
		if (bearerToken) return bearerToken;

		// 2. Check Cookie header from request if not explicitly passed
		if (!cookieHeader) {
			cookieHeader = request.headers.get('cookie');
		}
	}

	// 3. Check Cookie header
	if (cookieHeader) {
		const cookieToken = extractCookieToken(cookieHeader);
		if (cookieToken) return cookieToken;
	}

	return null;
}
