/**
 * Nido Edge CMS - Decoupled Headless Content Engine
 *
 * Copyright (c) 2026 Steve Dat (@stevedat). All rights reserved.
 * Engineered and Copyrighted by Nido Holdings.
 *
 * This source code is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0-or-later).
 * For commercial, proprietary, or closed-source licensing, see COMMERCIAL.md.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
// @ts-check
import { StorageAdapter } from '../storage/interface.js';

/**
 * Pure Web Standards slugify helper
 * @param {string} text
 * @returns {string}
 */
export function slugify(text) {
	if (!text) return `item-${Date.now()}`;
	/** @type {Record<string, string>} */
	const vietnameseMap = {
		à: 'a',
		á: 'a',
		ạ: 'a',
		ả: 'a',
		ã: 'a',
		â: 'a',
		ầ: 'a',
		ấ: 'a',
		ậ: 'a',
		ẩ: 'a',
		ẫ: 'a',
		ă: 'a',
		ằ: 'a',
		ắ: 'a',
		ặ: 'a',
		ẳ: 'a',
		ẵ: 'a',
		è: 'e',
		é: 'e',
		ẹ: 'e',
		ẻ: 'e',
		ẽ: 'e',
		ê: 'e',
		ề: 'e',
		ế: 'e',
		ệ: 'e',
		ể: 'e',
		ễ: 'e',
		ì: 'i',
		í: 'i',
		ị: 'i',
		ỉ: 'i',
		ĩ: 'i',
		ò: 'o',
		ó: 'o',
		ọ: 'o',
		ỏ: 'o',
		õ: 'o',
		ô: 'o',
		ồ: 'o',
		ố: 'o',
		ộ: 'o',
		ổ: 'o',
		ỗ: 'o',
		ơ: 'o',
		ờ: 'o',
		ớ: 'o',
		ợ: 'o',
		ở: 'o',
		ỡ: 'o',
		ù: 'u',
		ú: 'u',
		ụ: 'u',
		ủ: 'u',
		ũ: 'u',
		ư: 'u',
		ừ: 'u',
		ứ: 'u',
		ự: 'u',
		ử: 'u',
		ữ: 'u',
		ỳ: 'y',
		ý: 'y',
		ỵ: 'y',
		ỷ: 'y',
		ỹ: 'y',
		đ: 'd',
		À: 'A',
		Á: 'A',
		Ạ: 'A',
		Ả: 'A',
		Ã: 'A',
		Â: 'A',
		Ầ: 'A',
		Ấ: 'A',
		Ậ: 'A',
		Ẩ: 'A',
		Ẫ: 'A',
		Ă: 'A',
		Ằ: 'A',
		Ắ: 'A',
		Ặ: 'A',
		Ẳ: 'A',
		Ẵ: 'A',
		È: 'E',
		É: 'E',
		Ẹ: 'E',
		Ẻ: 'E',
		Ẽ: 'E',
		Ê: 'E',
		Ề: 'E',
		Ế: 'E',
		Ệ: 'E',
		Ể: 'E',
		Ễ: 'E',
		Ì: 'I',
		Í: 'I',
		Ị: 'I',
		Ỉ: 'I',
		Ĩ: 'I',
		Ò: 'O',
		Ó: 'O',
		Ọ: 'O',
		Ỏ: 'O',
		Õ: 'O',
		Ô: 'O',
		Ồ: 'O',
		Ố: 'O',
		Ộ: 'O',
		Ổ: 'O',
		Ỗ: 'O',
		Ơ: 'O',
		Ờ: 'O',
		Ớ: 'O',
		Ợ: 'O',
		Ở: 'O',
		Ỡ: 'O',
		Ù: 'U',
		Ú: 'U',
		Ụ: 'U',
		Ủ: 'U',
		Ũ: 'U',
		Ư: 'U',
		Ừ: 'U',
		Ứ: 'U',
		Ự: 'U',
		Ử: 'U',
		Ữ: 'U',
		Ỳ: 'Y',
		Ý: 'Y',
		Ỵ: 'Y',
		Ỷ: 'Y',
		Ỹ: 'Y',
		Đ: 'D'
	};

	return (
		text
			.split('')
			.map((char) => vietnameseMap[char] || char)
			.join('')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '') || `item-${Date.now()}`
	);
}

/**
 * Sanitize slug for safe filenames and paths
 * @param {string} slug
 * @returns {string}
 */
function cleanSlug(slug) {
	return (slug || '').replace(/[^a-zA-Z0-9-_]/g, '').trim();
}

/**
 * Unified, decoupled ContentEngine managing all CMS entities with in-memory caching
 * and multi-tenant partitioning in src/content/{domain}/.
 */
export class ContentEngine {
	/**
	 * @param {StorageAdapter} storage - Persistence storage adapter
	 * @param {{ cacheTtlMs?: number }} [options]
	 */
	constructor(storage, options = {}) {
		if (!storage || !(storage instanceof StorageAdapter)) {
			throw new Error('ContentEngine requires a valid StorageAdapter instance');
		}
		this.storage = storage;
		this.cacheTtlMs = options.cacheTtlMs || 60 * 1000;
		/** @type {Map<string, { data: any; expiresAt: number; isFallback?: boolean }>} */
		this.cache = new Map();
		/** @type {Map<string, Promise<any>>} */
		this.writeLocks = new Map();
	}

	/**
	 * Sanitize tenant domain identifier to prevent path traversal
	 * @param {string} [tenant]
	 * @returns {string}
	 */
	sanitizeTenant(tenant) {
		if (!tenant || typeof tenant !== 'string') {
			return 'default';
		}
		const cleaned = tenant
			.toLowerCase()
			.trim()
			.replace(/^www\./, '')
			.replace(/[^a-z0-9.-]/g, '');

		if (
			!cleaned ||
			cleaned === 'default' ||
			cleaned === 'reset' ||
			cleaned.includes('..') ||
			cleaned.startsWith('.') ||
			cleaned.endsWith('.') ||
			cleaned.startsWith('-') ||
			cleaned.endsWith('-')
		) {
			return 'default';
		}
		return cleaned;
	}

	/**
	 * Async write lock / queue per storage path to serialize mutations and prevent data loss
	 * @template T
	 * @param {string} tenant
	 * @param {string} fileName
	 * @param {() => Promise<T>} operation
	 * @returns {Promise<T>}
	 */
	async withLock(tenant, fileName, operation) {
		const safeTenant = this.sanitizeTenant(tenant);
		const lockKey = `${safeTenant}/${fileName}`;
		const prev = this.writeLocks.get(lockKey) || Promise.resolve();

		const current = prev.catch(() => {}).then(() => operation());
		this.writeLocks.set(lockKey, current);

		try {
			return await current;
		} finally {
			if (this.writeLocks.get(lockKey) === current) {
				this.writeLocks.delete(lockKey);
			}
		}
	}

	/**
	 * Invalidate cached entry or entire domain
	 * @param {string} [tenant]
	 * @param {string} [fileName]
	 */
	invalidateCache(tenant, fileName) {
		const safeTenant = tenant ? this.sanitizeTenant(tenant) : undefined;
		if (safeTenant && fileName) {
			this.cache.delete(`${safeTenant}/${fileName}`);
		} else if (safeTenant) {
			for (const key of this.cache.keys()) {
				if (key.startsWith(`${safeTenant}/`)) {
					this.cache.delete(key);
				}
			}
		} else {
			this.cache.clear();
		}
	}

	/**
	 * Internal helper to read JSON data with optional fallback to 'default' tenant
	 * @private
	 * @param {string} tenant
	 * @param {string} fileName
	 * @param {any} defaultValue
	 * @param {boolean} [allowFallback=true]
	 * @returns {Promise<any>}
	 */
	async readJson(tenant, fileName, defaultValue = [], allowFallback = true) {
		const safeTenant = this.sanitizeTenant(tenant);
		const cacheKey = `${safeTenant}/${fileName}`;
		const cached = this.cache.get(cacheKey);

		if (cached && Date.now() < cached.expiresAt) {
			if (!cached.isFallback || allowFallback) {
				return Array.isArray(cached.data)
					? [...cached.data]
					: typeof cached.data === 'object' && cached.data !== null
						? { ...cached.data }
						: cached.data;
			}
		}

		// 1. Try reading tenant-specific file
		const tenantPath = `src/content/${safeTenant}/${fileName}`;
		let content = await this.storage.read(tenantPath);
		let isFallback = false;

		// 2. Fallback to default tenant if not found and fallback enabled
		if (content === null && allowFallback && safeTenant !== 'default') {
			const defaultPath = `src/content/default/${fileName}`;
			content = await this.storage.read(defaultPath);
			isFallback = true;
		}

		let parsedData = defaultValue;
		if (content !== null && content !== undefined) {
			try {
				parsedData = JSON.parse(content);
			} catch {
				parsedData = defaultValue;
			}
		}

		// Defensive collection / object type verification
		if (Array.isArray(defaultValue)) {
			if (!Array.isArray(parsedData)) {
				parsedData = defaultValue;
			}
		} else if (defaultValue !== null && typeof defaultValue === 'object') {
			if (parsedData === null || typeof parsedData !== 'object' || Array.isArray(parsedData)) {
				parsedData = defaultValue;
			}
		}

		if (content !== null) {
			this.cache.set(cacheKey, {
				data: parsedData,
				expiresAt: Date.now() + this.cacheTtlMs,
				isFallback
			});
		}

		return Array.isArray(parsedData)
			? [...parsedData]
			: typeof parsedData === 'object' && parsedData !== null
				? { ...parsedData }
				: parsedData;
	}

	/**
	 * Internal helper to write JSON data
	 * @private
	 * @param {string} tenant
	 * @param {string} fileName
	 * @param {any} data
	 * @param {string} [commitMessage]
	 * @returns {Promise<void>}
	 */
	async writeJson(tenant, fileName, data, commitMessage = 'Update content') {
		const safeTenant = this.sanitizeTenant(tenant);
		const cacheKey = `${safeTenant}/${fileName}`;

		this.invalidateCache(safeTenant, fileName);
		this.cache.set(cacheKey, {
			data,
			expiresAt: Date.now() + this.cacheTtlMs,
			isFallback: false
		});

		const filePath = `src/content/${safeTenant}/${fileName}`;
		const jsonString = JSON.stringify(data, null, '\t');
		await this.storage.write(filePath, jsonString, commitMessage);
	}

	// ==================== POSTS ====================

	/**
	 * Get list of posts with optional search, category, and pagination
	 * @param {string} [tenant='default']
	 * @param {any} [options]
	 * @returns {Promise<any[] & { total?: number; pages?: number; posts?: any[] }>}
	 */
	async getPosts(tenant = 'default', options = {}) {
		const {
			page = 1,
			limit = 10,
			search,
			categoryId,
			categorySlug,
			tag,
			publishedOnly = false
		} = options;
		const rawPosts = await this.readJson(tenant, 'posts.json', [], true);
		/** @type {any[]} */
		const allPosts = Array.isArray(rawPosts) ? rawPosts : [];

		let filtered = [...allPosts];

		if (publishedOnly) {
			filtered = filtered.filter((p) => p.status === 'PUBLISHED' || !p.status);
		}

		const catFilter = categorySlug || categoryId;
		if (catFilter) {
			filtered = filtered.filter((p) => p.categorySlug === catFilter || p.categoryId === catFilter);
		}

		if (tag && typeof tag === 'string') {
			const qTag = tag.toLowerCase();
			filtered = filtered.filter(
				(p) =>
					(Array.isArray(p.tags) &&
						p.tags.some((/** @type {any} */ t) => typeof t === 'string' && t.toLowerCase() === qTag)) ||
					(Array.isArray(p.tagSlugs) &&
						p.tagSlugs.some((/** @type {any} */ t) => typeof t === 'string' && t.toLowerCase() === qTag))
			);
		}

		if (search && typeof search === 'string') {
			const s = search.toLowerCase();
			filtered = filtered.filter(
				(p) =>
					(p.title && p.title.toLowerCase().includes(s)) ||
					(p.title_en && p.title_en.toLowerCase().includes(s)) ||
					(p.content && p.content.toLowerCase().includes(s)) ||
					(p.content_en && p.content_en.toLowerCase().includes(s)) ||
					(p.excerpt && p.excerpt.toLowerCase().includes(s)) ||
					(p.excerpt_en && p.excerpt_en.toLowerCase().includes(s))
			);
		}

		// Sort by publishedAt/date descending
		filtered.sort(
			(a, b) =>
				new Date(b.publishedAt || b.date || b.createdAt || 0).getTime() -
				new Date(a.publishedAt || a.date || a.createdAt || 0).getTime()
		);

		const total = filtered.length;
		const skip = (page - 1) * limit;
		const paginated =
			options.page !== undefined || options.limit !== undefined
				? filtered.slice(skip, skip + limit)
				: filtered;

		/** @type {any} */
		const result = paginated;
		result.total = total;
		result.pages = Math.ceil(total / limit);
		result.posts = paginated;

		return result;
	}

	/**
	 * Get single post by slug or ID
	 * @param {string} [tenant='default']
	 * @param {string} [slug='']
	 * @returns {Promise<any | null>}
	 */
	async getPostBySlug(tenant = 'default', slug = '') {
		const rawPosts = await this.readJson(tenant, 'posts.json', [], true);
		const allPosts = Array.isArray(rawPosts) ? rawPosts : [];
		const post = allPosts.find((/** @type {any} */ p) => p.slug === slug || p.id === slug);
		return post || null;
	}

	/**
	 * Legacy alias for getPostBySlug
	 * @param {string} [tenant='default']
	 * @param {string} [identifier='']
	 * @returns {Promise<any | null>}
	 */
	async getPost(tenant = 'default', identifier = '') {
		return this.getPostBySlug(tenant, identifier);
	}

	/**
	 * Create or update a post
	 * @param {string} [tenant='default']
	 * @param {any} [post={}]
	 * @returns {Promise<any>}
	 */
	async savePost(tenant = 'default', post = {}) {
		const safeTenant = this.sanitizeTenant(tenant);
		return this.withLock(safeTenant, 'posts.json', async () => {
			const posts = await this.readJson(safeTenant, 'posts.json', [], false);
			const existingIdx = posts.findIndex(
				(/** @type {any} */ p) =>
					(post.id && p.id === post.id) || (post.slug && p.slug === post.slug)
			);

			let savedPost;
			if (existingIdx !== -1) {
				// Update: Preserve existing slug unless explicitly given
				const existing = posts[existingIdx];
				savedPost = {
					...existing,
					...post,
					slug: post.slug || existing.slug,
					publishedAt:
						post.status === 'PUBLISHED' && !existing.publishedAt
							? new Date().toISOString()
							: post.publishedAt || existing.publishedAt,
					updatedAt: new Date().toISOString()
				};
				posts[existingIdx] = savedPost;
			} else {
				// Create: Generate unique ID and slug
				const slug = post.slug || slugify(post.title);
				savedPost = {
					id: post.id || `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
					title: post.title || '',
					slug,
					content: post.content || '',
					excerpt: post.excerpt || '',
					status: post.status || 'DRAFT',
					authorId: post.authorId || '',
					categoryId: post.categoryId || '',
					categorySlug: post.categorySlug || post.categoryId || '',
					thumbnail: post.thumbnail || '',
					publishedAt:
						post.status === 'PUBLISHED' ? post.publishedAt || new Date().toISOString() : null,
					createdAt: post.createdAt || new Date().toISOString(),
					tags: post.tags || [],
					tagSlugs: post.tagSlugs || post.tags || [],
					...post
				};
				posts.unshift(savedPost);
			}

			await this.writeJson(safeTenant, 'posts.json', posts, `Save article: ${savedPost.title}`);
			return savedPost;
		});
	}

	/**
	 * Delete a post by slug or ID
	 * @param {string} [tenant='default']
	 * @param {string} [slug='']
	 * @returns {Promise<void>}
	 */
	async deletePost(tenant = 'default', slug = '') {
		const safeTenant = this.sanitizeTenant(tenant);
		return this.withLock(safeTenant, 'posts.json', async () => {
			const posts = await this.readJson(safeTenant, 'posts.json', [], false);
			const filtered = posts.filter((/** @type {any} */ p) => p.slug !== slug && p.id !== slug);
			await this.writeJson(safeTenant, 'posts.json', filtered, `Delete article: ${slug}`);
		});
	}

	// ==================== PROJECTS ====================

	/**
	 * Get list of projects
	 * @param {string} [tenant='default']
	 * @param {any} [options]
	 * @returns {Promise<any[]>}
	 */
	async getProjects(tenant = 'default', options = {}) {
		const { featured } = options;
		const rawProjects = await this.readJson(tenant, 'projects.json', [], true);
		/** @type {any[]} */
		let projects = Array.isArray(rawProjects) ? rawProjects : [];

		if (featured !== undefined) {
			projects = projects.filter((p) => Boolean(p.featured) === Boolean(featured));
		}

		return projects;
	}

	/**
	 * Save or update a project
	 * @param {string} [tenant='default']
	 * @param {any} [project={}]
	 * @returns {Promise<any>}
	 */
	async saveProject(tenant = 'default', project = {}) {
		const safeTenant = this.sanitizeTenant(tenant);
		return this.withLock(safeTenant, 'projects.json', async () => {
			const projects = await this.readJson(safeTenant, 'projects.json', [], false);
			const existingIdx = projects.findIndex(
				(/** @type {any} */ p) =>
					(project.id && p.id === project.id) || (project.slug && p.slug === project.slug)
			);

			let saved;
			if (existingIdx !== -1) {
				saved = {
					...projects[existingIdx],
					...project,
					updatedAt: new Date().toISOString()
				};
				projects[existingIdx] = saved;
			} else {
				const id = project.id || `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
				saved = {
					id,
					title: project.title || '',
					description: project.description || '',
					link: project.link || '',
					tags: project.tags || [],
					status: project.status || 'COMPLETED',
					createdAt: project.createdAt || new Date().toISOString(),
					...project
				};
				projects.unshift(saved);
			}

			await this.writeJson(
				safeTenant,
				'projects.json',
				projects,
				`Save project: ${saved.title || saved.id}`
			);
			return saved;
		});
	}

	/**
	 * Delete a project by ID or slug
	 * @param {string} [tenant='default']
	 * @param {string} [id='']
	 * @returns {Promise<void>}
	 */
	async deleteProject(tenant = 'default', id = '') {
		const safeTenant = this.sanitizeTenant(tenant);
		return this.withLock(safeTenant, 'projects.json', async () => {
			const projects = await this.readJson(safeTenant, 'projects.json', [], false);
			const filtered = projects.filter((/** @type {any} */ p) => p.id !== id && p.slug !== id);
			await this.writeJson(safeTenant, 'projects.json', filtered, `Delete project: ${id}`);
		});
	}

	// ==================== VIDEOS ====================

	/**
	 * Get list of videos
	 * @param {string} [tenant='default']
	 * @param {any} [options]
	 * @returns {Promise<any[]>}
	 */
	async getVideos(tenant = 'default', options = {}) {
		const { search } = options;
		const rawVideos = await this.readJson(tenant, 'videos.json', [], true);
		/** @type {any[]} */
		let videos = Array.isArray(rawVideos) ? rawVideos : [];

		if (search && typeof search === 'string') {
			const s = search.toLowerCase();
			videos = videos.filter(
				(v) =>
					(v.title && v.title.toLowerCase().includes(s)) ||
					(v.description && v.description.toLowerCase().includes(s))
			);
		}

		return videos;
	}

	/**
	 * Create a new video entry
	 * @param {string} [tenant='default']
	 * @param {any} [video={}]
	 * @returns {Promise<any>}
	 */
	async createVideo(tenant = 'default', video = {}) {
		if (!video || !video.title || !video.url) {
			throw new Error('Video title and URL are required');
		}

		const safeTenant = this.sanitizeTenant(tenant);
		return this.withLock(safeTenant, 'videos.json', async () => {
			const videos = await this.readJson(safeTenant, 'videos.json', [], false);
			const newVideo = {
				id: video.id || `video_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
				title: video.title,
				url: video.url,
				platform: video.platform || (video.url.includes('vimeo') ? 'VIMEO' : 'YOUTUBE'),
				thumbnail: video.thumbnail || '',
				description: video.description || '',
				authorId: video.authorId || '',
				createdAt: video.createdAt || new Date().toISOString(),
				...video
			};

			videos.unshift(newVideo);
			await this.writeJson(safeTenant, 'videos.json', videos, `Create video: ${newVideo.title}`);
			return newVideo;
		});
	}

	/**
	 * Update an existing video entry
	 * @param {string} [tenant='default']
	 * @param {string} [id='']
	 * @param {any} [video={}]
	 * @returns {Promise<any>}
	 */
	async updateVideo(tenant = 'default', id = '', video = {}) {
		const safeTenant = this.sanitizeTenant(tenant);
		return this.withLock(safeTenant, 'videos.json', async () => {
			const videos = await this.readJson(safeTenant, 'videos.json', [], false);
			const idx = videos.findIndex((/** @type {any} */ v) => v.id === id);
			if (idx === -1) {
				throw new Error(`Video with ID "${id}" does not exist`);
			}

			const updated = {
				...videos[idx],
				...video,
				id,
				updatedAt: new Date().toISOString()
			};

			videos[idx] = updated;
			await this.writeJson(safeTenant, 'videos.json', videos, `Update video: ${updated.title}`);
			return updated;
		});
	}

	/**
	 * Delete a video by ID
	 * @param {string} [tenant='default']
	 * @param {string} [id='']
	 * @returns {Promise<void>}
	 */
	async deleteVideo(tenant = 'default', id = '') {
		const safeTenant = this.sanitizeTenant(tenant);
		return this.withLock(safeTenant, 'videos.json', async () => {
			const videos = await this.readJson(safeTenant, 'videos.json', [], false);
			const filtered = videos.filter((/** @type {any} */ v) => v.id !== id);
			await this.writeJson(safeTenant, 'videos.json', filtered, `Delete video: ${id}`);
		});
	}

	// ==================== SETTINGS ====================

	/**
	 * Get tenant settings
	 * @param {string} [tenant='default']
	 * @returns {Promise<any>}
	 */
	async getSettings(tenant = 'default') {
		const rawSettings = await this.readJson(tenant, 'settings.json', {}, true);
		return rawSettings && typeof rawSettings === 'object' && !Array.isArray(rawSettings)
			? rawSettings
			: {};
	}

	/**
	 * Save tenant settings (merging with existing)
	 * @param {string} [tenant='default']
	 * @param {any} [settings={}]
	 * @returns {Promise<any>}
	 */
	async saveSettings(tenant = 'default', settings = {}) {
		const safeTenant = this.sanitizeTenant(tenant);
		return this.withLock(safeTenant, 'settings.json', async () => {
			const current = await this.readJson(safeTenant, 'settings.json', {}, false);
			const safeCurrent =
				current && typeof current === 'object' && !Array.isArray(current) ? current : {};
			const updated = {
				...safeCurrent,
				...settings
			};
			await this.writeJson(safeTenant, 'settings.json', updated, 'Update tenant settings');
			return updated;
		});
	}

	// ==================== LEADS ====================

	/**
	 * Get list of captured CRM leads
	 * @param {string} [tenant='default']
	 * @returns {Promise<any[]>}
	 */
	async getLeads(tenant = 'default') {
		/** @type {any[]} */
		const rawLeads = await this.readJson(tenant, 'leads.json', [], false);
		const leads = Array.isArray(rawLeads) ? rawLeads : [];
		return leads.sort(
			(a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
		);
	}

	/**
	 * Add a new CRM lead
	 * @param {string} [tenant='default']
	 * @param {any} [lead={}]
	 * @returns {Promise<any>}
	 */
	async addLead(tenant = 'default', lead = {}) {
		if (!lead || !lead.phone || typeof lead.phone !== 'string') {
			throw new Error('Phone number is required');
		}

		const cleanPhone = lead.phone.replace(/\D/g, '');
		if (cleanPhone.length < 9 || cleanPhone.length > 12) {
			throw new Error('Phone number must be between 9 and 12 digits');
		}

		const safeTenant = this.sanitizeTenant(tenant);
		return this.withLock(safeTenant, 'leads.json', async () => {
			const leads = await this.readJson(safeTenant, 'leads.json', [], false);
			const newLead = {
				id: lead.id || `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
				phone: lead.phone,
				email: lead.email || '',
				name: lead.name || '',
				field: lead.field || '',
				note: lead.note || '',
				source: lead.source || 'website',
				status: lead.status || 'NEW',
				adminNote: lead.adminNote || '',
				ip: lead.ip || '',
				createdAt: lead.createdAt || new Date().toISOString()
			};

			leads.unshift(newLead);
			await this.writeJson(safeTenant, 'leads.json', leads, `Add lead from ${newLead.phone}`);
			return newLead;
		});
	}

	/**
	 * Update status or admin note on a lead
	 * @param {string} [tenant='default']
	 * @param {string} [id='']
	 * @param {any} [updates={}]
	 * @returns {Promise<any | null>}
	 */
	async updateLead(tenant = 'default', id = '', updates = {}) {
		const safeTenant = this.sanitizeTenant(tenant);
		return this.withLock(safeTenant, 'leads.json', async () => {
			const leads = await this.readJson(safeTenant, 'leads.json', [], false);
			const idx = leads.findIndex((/** @type {any} */ l) => l.id === id);
			if (idx === -1) return null;

			const updated = {
				...leads[idx],
				...updates,
				id,
				updatedAt: new Date().toISOString()
			};

			leads[idx] = updated;
			await this.writeJson(safeTenant, 'leads.json', leads, `Update lead ${id}`);
			return updated;
		});
	}

	/**
	 * Delete a lead by ID
	 * @param {string} [tenant='default']
	 * @param {string} [id='']
	 * @returns {Promise<boolean>}
	 */
	async deleteLead(tenant = 'default', id = '') {
		const safeTenant = this.sanitizeTenant(tenant);
		return this.withLock(safeTenant, 'leads.json', async () => {
			const leads = await this.readJson(safeTenant, 'leads.json', [], false);
			const initialLength = leads.length;
			const filtered = leads.filter((/** @type {any} */ l) => l.id !== id);
			if (filtered.length === initialLength) return false;

			await this.writeJson(safeTenant, 'leads.json', filtered, `Delete lead ${id}`);
			return true;
		});
	}

	// ==================== COMMENTS ====================

	/**
	 * Get comments for a given post slug
	 * @param {string} [tenant='default']
	 * @param {string} [postSlug='']
	 * @returns {Promise<any[]>}
	 */
	async getComments(tenant = 'default', postSlug = '') {
		const safeSlug = cleanSlug(postSlug);
		if (!safeSlug) return [];
		/** @type {any[]} */
		const rawComments = await this.readJson(tenant, `comments/${safeSlug}.json`, [], false);
		const comments = Array.isArray(rawComments) ? rawComments : [];
		return comments.sort(
			(a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
		);
	}

	/**
	 * Add a comment to a post
	 * @param {string} [tenant='default']
	 * @param {string} [postSlug='']
	 * @param {any} [comment={}]
	 * @returns {Promise<any>}
	 */
	async addComment(tenant = 'default', postSlug = '', comment = {}) {
		const safeSlug = cleanSlug(postSlug);
		if (!safeSlug) throw new Error('Invalid post slug for comment');

		if (!comment || !comment.name || !comment.content) {
			throw new Error('Comment name and content are required');
		}

		const safeTenant = this.sanitizeTenant(tenant);
		const fileName = `comments/${safeSlug}.json`;
		return this.withLock(safeTenant, fileName, async () => {
			const comments = await this.readJson(safeTenant, fileName, [], false);
			const newComment = {
				id:
					comment.id ||
					`cmt_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
				name: comment.name,
				email: comment.email || '',
				content: comment.content,
				parentId: comment.parentId || null,
				replyToName: comment.replyToName || null,
				isAuthor: Boolean(comment.isAuthor),
				postSlug: safeSlug,
				createdAt: comment.createdAt || new Date().toISOString()
			};

			comments.unshift(newComment);
			await this.writeJson(safeTenant, fileName, comments, `Add comment on ${safeSlug}`);
			return newComment;
		});
	}

	/**
	 * Delete a comment by ID
	 * @param {string} [tenant='default']
	 * @param {string} [postSlug='']
	 * @param {string} [id='']
	 * @returns {Promise<boolean>}
	 */
	async deleteComment(tenant = 'default', postSlug = '', id = '') {
		const safeSlug = cleanSlug(postSlug);
		if (!safeSlug) return false;

		const safeTenant = this.sanitizeTenant(tenant);
		const fileName = `comments/${safeSlug}.json`;
		return this.withLock(safeTenant, fileName, async () => {
			const comments = await this.readJson(safeTenant, fileName, [], false);
			const initialLength = comments.length;
			const filtered = comments.filter((/** @type {any} */ c) => c.id !== id);
			if (filtered.length === initialLength) return false;

			await this.writeJson(safeTenant, fileName, filtered, `Delete comment ${id}`);
			return true;
		});
	}

	// ==================== CATEGORIES & TAGS ====================

	/**
	 * Get categories
	 * @param {string} [tenant='default']
	 * @returns {Promise<any[]>}
	 */
	async getCategories(tenant = 'default') {
		const raw = await this.readJson(tenant, 'categories.json', [], true);
		return Array.isArray(raw) ? raw : [];
	}

	/**
	 * Save categories array
	 * @param {string} [tenant='default']
	 * @param {any[]} [categories=[]]
	 * @returns {Promise<void>}
	 */
	async saveCategories(tenant = 'default', categories = []) {
		const safeTenant = this.sanitizeTenant(tenant);
		return this.withLock(safeTenant, 'categories.json', async () => {
			await this.writeJson(
				safeTenant,
				'categories.json',
				Array.isArray(categories) ? categories : [],
				'Update categories'
			);
		});
	}

	/**
	 * Get tags
	 * @param {string} [tenant='default']
	 * @returns {Promise<any[]>}
	 */
	async getTags(tenant = 'default') {
		const raw = await this.readJson(tenant, 'tags.json', [], true);
		return Array.isArray(raw) ? raw : [];
	}

	/**
	 * Save tags array
	 * @param {string} [tenant='default']
	 * @param {any[]} [tags=[]]
	 * @returns {Promise<void>}
	 */
	async saveTags(tenant = 'default', tags = []) {
		const safeTenant = this.sanitizeTenant(tenant);
		return this.withLock(safeTenant, 'tags.json', async () => {
			await this.writeJson(safeTenant, 'tags.json', Array.isArray(tags) ? tags : [], 'Update tags');
		});
	}
}
