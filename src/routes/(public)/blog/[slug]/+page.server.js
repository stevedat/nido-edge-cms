import { error } from '@sveltejs/kit';
import { marked } from 'marked';
import { getPost, getPostSummaries, getPublicComments } from '$lib/server/content.js';
import { createAntiSpamChallenge } from '$lib/server/antispam.js';
import { sanitizeHtml } from '$lib/utils/sanitize.js';
import { serverT } from '$lib/i18n/index.js';

export const load = async ({ params, locals }) => {
	const domain = locals.domain || 'default';
	// Anonymous visitors can only view PUBLISHED articles; authenticated admins may preview drafts
	const publishedOnly = !locals.isAuthenticated;
	const post = await getPost(domain, params.slug, publishedOnly);
	if (!post) {
		throw error(
			404,
			serverT('blog.notFound', locals.locale, { defaultValue: 'Article not found' })
		);
	}

	const rawHtml = await marked.parse(post.content || '');
	const html = sanitizeHtml(typeof rawHtml === 'string' ? rawHtml : '');
	const rawHtmlEn = post.content_en ? await marked.parse(post.content_en) : null;
	const html_en = rawHtmlEn ? sanitizeHtml(typeof rawHtmlEn === 'string' ? rawHtmlEn : '') : null;

	// Fetch related posts, public comments, and anti-spam challenge in parallel
	const [allSummaries, comments, antiSpamChallenge] = await Promise.all([
		getPostSummaries(domain).catch(() => []),
		getPublicComments(domain, params.slug).catch(() => []),
		createAntiSpamChallenge(params.slug).catch(() => null)
	]);

	const relatedPosts = allSummaries
		.filter((/** @type {any} */ p) => p.slug !== params.slug)
		.slice(0, 2);

	return {
		post: {
			slug: post.slug,
			title: post.title || post.meta?.title || '',
			title_en: post.meta?.title_en || '',
			excerpt: post.excerpt || '',
			excerpt_en: post.excerpt_en || '',
			thumbnail: post.thumbnail || post.meta?.thumbnail || '',
			meta: post.meta,
			html,
			html_en,
			content: post.content,
			content_en: post.content_en
		},
		relatedPosts,
		comments,
		antiSpamChallenge,
		isAdmin: Boolean(locals.isAuthenticated),
		adminName: locals.user?.name || 'Admin'
	};
};
