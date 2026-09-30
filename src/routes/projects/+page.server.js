import { getProjects } from '$lib/server/content.js';

export const load = async ({ locals }) => ({
	projects: await getProjects(locals.domain)
});
