import { getPosts, getVideos, getProjects } from '$lib/server/content.js';
import { getLeads } from '$lib/server/content.js';
import { getAllComments } from '$lib/server/content.js';
import { SITE_URL } from '$lib/config.js';

export const load = async ({ locals }) => {
	const user = locals.user;
	const domain = locals.domain || 'default';

	try {
		// Fetch fresh operational data for admin workspace
		const [postsData, videosData, projectsData, leads, comments] = await Promise.all([
			getPosts(domain, { limit: 50 }).catch(() => ({ total: 0, posts: [] })),
			getVideos(domain, { limit: 50 }).catch(() => ({ total: 0, videos: [] })),
			getProjects(domain, { limit: 50 }).catch(() => ({ total: 0, projects: [] })),
			getLeads(domain).catch(() => []),
			getAllComments(domain).catch(() => [])
		]);

		/** @type {any[]} */
		const allPosts = postsData.posts || [];
		const publishedPostsCount = allPosts.filter((p) => p.status === 'PUBLISHED').length;
		const draftPostsCount = allPosts.filter((p) => p.status === 'DRAFT').length;

		return {
			user,
			siteUrl: SITE_URL,
			stats: {
				posts: postsData.total || allPosts.length,
				publishedPosts: publishedPostsCount,
				draftPosts: draftPostsCount,
				videos: videosData.total || (videosData.videos ? videosData.videos.length : 0),
				projects: projectsData.total || (projectsData.projects ? projectsData.projects.length : 0),
				leads: leads.length,
				comments: comments.length
			},
			recentLeads: leads.slice(0, 6),
			recentPosts: allPosts.slice(0, 5).map((/** @type {any} */ post) => ({
				id: post.id,
				title: post.title,
				slug: post.slug,
				status: post.status,
				createdAt: post.publishedAt || post.date || new Date().toISOString(),
				author: { name: 'Admin', username: 'admin' },
				tagCount: post.tagSlugs?.length || post.tags?.length || 0,
				viewCount: post.viewCount || 0
			})),
			recentComments: comments.slice(0, 4).map((c) => ({
				id: c.id,
				name: c.name,
				email: c.email || '',
				content: c.content,
				postSlug: c.postSlug,
				createdAt: c.createdAt,
				isAuthor: Boolean(c.isAuthor)
			}))
		};
	} catch (error) {
		console.error('Dashboard load error:', error);
		return {
			user,
			siteUrl: SITE_URL,
			stats: {
				posts: 0,
				publishedPosts: 0,
				draftPosts: 0,
				videos: 0,
				projects: 0,
				leads: 0,
				comments: 0
			},
			recentLeads: [],
			recentPosts: [],
			recentComments: []
		};
	}
};
