import { redirect } from '@sveltejs/kit';
import { logout, clearAuthCookie } from '$lib/server/auth.js';

export const load = async ({ request, cookies }) => {
	// Logout user and clear session
	await logout(request, cookies);

	// Clear auth cookie
	const clearCookie = clearAuthCookie();
	cookies.set(clearCookie.name, clearCookie.value, clearCookie.options);

	throw redirect(303, '/admin/login');
};

export const actions = {
	default: async ({ request, cookies }) => {
		// Logout user and clear session
		await logout(request, cookies);

		// Clear auth cookie
		const clearCookie = clearAuthCookie();
		cookies.set(clearCookie.name, clearCookie.value, clearCookie.options);

		throw redirect(303, '/admin/login');
	}
};
