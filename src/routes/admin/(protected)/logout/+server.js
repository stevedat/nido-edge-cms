import { redirect } from '@sveltejs/kit';
import { clearAuthCookie } from '$lib/server/auth.js';

export const POST = ({ cookies, url }) => {
	const session = clearAuthCookie(url.protocol === 'https:');
	cookies.set(session.name, session.value, { ...session.options, path: '/' });
	throw redirect(303, '/admin/login');
};
