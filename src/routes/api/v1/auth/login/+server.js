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
 * POST /api/v1/auth/login
 * Authenticates master administrator or tenant administrator and issues signed JWT.
 *
 * @type {import('./$types').RequestHandler}
 */
export async function POST({ request, url }) {
	// 1. Safe JSON parsing
	let body;
	try {
		body = await request.json();
	} catch {
		return jsonError('Invalid JSON request body', 400);
	}

	// 2. Validate required password
	if (!body || typeof body !== 'object' || !body.password || typeof body.password !== 'string') {
		return jsonError('Password is required', 400);
	}

	const password = body.password.trim();
	if (!password) {
		return jsonError('Password is required', 400);
	}

	// 3. Multi-tenant target resolution (body -> header -> query -> host -> default)
	const headerTenant = request.headers.get('x-tenant-domain');
	const queryTenant = url.searchParams.get('tenant');
	const targetTenant =
		(body.tenant && typeof body.tenant === 'string' ? body.tenant.trim() : null) ||
		(headerTenant ? headerTenant.trim() : null) ||
		(queryTenant ? queryTenant.trim() : null) ||
		core.tenant.resolveTenant(request) ||
		'default';

	// 4. Retrieve tenant settings for password hash verification
	let tenantSettings = null;
	try {
		tenantSettings = await core.content.getSettings(targetTenant);
	} catch {
		tenantSettings = {};
	}

	// 5. Authenticate credentials via core auth service
	const identifier = body.identifier || body.username || body.email?.split('@')[0] || 'admin';
	const authResult = await core.auth.authenticate(
		{
			password,
			identifier,
			domain: targetTenant
		},
		tenantSettings
	);

	if (!authResult.success) {
		return jsonError('Invalid credentials', 401);
	}

	// 6. Construct unified user profile
	const user = {
		id:
			authResult.user?.id ||
			(targetTenant === 'default' ? 'tenant_default' : `tenant_${targetTenant}`),
		email:
			authResult.user?.email && !authResult.user.email.endsWith('.local')
				? authResult.user.email
				: `${identifier}@${targetTenant}`,
		username: identifier,
		name: authResult.user?.name || tenantSettings?.siteName || 'Administrator',
		role: 'ADMIN',
		tenant: targetTenant
	};

	// 7. Sign JWT containing all standard claims: sub, email, username, role, tenant, exp
	const token = await core.auth.signToken(
		{
			sub: user.id,
			email: user.email,
			username: user.username,
			role: user.role,
			tenant: targetTenant
		},
		'24h'
	);

	// 8. Return success response
	return jsonOk({
		token,
		user
	});
}
