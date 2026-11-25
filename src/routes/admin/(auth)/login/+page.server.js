import { fail, redirect, isRedirect } from '@sveltejs/kit';
import { loginUser, createAuthCookie } from '$lib/server/auth.js';
import { serverT } from '$lib/i18n/index.js';

export const actions = {
	default: async ({ request, cookies, locals, url }) => {
		try {
			const data = await request.formData();
			const identifier = data.get('identifier')?.toString().trim();
			const password = data.get('password')?.toString();

			if (!identifier || !password) {
				return fail(400, { message: serverT('admin.login.missingCredentials', locals.locale) });
			}

			// Normalize identifier to email format if needed
			const email = identifier.includes('@') ? identifier : `${identifier}@example.com`;
			const domain = locals.domain || 'default';

			const result = await loginUser(email, password, domain);

			if (!result.success) {
				return fail(401, { message: result.message });
			}

			// Set auth session cookie (Secure on HTTPS, Lax for CSRF protection)
			const isSecure = url.protocol === 'https:';
			const authCookie = createAuthCookie(result.token || '', isSecure);
			cookies.set(authCookie.name, authCookie.value, authCookie.options);

			// Clear any lingering preview/admin tenant cookies so login always lands cleanly
			cookies.delete('preview_tenant', { path: '/' });
			cookies.delete('admin_tenant', { path: '/' });

			// Redirect to dashboard
			throw redirect(303, '/admin/dashboard');
		} catch (error) {
			if (isRedirect(error)) {
				throw error;
			}
			console.error('Login server error:', error);
			return fail(500, { message: serverT('admin.login.serverError', locals.locale) });
		}
	}
};
