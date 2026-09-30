import { getPosts, getSettings } from '$lib/server/content.js';

export const GET = async ({ locals, url }) => {
	const domain = locals.domain || 'default';
	
	// Get base URL dynamically from request to support multi-tenant
	const siteUrl = `${url.protocol}//${url.host}`;

	const { posts } = await getPosts(domain, { limit: 1000 }).catch(() => ({ posts: [] }));
	const settings = await getSettings(domain).catch(() => ({}));

	const today = new Date().toISOString().split('T')[0];
	
	const staticPages = [
		{ loc: `${siteUrl}/`, priority: '1.0', changefreq: 'weekly', lastmod: today }
	];

	if (settings?.showProjects !== false) {
		staticPages.push({ loc: `${siteUrl}/projects`, priority: '0.9', changefreq: 'weekly', lastmod: today });
	}

	if (settings?.showBlog !== false) {
		staticPages.push({ loc: `${siteUrl}/blog`, priority: '0.9', changefreq: 'daily', lastmod: today });
	}

	if (settings?.showVideos !== false && settings?.combineBlogAndVideos !== true) {
		staticPages.push({ loc: `${siteUrl}/videos`, priority: '0.8', changefreq: 'weekly', lastmod: today });
	}

	staticPages.push({ loc: `${siteUrl}/about`, priority: '0.8', changefreq: 'monthly', lastmod: today });

	const postPages = (posts || [])
		.filter((/** @type {any} */ post) => post.status === 'PUBLISHED')
		.map((/** @type {any} */ post) => ({
			loc: `${siteUrl}/blog/${post.slug}`,
			lastmod: post.publishedAt ? new Date(post.publishedAt).toISOString().split('T')[0] : today,
			priority: '0.7',
			changefreq: 'monthly'
		}));

	const allPages = [...staticPages, ...postPages];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${page.loc}</loc>${page.lastmod ? `\n    <lastmod>${page.lastmod}</lastmod>` : ''}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

	return new Response(xml.trim(), {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=3600, s-maxage=3600'
		}
	});
};
