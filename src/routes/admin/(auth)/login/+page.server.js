import { fail, redirect } from '@sveltejs/kit';
import { loginUser } from '$lib/server/auth.js';
import { createAuthCookie, getClientIP, getUserAgent } from '$lib/server/auth.js';

export const actions = {
	default: async ({ request, cookies, locals }) => {
		try {
			const data = await request.formData();
			const identifier = data.get('identifier')?.toString().trim();
			const password = data.get('password')?.toString();

			console.log('🔐 Login attempt:', { identifier, hasPassword: !!password });

			if (!identifier || !password) {
				console.log('❌ Missing credentials');
				return fail(400, { message: 'Vui lòng nhập đầy đủ thông tin' });
			}

			// Normalize identifier to email format if needed
			const email = identifier.includes('@') ? identifier : `${identifier}@example.com`;
			console.log('📧 Using email:', email);

			const userAgent = getUserAgent(request);
			const ipAddress = getClientIP(request);
			const domain = locals.domain || 'default';

			console.log('🌐 Request info:', { domain, userAgent, ipAddress });

			const result = await loginUser(email, password, domain, userAgent, ipAddress);

			console.log('🔑 Login result:', { success: result.success, message: result.message });

			if (!result.success) {
				return fail(401, { message: result.message });
			}

			// Set auth session cookie
			const authCookie = createAuthCookie(result.token || '');
			cookies.set(authCookie.name, authCookie.value, authCookie.options);

			// Clear any lingering preview/admin tenant cookies so login always lands on default workspace
			cookies.delete('preview_tenant', { path: '/' });
			cookies.delete('admin_tenant', { path: '/' });

			// Redirect to dashboard
			throw redirect(303, '/admin/dashboard');
		} catch (error) {
			if (/** @type {any} */ (error).status === 303) {
				// This is the redirect, re-throw it
				throw error;
			}
			console.error('❌ Login server error:', error);
			return fail(500, { message: 'Lỗi hệ thống, vui lòng thử lại' });
		}
	}
};
