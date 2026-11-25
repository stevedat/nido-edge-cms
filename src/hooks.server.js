import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getCurrentUser } from '$lib/server/auth.js';
import { getSettings } from '$lib/server/content.js';
import { sanitizeTenantDomain } from '$lib/core/index.js';

const ADMIN_PATH = '/admin';

const CONTENT_SECURITY_POLICY = [
	"default-src 'self'",
	"script-src 'self' 'unsafe-inline'",
	"style-src 'self' 'unsafe-inline'",
	"img-src 'self' data: blob: https:",
	"font-src 'self' data: https:",
	"frame-src 'self' https://www.youtube.com https://player.vimeo.com https://www.tiktok.com https://www.facebook.com https://www.instagram.com",
	"connect-src 'self' https:",
	"object-src 'none'",
	"base-uri 'self'",
	"frame-ancestors 'self'"
].join('; ');

export const handle = async ({ event, resolve }) => {
	// Bridge Cloudflare platform bindings/env from per-request platform to global for the lazy core
	const platformEnv = /** @type {any} */ (event.platform)?.env;
	if (platformEnv) {
		/** @type {any} */ (globalThis).__PLATFORM_ENV__ = platformEnv;
	}
	if (platformEnv?.EDGE_CMS_KV) {
		/** @type {any} */ (globalThis).__KV_BINDING__ = platformEnv.EDGE_CMS_KV;
	} else if (platformEnv?.KV) {
		/** @type {any} */ (globalThis).__KV_BINDING__ = platformEnv.KV;
	}

	const allowedOrigins =
		platformEnv?.ALLOWED_ORIGINS ||
		env.ALLOWED_ORIGINS ||
		(typeof process !== 'undefined' ? process.env?.ALLOWED_ORIGINS : undefined) ||
		'*';
	const rootDomain = (
		platformEnv?.ROOT_DOMAIN ||
		env.ROOT_DOMAIN ||
		(typeof process !== 'undefined' ? process.env?.ROOT_DOMAIN : undefined) ||
		'example.com'
	)
		.toLowerCase()
		.trim();

	// Global CORS preflight and headers for all /api/v1/ routes
	if (event.url.pathname.startsWith('/api/v1/')) {
		const origin = event.request.headers.get('origin') || '';

		const corsOrigin =
			allowedOrigins === '*'
				? '*'
				: allowedOrigins
							.split(',')
							.map((/** @type {string} */ s) => s.trim())
							.includes(origin)
					? origin
					: allowedOrigins.split(',')[0].trim();

		if (event.request.method === 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers: {
					'Access-Control-Allow-Origin': corsOrigin,
					'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
					'Access-Control-Allow-Headers':
						'Content-Type, Authorization, x-tenant-domain, x-pow-token, x-pow-nonce',
					'Access-Control-Max-Age': '86400'
				}
			});
		}

		const response = await resolve(event);
		response.headers.set('Access-Control-Allow-Origin', corsOrigin);
		response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
		response.headers.set(
			'Access-Control-Allow-Headers',
			'Content-Type, Authorization, x-tenant-domain, x-pow-token, x-pow-nonce'
		);
		return response;
	}

	const isAdminRoute = event.url.pathname.startsWith(ADMIN_PATH);
	const isLoginRoute = event.url.pathname.startsWith(`${ADMIN_PATH}/login`);
	const isPublicAdminRoute = [`${ADMIN_PATH}/login`, `${ADMIN_PATH}/unauthorized`].includes(
		event.url.pathname
	);

	// Fast path: Only resolve authentication on admin routes or when auth cookie is present
	const hasAuthCookie = Boolean(
		event.cookies.get('sb-access-token') || event.cookies.get('auth-token')
	);
	let user = null;
	if (isAdminRoute || hasAuthCookie) {
		user = await getCurrentUser(event.request, event.cookies);
	}
	event.locals.user = user;
	event.locals.isAuthenticated = !!user;

	// Extract domain for multi-tenant CMS
	let domain = event.url.hostname.toLowerCase().replace(/^www\./, '');
	if (
		domain === rootDomain ||
		domain.endsWith('.' + rootDomain) ||
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
					const safeQueryTenant = sanitizeTenantDomain(queryTenant);
					domain = safeQueryTenant;
					event.cookies.set('admin_tenant', safeQueryTenant, {
						path: '/',
						httpOnly: false,
						sameSite: 'lax',
						maxAge: 86400
					});
				}
			} else if (headerTenant) {
				domain = sanitizeTenantDomain(headerTenant);
			} else {
				// Check admin-specific cookie, fallback to 'default' (never use storefront preview_tenant)
				const adminCookieTenant = event.cookies.get('admin_tenant');
				domain = adminCookieTenant ? sanitizeTenantDomain(adminCookieTenant) : 'default';
			}
		} else {
			// Storefront routes: Support preview_tenant cookie
			const cookieTenant = event.cookies.get('preview_tenant');

			if (queryTenant) {
				if (queryTenant === 'default' || queryTenant === 'reset') {
					domain = 'default';
					event.cookies.delete('preview_tenant', { path: '/' });
				} else {
					const safeQueryTenant = sanitizeTenantDomain(queryTenant);
					domain = safeQueryTenant;
					event.cookies.set('preview_tenant', safeQueryTenant, {
						path: '/',
						httpOnly: false,
						sameSite: 'lax',
						maxAge: 86400 * 7
					});
				}
			} else if (headerTenant) {
				domain = sanitizeTenantDomain(headerTenant);
			} else if (cookieTenant) {
				domain = sanitizeTenantDomain(cookieTenant);
			} else {
				domain = 'default';
			}
		}
	} else {
		domain = sanitizeTenantDomain(domain);
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
			// Tenant admin: strictly bind domain to authenticated tenant claim / id
			const rawTenant =
				user.tenant ||
				(user.id.startsWith('tenant_') ? user.id.slice('tenant_'.length) : '') ||
				user.username;
			if (!rawTenant) {
				throw redirect(303, `${ADMIN_PATH}/unauthorized`);
			}
			const tenantDomain = sanitizeTenantDomain(rawTenant);
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
	} catch {
		// Fall back to default theme preset when settings are unavailable
	}
	event.locals.settings = settings;

	const response = await resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', locale).replace('%theme%', themePreset)
	});

	// Standard HTTP Security Headers for all responses
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('X-Frame-Options', 'SAMEORIGIN');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
	if (!response.headers.has('Content-Security-Policy')) {
		response.headers.set('Content-Security-Policy', CONTENT_SECURITY_POLICY);
	}

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
