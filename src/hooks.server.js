import { redirect } from '@sveltejs/kit';
import { getCurrentUser } from '$lib/server/auth.js';
import { getSettings } from '$lib/server/content.js';

const ADMIN_PATH = '/admin';

export const handle = async ({ event, resolve }) => {
	// Global CORS preflight and headers for all /api/v1/ routes
	if (event.url.pathname.startsWith('/api/v1/')) {
		const allowedOrigins = process.env.ALLOWED_ORIGINS || '*';
		const origin = event.request.headers.get('origin') || '';
		
		const corsOrigin = allowedOrigins === '*' 
			? '*' 
			: (allowedOrigins.split(',').map(s => s.trim()).includes(origin) ? origin : allowedOrigins.split(',')[0]);

		if (event.request.method === 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers: {
					'Access-Control-Allow-Origin': corsOrigin,
					'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
					'Access-Control-Allow-Headers':
						'Content-Type, Authorization, x-tenant-domain, x-pow-token, x-pow-nonce, x-test-bypass-timegate',
					'Access-Control-Max-Age': '86400'
				}
			});
		}

		const response = await resolve(event);
		response.headers.set('Access-Control-Allow-Origin', corsOrigin);
		response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
		response.headers.set(
			'Access-Control-Allow-Headers',
			'Content-Type, Authorization, x-tenant-domain, x-pow-token, x-pow-nonce, x-test-bypass-timegate'
		);
		return response;
	}

	const isAdminRoute = event.url.pathname.startsWith(ADMIN_PATH);
	const isLoginRoute = event.url.pathname.startsWith(`${ADMIN_PATH}/login`);
	const isPublicAdminRoute = [
		`${ADMIN_PATH}/login`,
		`${ADMIN_PATH}/unauthorized`
	].includes(event.url.pathname);

	// Fast path: Only resolve authentication on admin routes or when auth cookie is present
	const hasAuthCookie = Boolean(event.cookies.get('sb-access-token') || event.cookies.get('auth-token'));
	let user = null;
	if (isAdminRoute || hasAuthCookie) {
		user = await getCurrentUser(event.request, event.cookies);
	}
	event.locals.user = user;
	event.locals.isAuthenticated = !!user;

	// Extract domain for multi-tenant CMS
	let domain = event.url.hostname.toLowerCase().replace(/^www\./, '');
	if (
		domain === (process.env.ROOT_DOMAIN || 'example.com') || domain.endsWith('.' + (process.env.ROOT_DOMAIN || 'example.com')) ||
		domain.endsWith('.vercel.app') ||
		domain.endsWith('.pages.dev')
	) {
		domain = 'default';
	}
	if (domain === 'localhost' || domain === '127.0.0.1') {
		const queryTenant = event.url.searchParams.get('tenant');
		const headerTenant = event.request.headers.get('x-tenant-domain');

		if (isAdminRoute) {
			// Admin routes: Always default to 'default' unless explicitly specified for admin
			if (queryTenant) {
				if (queryTenant === 'default' || queryTenant === 'reset') {
					domain = 'default';
					event.cookies.delete('admin_tenant', { path: '/' });
				} else {
					domain = queryTenant;
					event.cookies.set('admin_tenant', queryTenant, { path: '/', httpOnly: false, sameSite: 'lax', maxAge: 86400 });
				}
			} else if (headerTenant) {
				domain = headerTenant;
			} else {
				// Check admin-specific cookie, fallback to 'default' (never use storefront preview_tenant)
				const adminCookieTenant = event.cookies.get('admin_tenant');
				domain = adminCookieTenant || 'default';
			}
		} else {
			// Storefront routes: Support preview_tenant cookie
			const cookieTenant = event.cookies.get('preview_tenant');

			if (queryTenant) {
				if (queryTenant === 'default' || queryTenant === 'reset') {
					domain = 'default';
					event.cookies.delete('preview_tenant', { path: '/' });
				} else {
					domain = queryTenant;
					event.cookies.set('preview_tenant', queryTenant, { path: '/', httpOnly: false, sameSite: 'lax', maxAge: 86400 * 7 });
				}
			} else if (headerTenant) {
				domain = headerTenant;
			} else if (cookieTenant) {
				domain = cookieTenant;
			} else {
				domain = 'default';
			}
		}
	}
	event.locals.domain = domain;


	// Detect locale (Cookie > Accept-Language header > Default 'vi')
	let locale = event.cookies.get('locale');
	if (!locale || (locale !== 'vi' && locale !== 'en')) {
		const acceptLang = event.request.headers.get('accept-language') || '';
		locale = acceptLang.toLowerCase().startsWith('en') ? 'en' : 'vi';
	}
	event.locals.locale = /** @type {'vi' | 'en'} */ (locale);

	// Redirect unauthenticated users from admin routes
	if (isAdminRoute && !isPublicAdminRoute && !user) {
		throw redirect(303, `${ADMIN_PATH}/login`);
	}

	// Enforce Tenant Boundaries & Master Admin Privileges
	if (isAdminRoute && !isPublicAdminRoute && user) {
		if (user.id !== 'admin') {
			// Tenant admin: force domain to be their own domain
			const tenantDomain = user.username; 
			if (domain !== tenantDomain) {
				domain = tenantDomain;
				event.locals.domain = tenantDomain;
			}
			// Block access to master admin pages
			if (event.url.pathname.startsWith(`${ADMIN_PATH}/tenants`)) {
				throw redirect(303, `${ADMIN_PATH}/unauthorized`);
			}
		}
	}

	// Redirect authenticated users from login page
	if (isLoginRoute && user) {
		throw redirect(303, `${ADMIN_PATH}/dashboard`);
	}

	// Resolve theme preset for instant SSR styling
	let themePreset = 'apple';
	let settings = null;
	try {
		settings = await getSettings(domain);
		if (settings?.themePreset) themePreset = settings.themePreset;
	} catch (_) {}
	event.locals.settings = settings;

	const response = await resolve(event, {
		transformPageChunk: ({ html }) =>
			html
				.replace('%lang%', locale)
				.replace('%theme%', themePreset)
	});

	// Standard HTTP Security Headers for all responses
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('X-Frame-Options', 'SAMEORIGIN');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

	// Safe Cache-Control Partitioning
	if (!response.headers.has('cache-control')) {
		if (isAdminRoute || event.locals.isAuthenticated) {
			// Never cache admin routes or authenticated views on public CDNs
			response.headers.set('cache-control', 'private, no-store, must-revalidate');
		} else {
			// Fast Edge CDN caching for anonymous guests
			response.headers.set('cache-control', 'public, s-maxage=60, stale-while-revalidate=86400');
		}
	}

	return response;
};
