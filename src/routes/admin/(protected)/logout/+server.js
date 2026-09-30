import { redirect } from '@sveltejs/kit';
import { clearAuthCookie } from '$lib/server/auth.js';

export const POST = ({ cookies }) => {
	const session = clearAuthCookie();
	cookies.set(session.name, session.value, { ...session.options, path: '/' });
	throw redirect(303, '/admin/login');
};
