import { redirect } from '@sveltejs/kit';
import { logout, clearAuthCookie } from '$lib/server/auth.js';

export const load = async ({ request, cookies, url }) => {
	await logout(request, cookies);

	const clearCookie = clearAuthCookie(url.protocol === 'https:');
	cookies.set(clearCookie.name, clearCookie.value, clearCookie.options);

	throw redirect(303, '/admin/login');
};

export const actions = {
	default: async ({ request, cookies, url }) => {
		await logout(request, cookies);

		const clearCookie = clearAuthCookie(url.protocol === 'https:');
		cookies.set(clearCookie.name, clearCookie.value, clearCookie.options);

		throw redirect(303, '/admin/login');
	}
};
