import { fail } from '@sveltejs/kit';
import { core } from '$lib/server/core.js';
import { sanitizeTenantDomain } from '$lib/core/index.js';
import { hashPassword, generateRandomPassword } from '$lib/server/auth.js';
import { serverT } from '$lib/i18n/index.js';

export const load = async () => {
	/** @type {Array<any>} */
	const tenants = [];

	try {
		const entries = await core.storage.list('src/content');
		const domainSet = new Set();
		for (const entry of entries) {
			const cleanPath = entry.replace(/\\/g, '/').replace(/^src\/content\//, '');
			const parts = cleanPath.split('/');
			if (parts[0]) {
				domainSet.add(parts[0]);
			}
		}

		const domains = Array.from(domainSet);

		for (const domain of domains) {
			let settings = /** @type {Record<string, any>} */ ({});
			let postsCount = 0;
			let projectsCount = 0;
			let videosCount = 0;
			let leadsCount = 0;

			try {
				const settingsRaw = await core.storage.read(`src/content/${domain}/settings.json`);
				if (settingsRaw) settings = JSON.parse(settingsRaw);
			} catch {
				// Ignore missing/invalid settings file
			}

			try {
				const postsRaw = await core.storage.read(`src/content/${domain}/posts.json`);
				if (postsRaw) {
					const posts = JSON.parse(postsRaw);
					postsCount = Array.isArray(posts) ? posts.length : 0;
				}
			} catch {
				// Ignore missing/invalid posts file
			}

			try {
				const projectsRaw = await core.storage.read(`src/content/${domain}/projects.json`);
				if (projectsRaw) {
					const projects = JSON.parse(projectsRaw);
					projectsCount = Array.isArray(projects) ? projects.length : 0;
				}
			} catch {
				// Ignore missing/invalid projects file
			}

			try {
				const videosRaw = await core.storage.read(`src/content/${domain}/videos.json`);
				if (videosRaw) {
					const videos = JSON.parse(videosRaw);
					videosCount = Array.isArray(videos) ? videos.length : 0;
				}
			} catch {
				// Ignore missing/invalid videos file
			}

			try {
				const leadsRaw = await core.storage.read(`src/content/${domain}/leads.json`);
				if (leadsRaw) {
					const leads = JSON.parse(leadsRaw);
					leadsCount = Array.isArray(leads) ? leads.length : 0;
				}
			} catch {
				// Ignore missing/invalid leads file
			}

			tenants.push({
				domain,
				siteName: settings.siteName || domain,
				siteTitle: settings.siteTitle || '',
				themePreset: settings.themePreset || 'apple',
				homeLayout: settings.homeLayout || 'editorial',
				showBlog: settings.showBlog !== false,
				showProjects: settings.showProjects !== false,
				showVideos: settings.showVideos !== false,
				postsCount,
				projectsCount,
				videosCount,
				leadsCount,
				hasCustomPassword: !!settings.adminPasswordHash,
				isDefault: domain === 'default'
			});
		}
	} catch (err) {
		console.warn('[Tenants] Cannot read tenant directory list:', err);
	}

	// Sort default first, then alphabetically
	tenants.sort((a, b) => {
		if (a.isDefault) return -1;
		if (b.isDefault) return 1;
		return a.domain.localeCompare(b.domain);
	});

	return { tenants };
};

export const actions = {
	createTenant: async ({ request, locals }) => {
		const form = await request.formData();
		const rawDomain = form.get('domain')?.toString() || '';

		const stripped = rawDomain
			.trim()
			.toLowerCase()
			.replace(/^https?:\/\//, '')
			.replace(/\/.*$/, '');
		const domain = sanitizeTenantDomain(stripped);

		if (domain === 'default' || domain.length < 3 || stripped.includes('..')) {
			return fail(400, {
				message: serverT('admin.tenants.invalidDomain', locals.locale, {
					defaultValue:
						'Please enter a valid domain name (minimum 3 characters, e.g. my-tenant.com)'
				})
			});
		}

		const settingsCheck = await core.storage.read(`src/content/${domain}/settings.json`);
		if (settingsCheck !== null) {
			return fail(400, {
				message: serverT('admin.tenants.alreadyExists', locals.locale, {
					domain,
					defaultValue: `Tenant "${domain}" already exists on the system!`
				})
			});
		}

		const rawTheme = form.get('themePreset')?.toString() || 'apple';
		const rawLayout = form.get('homeLayout')?.toString() || 'editorial';
		const rawSiteTitle = form.get('siteTitle')?.toString() || '';

		const themePreset = ['apple', 'academic', 'executive', 'wellness'].includes(rawTheme)
			? rawTheme
			: 'apple';
		const homeLayout = ['editorial', 'one_page_consulting', 'bento_portfolio'].includes(rawLayout)
			? rawLayout
			: 'editorial';
		const siteTitle = rawSiteTitle.trim() || `${domain} · Home`;

		const showBlog = form.has('showBlog')
			? form.get('showBlog') === 'true' || form.get('showBlog') === 'on'
			: true;
		const showVideos = form.has('showVideos')
			? form.get('showVideos') === 'true' || form.get('showVideos') === 'on'
			: true;
		const showProjects = form.has('showProjects')
			? form.get('showProjects') === 'true' || form.get('showProjects') === 'on'
			: true;

		// Custom or generated initial password
		const rawPassword = form.get('adminPassword')?.toString() || '';
		const plainPassword = rawPassword.trim() || generateRandomPassword(10);
		const passwordHash = await hashPassword(plainPassword);

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

		try {
			for (const [file, content] of Object.entries(defaultFiles)) {
				await core.storage.write(
					`src/content/${domain}/${file}`,
					content,
					`feat(tenant): initialize space ${domain} [skip ci]`
				);
			}
			core.content.invalidateCache(domain);

			return {
				success: true,
				message: serverT('admin.tenants.createSuccessMsg', locals.locale, {
					domain,
					defaultValue: `Successfully initialized tenant "${domain}" with complete sample data!`
				}),
				newDomain: domain,
				initialPassword: plainPassword
			};
		} catch (error) {
			console.error('Error creating tenant:', error);
			return fail(500, {
				message: serverT('admin.tenants.createError', locals.locale, {
					error: error instanceof Error ? error.message : String(error),
					defaultValue: 'Error initializing tenant'
				})
			});
		}
	},

	resetPassword: async ({ request, locals }) => {
		const form = await request.formData();
		const rawDomain = form.get('domain')?.toString().trim() || '';
		if (
			!rawDomain ||
			rawDomain.includes('..') ||
			rawDomain.includes('/') ||
			rawDomain.includes('\\')
		) {
			return fail(400, {
				message: serverT('admin.tenants.missingDomainReset', locals.locale, {
					defaultValue: 'Missing or invalid domain information to reset password'
				})
			});
		}
		const domain = rawDomain === 'default' ? 'default' : sanitizeTenantDomain(rawDomain);
		if (rawDomain !== 'default' && domain === 'default') {
			return fail(400, {
				message: serverT('admin.tenants.missingDomainReset', locals.locale, {
					defaultValue: 'Missing or invalid domain information to reset password'
				})
			});
		}

		const customPassword = form.get('newPassword')?.toString().trim();
		const newPlainPassword = customPassword || generateRandomPassword(10);
		const newHash = await hashPassword(newPlainPassword);

		try {
			await core.content.saveSettings(domain, { adminPasswordHash: newHash });

			return {
				resetSuccess: true,
				resetDomain: domain,
				resetPassword: newPlainPassword,
				message: serverT('admin.tenants.resetSuccessMsg', locals.locale, {
					domain,
					defaultValue: `Successfully reset password for tenant "${domain}"!`
				})
			};
		} catch (error) {
			console.error('Error resetting tenant password:', error);
			return fail(500, {
				message: serverT('admin.tenants.resetError', locals.locale, {
					error: error instanceof Error ? error.message : String(error),
					defaultValue: 'Cannot reset password'
				})
			});
		}
	}
};
