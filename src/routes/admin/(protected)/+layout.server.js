export async function load({ locals }) {
	return {
		user: locals.user,
		domain: locals.domain || 'default'
	};
}
