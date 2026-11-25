// @ts-check
import { getPosts, getProjects, getSettings } from '$lib/server/content.js';
import { DESIGN_SYSTEM_DOCS } from '$lib/utils/surface.js';

/** @type {import('./$types').RequestHandler} */
export const GET = async ({ locals, url }) => {
	const domain = locals.domain || 'default';
	const siteUrl = `${url.protocol}//${url.host}`;

	const [settings, postsResult, projects] = await Promise.all([
		getSettings(domain).catch(() => ({})),
		getPosts(domain, { limit: 20 }).catch(() => ({ posts: [] })),
		getProjects(domain).catch(() => [])
	]);

	const siteName = settings?.siteName || 'Nido Edge CMS';
	const siteDescription =
		settings?.siteDescription ||
		'An ultra-fast, minimalist Multi-tenant CMS & Headless Content Engine hosted on the Edge.';

	const publishedPosts = (postsResult?.posts || []).filter(
		(/** @type {any} */ post) => post.status === 'PUBLISHED'
	);

	const lines = [
		`# ${siteName}`,
		`> ${siteDescription}`,
		'',
		`- **Site URL**: ${siteUrl}`,
		`- **Tenant Domain**: \`${domain}\``,
		...(settings?.companyName ? [`- **Legal Entity**: ${settings.companyName}`] : []),
		...(settings?.taxId ? [`- **Tax ID (MST)**: ${settings.taxId}`] : []),
		...(settings?.officeAddress ? [`- **Office Address**: ${settings.officeAddress}`] : []),
		...(settings?.contactEmail ? [`- **Contact Email**: ${settings.contactEmail}`] : []),
		'',
		'## Public Routes & Sitemap',
		`- [Home](${siteUrl}/)`,
		`- [Blog & Insights](${siteUrl}/blog)`,
		`- [Projects](${siteUrl}/projects)`,
		`- [Videos](${siteUrl}/videos)`,
		`- [About](${siteUrl}/about)`,
		`- [XML Sitemap](${siteUrl}/sitemap.xml)`,
		''
	];

	if (publishedPosts.length > 0) {
		lines.push('## Latest Published Articles');
		for (const post of publishedPosts.slice(0, 10)) {
			lines.push(
				`- [${post.title}](${siteUrl}/blog/${post.slug})${post.excerpt ? `: ${post.excerpt}` : ''}`
			);
		}
		lines.push('');
	}

	if (Array.isArray(projects) && projects.length > 0) {
		lines.push('## Featured Projects');
		for (const project of projects.slice(0, 10)) {
			lines.push(`- **${project.title}**${project.description ? `: ${project.description}` : ''}`);
		}
		lines.push('');
	}

	lines.push(
		`## ${DESIGN_SYSTEM_DOCS.name} (Agent Reference)`,
		`Philosophy: ${DESIGN_SYSTEM_DOCS.philosophy}`,
		'',
		'### Semantic Design Tokens (Tailwind v4)',
		'#### Backgrounds',
		...DESIGN_SYSTEM_DOCS.tokens.backgrounds.map((t) => `- \`${t.token}\`: ${t.description}`),
		'#### Borders',
		...DESIGN_SYSTEM_DOCS.tokens.borders.map((t) => `- \`${t.token}\`: ${t.description}`),
		'#### Typography',
		...DESIGN_SYSTEM_DOCS.tokens.typography.map((t) => `- \`${t.token}\`: ${t.description}`),
		'#### Utilities & Recipes',
		...DESIGN_SYSTEM_DOCS.tokens.utilities.map((t) => `- \`${t.token}\`: ${t.description}`),
		'- `surface({ variant, radius, interactive, specular, glass })`: Import from `$lib` or `$lib/utils/surface` to compose semantic surfaces.',
		'',
		'### Immutable Laws for AI Code Generation',
		...DESIGN_SYSTEM_DOCS.rules.map((rule, idx) => `${idx + 1}. ${rule}`),
		''
	);

	return new Response(lines.join('\n'), {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600, s-maxage=3600'
		}
	});
};
