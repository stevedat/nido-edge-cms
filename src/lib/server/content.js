// @ts-check
import { core } from './core.js';

/**
 * @typedef {{ slug: string; meta: { title: string; title_en?: string; date: string; tags: string[]; thumbnail: string }; content: string; content_en?: string; excerpt?: string; excerpt_en?: string; title?: string; publishedAt?: string; createdAt?: string; tags?: string[]; tagSlugs?: string[]; thumbnail?: string }} PostEntry
 */

/**
 * Helper to generate plain text excerpt from markdown if missing
 * @param {string} [content]
 * @returns {string}
 */
function cleanExcerptText(content) {
	if (!content) return '';
	return content
		.replace(/#+\s+/g, '')
		.replace(/(\*\*|__)(.*?)\1/g, '$2')
		.replace(/(\*|_)(.*?)\1/g, '$2')
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/<[^>]*>?/gm, '')
		.trim()
		.substring(0, 160) + '...';
}

/**
 * @typedef {{ slug: string; meta: { title: string; title_en?: string; date: string; tags: string[]; thumbnail: string }; excerpt?: string; excerpt_en?: string; readingMinutes: number }} PostSummary
 */

/**
 * Get lightweight post summaries (omitting full content) for index/listing pages
 * @param {string} [domain='default']
 * @returns {Promise<PostSummary[]>}
 */
export const getPostSummaries = async (domain = 'default') => {
	try {
		/** @type {any} */
		const res = await core.content.getPosts(domain, { limit: 100 });
		const posts = Array.isArray(res) ? res : (res?.posts || []);
		return posts.map((/** @type {any} */ post) => {
			const words = (post.content || '').trim().split(/\s+/).filter(Boolean).length;
			const readingMinutes = Math.max(2, Math.ceil(words / 200));
			return {
				slug: post.slug,
				meta: {
					title: post.title,
					title_en: post.title_en || post.title,
					date: post.publishedAt || post.createdAt || new Date().toISOString(),
					tags: post.tags || post.tagSlugs || [],
					thumbnail: post.thumbnail || ''
				},
				excerpt: post.excerpt || cleanExcerptText(post.content),
				excerpt_en: post.excerpt_en || cleanExcerptText(post.content_en || post.content),
				readingMinutes
			};
		});
	} catch (error) {
		console.error('Lỗi khi lấy post summaries:', error);
		return [];
	}
};

/**
 * @param {string} [domain='default']
 * @returns {Promise<PostEntry[]>}
 */
export const getAllPosts = async (domain = 'default') => {
	try {
		/** @type {any} */
		const res = await core.content.getPosts(domain, { limit: 100 });
		const posts = Array.isArray(res) ? res : (res?.posts || []);
		return posts.map((/** @type {any} */ post) => ({
			...post,
			slug: post.slug,
			title: post.title,
			publishedAt: post.publishedAt,
			createdAt: post.createdAt,
			tags: post.tags || post.tagSlugs || [],
			tagSlugs: post.tagSlugs || post.tags || [],
			thumbnail: post.thumbnail || '',
			content: post.content || '',
			content_en: post.content_en || '',
			excerpt: post.excerpt || cleanExcerptText(post.content),
			excerpt_en: post.excerpt_en || cleanExcerptText(post.content_en || post.content),
			meta: {
				title: post.title,
				title_en: post.title_en || post.title,
				date: post.publishedAt || post.createdAt || new Date().toISOString(),
				tags: post.tags || post.tagSlugs || [],
				thumbnail: post.thumbnail || ''
			}
		}));
	} catch (error) {
		console.error('Lỗi khi lấy posts:', error);
		return [];
	}
};

/**
 * @param {string} [domain='default']
 * @param {string} [slug='']
 * @param {boolean} [publishedOnly=false]
 * @returns {Promise<PostEntry | null>}
 */
export const getPost = async (domain = 'default', slug = '', publishedOnly = false) => {
	try {
		const post = await core.content.getPost(domain, slug);
		if (!post) return null;
		
		if (publishedOnly && post.status && post.status !== 'PUBLISHED') return null;
		
		return {
			...post,
			slug: post.slug,
			title: post.title,
			publishedAt: post.publishedAt,
			createdAt: post.createdAt,
			tags: post.tags || post.tagSlugs || [],
			tagSlugs: post.tagSlugs || post.tags || [],
			thumbnail: post.thumbnail || '',
			content: post.content || '',
			content_en: post.content_en || '',
			meta: {
				title: post.title,
				title_en: post.title_en || post.title,
				date: post.publishedAt || post.createdAt || new Date().toISOString(),
				tags: post.tags || post.tagSlugs || [],
				thumbnail: post.thumbnail || ''
			}
		};
	} catch (error) {
		console.error(`Lỗi khi lấy post ${slug}:`, error);
		return null;
	}
};

/**
 * @param {string} [domain='default']
 * @param {any} [options={}]
 * @returns {Promise<any>}
 */
export const getVideos = async (domain = 'default', options = {}) => {
	try {
		const rawVideos = await core.content.getVideos(domain, options);
		const list = rawVideos.map((/** @type {any} */ v) => ({
			id: v.id,
			title: v.title,
			title_en: v.title_en || v.title,
			url: v.url,
			platform: v.platform,
			thumbnail: v.thumbnail,
			description: v.description || '',
			description_en: v.description_en || ''
		}));
		/** @type {any} */
		const result = list;
		result.videos = list;
		result.total = list.length;
		return result;
	} catch (error) {
		console.error('Lỗi khi lấy videos:', error);
		/** @type {any} */
		const empty = [];
		empty.videos = [];
		empty.total = 0;
		return empty;
	}
};

/**
 * @param {string} [domain='default']
 * @param {any} [options={}]
 * @returns {Promise<any>}
 */
export const getProjects = async (domain = 'default', options = {}) => {
	try {
		const rawProjects = await core.content.getProjects(domain, options);
		const list = rawProjects.map((/** @type {any} */ p) => ({
			id: p.id,
			title: p.title,
			tagline: p.tagline || '',
			tagline_en: p.tagline_en || '',
			description: p.description,
			description_en: p.description_en || '',
			highlights: p.highlights || [],
			highlights_en: p.highlights_en || [],
			link: p.url || p.link || p.githubUrl,
			url: p.url || p.link || p.githubUrl,
			tags: p.tags || p.tagSlugs || [],
			tags_en: p.tags_en || p.tagSlugs_en || p.tags || p.tagSlugs || [],
			techSlugs: p.techSlugs || [],
			platforms: p.platforms || ['Web'],
			platforms_en: p.platforms_en || p.platforms || ['Web'],
			appStoreUrl: p.appStoreUrl || '',
			playStoreUrl: p.playStoreUrl || '',
			thumbnail: p.thumbnail,
			categorySlug: p.categorySlug || 'web-development',
			content: p.content
		}));
		/** @type {any} */
		const result = list;
		result.projects = list;
		result.total = list.length;
		return result;
	} catch (error) {
		console.error('Lỗi khi lấy projects:', error);
		/** @type {any} */
		const empty = [];
		empty.projects = [];
		empty.total = 0;
		return empty;
	}
};

/**
 * Invalidate content cache
 * @param {string} [domain]
 * @param {string} [fileName]
 */
export function invalidateContentCache(domain, fileName) {
	core.content.invalidateCache(domain, fileName);
}

// ==================== POSTS (ADMIN) ====================

/**
 * @param {string} [domain='default']
 * @param {any} [options={}]
 * @returns {Promise<{ posts: any[]; total: number; page: number; limit: number; totalPages: number }>}
 */
export async function getPosts(domain = 'default', options = {}) {
	/** @type {any} */
	const res = await core.content.getPosts(domain, options);
	const posts = Array.isArray(res) ? res : (res?.posts || []);
	const total = res?.total !== undefined ? res.total : posts.length;
	const limit = options?.limit || 10;
	return {
		posts,
		total,
		page: options?.page || 1,
		limit,
		totalPages: Math.max(1, Math.ceil(total / limit))
	};
}

export const createPost = (domain = 'default', postData = {}, authorId = 'admin') =>
	core.content.savePost(domain, { ...postData, authorId });

export const updatePost = (domain = 'default', slug = '', postData = {}, authorId = 'admin') =>
	core.content.savePost(domain, { ...postData, slug, authorId });

export const deletePost = (domain = 'default', slug = '', authorId = 'admin') =>
	core.content.deletePost(domain, slug);

// ==================== PROJECTS (ADMIN) ====================

export async function getProject(domain = 'default', id = '') {
	const list = await core.content.getProjects(domain);
	return list.find((/** @type {any} */ p) => p.id === id) || null;
}

export const createProject = (domain = 'default', projectData = {}) =>
	core.content.saveProject(domain, projectData);

export const updateProject = (domain = 'default', id = '', projectData = {}) =>
	core.content.saveProject(domain, { ...projectData, id });

export const deleteProject = (domain = 'default', id = '') =>
	core.content.deleteProject(domain, id);

/**
 * @param {string} [domain='default']
 * @param {any[]} [projects=[]]
 */
export async function saveProjects(domain = 'default', projects = []) {
	for (const p of projects) {
		await core.content.saveProject(domain, p);
	}
	return projects;
}

// ==================== VIDEOS (ADMIN) ====================

export async function getVideo(domain = 'default', id = '') {
	const list = await core.content.getVideos(domain);
	return list.find((/** @type {any} */ v) => v.id === id) || null;
}

export const createVideo = (domain = 'default', videoData = {}) =>
	core.content.createVideo(domain, videoData);

export const updateVideo = (domain = 'default', id = '', videoData = {}) =>
	core.content.updateVideo(domain, id, videoData);

export const deleteVideo = (domain = 'default', id = '') =>
	core.content.deleteVideo(domain, id);

// ==================== SETTINGS ====================

export const getSettings = (domain = 'default') =>
	core.content.getSettings(domain);

export const updateSettings = (domain = 'default', newSettings = {}) =>
	core.content.saveSettings(domain, newSettings);

// ==================== LEADS ====================

export const saveLead = (domain = 'default', leadData = {}) =>
	core.content.addLead(domain || 'default', leadData);

export const getLeads = (domain = 'default') =>
	core.content.getLeads(domain);

export const updateLead = (domain = 'default', leadId = '', updates = {}) =>
	core.content.updateLead(domain || 'default', leadId, updates);

export async function updateLeadStatus(domain = 'default', leadId = '', newStatus = 'NEW', adminNote = '') {
	/** @type {Record<string, any>} */
	const updates = { status: newStatus };
	if (adminNote !== undefined) updates.adminNote = adminNote;
	return await core.content.updateLead(domain || 'default', leadId, updates);
}

export const deleteLead = (domain = 'default', leadId = '') =>
	core.content.deleteLead(domain || 'default', leadId);

// ==================== COMMENTS ====================

/**
 * Remove sensitive fields (email) from comment for public guest viewing
 * @param {any} comment
 * @returns {any}
 */
export function sanitizePublicComment(comment) {
	if (!comment) return comment;
	const { email, ...safe } = comment;
	return safe;
}

/**
 * Invalidate comment cache for a domain and/or post slug
 * @param {string} [domain]
 * @param {string} [slug]
 */
export function invalidateCommentCache(domain, slug) {
	if (domain && slug) {
		core.content.invalidateCache(domain, `comments/${slug}.json`);
	} else if (domain) {
		core.content.invalidateCache(domain);
	}
}

export const getComments = (domain = 'default', slug = '') =>
	core.content.getComments(domain, slug);

export async function getPublicComments(domain = 'default', slug = '') {
	const comments = await core.content.getComments(domain, slug);
	return comments
		.filter((c) => c.status === 'APPROVED' || !c.status)
		.map(sanitizePublicComment);
}

export const addComment = (domain = 'default', slug = '', commentData = {}) =>
	core.content.addComment(domain, slug, commentData);

export async function getAllComments(domain = 'default') {
	/** @type {any} */
	const postsRes = await core.content.getPosts(domain);
	const posts = Array.isArray(postsRes) ? postsRes : (postsRes?.posts || []);
	/** @type {any[]} */
	const allComments = [];
	for (const p of posts) {
		const comments = await core.content.getComments(domain, p.slug);
		allComments.push(...comments);
	}
	return allComments.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
}

export const updateCommentStatus = async (domain = 'default', commentId = '', status = 'APPROVED') => true;

export async function deleteComment(domain = 'default', slugOrId = '', id = '') {
	const commentId = id || slugOrId;
	return await core.content.deleteComment(domain || 'default', '', commentId);
}
