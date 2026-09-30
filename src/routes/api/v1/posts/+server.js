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
 * GET /api/v1/posts
 * Listing and pagination of published posts with search, tag, category, and locale filtering.
 *
 * @type {import('./$types').RequestHandler}
 */
export async function GET({ request, url }) {
	const tenant = core.tenant.resolveTenant(request);

	// 1. Fetch raw posts for tenant (with default fallback)
	const rawPosts = await core.content.getPosts(tenant);
	let posts = Array.isArray(rawPosts) ? [...rawPosts] : [];

	// 2. Filter: Published only
	posts = posts.filter((p) => p.status === 'PUBLISHED' || !p.status);

	// 3. Filter: Search (multilingual and whitespace-safe)
	const searchParam = url.searchParams.get('search');
	if (searchParam && searchParam.trim()) {
		const q = searchParam.trim().toLowerCase();
		posts = posts.filter(
			(p) =>
				(p.title && p.title.toLowerCase().includes(q)) ||
				(p.title_en && p.title_en.toLowerCase().includes(q)) ||
				(p.excerpt && p.excerpt.toLowerCase().includes(q)) ||
				(p.excerpt_en && p.excerpt_en.toLowerCase().includes(q)) ||
				(p.content && p.content.toLowerCase().includes(q)) ||
				(p.content_en && p.content_en.toLowerCase().includes(q))
		);
	}

	// 4. Filter: Category
	const category = url.searchParams.get('category');
	if (category) {
		posts = posts.filter(
			(p) =>
				p.categorySlug === category ||
				p.category === category ||
				p.categoryId === category
		);
	}

	// 5. Filter: Tag (case-insensitive across tags and tagSlugs)
	const tag = url.searchParams.get('tag');
	if (tag) {
		const qTag = tag.toLowerCase();
		posts = posts.filter(
			(p) =>
				(Array.isArray(p.tags) &&
					p.tags.some((/** @type {any} */ t) => typeof t === 'string' && t.toLowerCase() === qTag)) ||
				(Array.isArray(p.tagSlugs) &&
					p.tagSlugs.some((/** @type {any} */ t) => typeof t === 'string' && t.toLowerCase() === qTag))
		);
	}

	// 6. Chronological Sorting (newest first)
	posts.sort(
		(a, b) =>
			new Date(b.publishedAt || b.date || b.createdAt || 0).getTime() -
			new Date(a.publishedAt || a.date || a.createdAt || 0).getTime()
	);

	// 7. Pagination bounds clamping
	const total = posts.length;

	let page = parseInt(url.searchParams.get('page') || '1', 10);
	if (isNaN(page) || page < 1) page = 1;

	let limit = parseInt(url.searchParams.get('limit') || '10', 10);
	if (isNaN(limit) || limit < 1) limit = 10;
	if (limit > 100) limit = 100;

	const totalPages = Math.ceil(total / limit) || 1;
	const startIndex = (page - 1) * limit;
	const paginated = posts.slice(startIndex, startIndex + limit);

	return jsonOk(
		{
			tenant,
			total,
			page,
			limit,
			totalPages,
			posts: paginated
		},
		200,
		{
			'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=86400'
		}
	);
}
