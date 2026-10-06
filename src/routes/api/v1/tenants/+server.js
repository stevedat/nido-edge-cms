// @ts-check
import { core } from '$lib/server/core.js';
import { jsonOk, jsonError, corsPreflight } from '$lib/server/api.js';
import { hashPassword, generateRandomPassword } from '$lib/server/auth.js';

export async function OPTIONS() {
	return corsPreflight();
}

/**
 * POST /api/v1/tenants
 * Auto-provision a new tenant.
 * Requires Authorization: Bearer <MASTER_API_KEY>
 *
 * @type {import('./$types').RequestHandler}
 */
export async function POST({ request }) {
	const authHeader = request.headers.get('authorization');
	const masterKey = process.env.MASTER_API_KEY || process.env.NIDO_MASTER_KEY;

	if (!masterKey) {
		return jsonError('Server is not configured with a MASTER_API_KEY for auto-provisioning.', 500);
	}

	if (!authHeader || authHeader !== `Bearer ${masterKey}`) {
		return jsonError('Unauthorized. Invalid or missing Bearer token.', 401);
	}

	try {
		/** @type {any} */
		const body = await request.json();
		const rawDomain = body.domain || '';

		// Clean and normalize domain name
		const domain = rawDomain
			.trim()
			.toLowerCase()
			.replace(/^https?:\/\//, '')
			.replace(/\/.*$/, '')
			.replace(/[^a-z0-9.-]/g, '');

		if (!domain || domain.length < 3) {
			return jsonError(
				'Please provide a valid domain name (minimum 3 characters, e.g. my-tenant.com)',
				400
			);
		}

		// Prevent overriding 'default' or existing domains
		if (domain === 'default' || domain === 'reset') {
			return jsonError(`Domain "${domain}" is reserved.`, 400);
		}

		const settingsCheck = await core.storage.read(`src/content/${domain}/settings.json`);
		if (settingsCheck !== null) {
			return jsonError(`Tenant "${domain}" already exists on the system.`, 409);
		}

		const rawTheme = body.themePreset || 'apple';
		const rawLayout = body.homeLayout || 'editorial';
		const rawSiteTitle = body.siteTitle || '';

		const themePreset = ['apple', 'academic', 'executive', 'wellness'].includes(rawTheme)
			? rawTheme
			: 'apple';
		const homeLayout = ['editorial', 'one_page_consulting', 'bento_portfolio'].includes(rawLayout)
			? rawLayout
			: 'editorial';
		const siteTitle = rawSiteTitle.trim() || `${domain} · Home`;

		const showBlog = body.showBlog !== false;
		const showVideos = body.showVideos !== false;
		const showProjects = body.showProjects !== false;

		// Custom schema mapping provided during provisioning
		const customSchema = body.schema || null;

		// Custom or generated initial password
		const rawPassword = body.adminPassword || '';
		const plainPassword = rawPassword.trim() || generateRandomPassword(12);
		const passwordHash = await hashPassword(plainPassword);

		/** @type {Record<string, string>} */
		const defaultFiles = {
			'settings.json': JSON.stringify(
				{
					siteName: domain,
					siteTitle,
					siteDescription: `Welcome to the official site of ${domain}.`,
					heroTitle: `Digital space of ${domain}`,
					heroBio: `Welcome to the independent website running on the multi-user Edge CMS platform.`,
					themePreset,
					homeLayout,
					showBlog,
					showProjects,
					showVideos,
					adminPasswordHash: passwordHash
				},
				null,
				2
			),
			'posts.json': JSON.stringify(
				[
					{
						id: `post_${Date.now()}`,
						title: `Welcome to ${domain}!`,
						slug: 'welcome-to-new-website',
						excerpt: `The opening article on the independent digital space of ${domain}.`,
						content: `## Welcome to ${domain}\n\nThis is a sample article automatically generated when creating a new tenant. You can log in to the admin panel to edit content, create new articles, update projects and customize brand colors.`,
						status: 'PUBLISHED',
						authorId: 'admin',
						categoryId: 'general',
						categorySlug: 'general',
						publishedAt: new Date().toISOString(),
						tags: ['welcome'],
						tagSlugs: ['welcome'],
						viewCount: 1
					}
				],
				null,
				2
			),
			'projects.json': JSON.stringify(
				[
					{
						id: `proj_${Date.now()}`,
						title: `Featured Project ${domain}`,
						slug: 'featured-project-startup',
						description: `Space introducing products and core competencies of ${domain}.`,
						client: 'Partner Clients',
						category: 'Technology',
						tags: ['Web', 'Design', 'Edge CMS'],
						status: 'COMPLETED',
						featured: true,
						createdAt: new Date().toISOString()
					}
				],
				null,
				2
			),
			'videos.json': JSON.stringify([], null, 2),
			'categories.json': JSON.stringify(
				[{ id: 'general', name: 'General', slug: 'general' }],
				null,
				2
			),
			'tags.json': JSON.stringify([{ id: 'welcome', name: 'Welcome', slug: 'welcome' }], null, 2),
			'leads.json': JSON.stringify([], null, 2)
		};

		if (customSchema && typeof customSchema === 'object') {
			defaultFiles['schema.json'] = JSON.stringify(customSchema, null, 2);
		}

		for (const [file, content] of Object.entries(defaultFiles)) {
			await core.storage.write(
				`src/content/${domain}/${file}`,
				content,
				`feat(tenant): auto-provision space ${domain} [skip ci]`
			);
		}

		return jsonOk(
			{
				message: `Successfully auto-provisioned tenant "${domain}".`,
				tenant: {
					domain,
					adminUrl: `https://${domain}/admin/login`,
					initialPassword: plainPassword
				}
			},
			201
		);
	} catch (error) {
		console.error('Error auto-provisioning tenant:', error);
		const msg = error instanceof Error ? error.message : String(error);
		return jsonError('Invalid request body or initialization error: ' + msg, 400);
	}
}
