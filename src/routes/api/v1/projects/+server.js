// @ts-check
import { core } from '$lib/server/core.js';
import { jsonOk, corsPreflight } from '$lib/server/api.js';

/**
 * Handle CORS preflight
 */
export async function OPTIONS() {
	return corsPreflight();
}

/**
 * GET /api/v1/projects
 * List showcase projects with featured filter and limit.
 *
 * @type {import('./$types').RequestHandler}
 */
export async function GET({ request, url }) {
	const tenant = core.tenant.resolveTenant(request);

	// 1. Fetch raw projects for tenant (with default fallback)
	const rawProjects = await core.content.getProjects(tenant);
	let projects = Array.isArray(rawProjects) ? [...rawProjects] : [];

	// 2. Filter: Featured (Strict boolean matching, gracefully ignores non-boolean values)
	// Handles query parameter pollution safely (searchParams.get returns the first entry)
	const featuredParam = url.searchParams.get('featured');
	if (featuredParam === 'true') {
		projects = projects.filter((p) => p.featured === true);
	} else if (featuredParam === 'false') {
		projects = projects.filter((p) => p.featured === false);
	}

	// 3. Filter: Limit
	const limitParam = url.searchParams.get('limit');
	if (limitParam !== null) {
		let limit = parseInt(limitParam, 10);
		if (isNaN(limit) || limit < 0) limit = 0;
		projects = projects.slice(0, limit);
	}

	return jsonOk(
		{
			tenant,
			total: projects.length,
			projects
		},
		200,
		{
			'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=86400'
		}
	);
}
