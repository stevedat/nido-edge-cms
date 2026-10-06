import { redirect } from '@sveltejs/kit';

export const load = ({ locals }) => {
	throw redirect(303, locals.isAuthenticated ? '/admin/dashboard' : '/admin/login');
};
