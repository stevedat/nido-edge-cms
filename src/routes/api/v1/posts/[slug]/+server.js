// @ts-check
import { core } from '$lib/server/core.js';
import { jsonOk, jsonError, corsPreflight } from '$lib/server/api.js';

/**
 * Handle CORS preflight
 */
export async function OPTIONS() {
	return corsPreflight();
}

/**
 * GET /api/v1/posts/[slug]
 * Fetch single published post detail by slug with path traversal guard.
 *
 * @type {import('./$types').RequestHandler}
 */
export async function GET({ request, params }) {
	const slug = params.slug;

	// 1. Slug Path Traversal & Integrity Guard
	if (!slug || slug.includes('..') || slug.includes('/') || slug.includes('\\')) {
		return jsonError('Post not found', 404);
	}

	// 2. Resolve Tenant Domain
	const tenant = core.tenant.resolveTenant(request);

	// 3. Fetch Post by Slug
	const post = await core.content.getPostBySlug(tenant, slug);

	// 4. Verify Existence and Published State
	if (!post || (post.status && post.status !== 'PUBLISHED')) {
		return jsonError('Post not found', 404);
	}

	return jsonOk(
		{
			tenant,
			post
		},
		200,
		{
			'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=86400'
		}
	);
}
