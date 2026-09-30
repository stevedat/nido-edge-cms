import { error } from '@sveltejs/kit';
import { marked } from 'marked';
import { getPost, getPostSummaries } from '$lib/server/content.js';
import { getPublicComments } from '$lib/server/content.js';
import { createAntiSpamChallenge } from '$lib/server/antispam.js';

export const load = async ({ params, locals }) => {
	const domain = locals.domain || 'default';
	const post = await getPost(domain, params.slug);
	if (!post) {
		throw error(404, locals.locale === 'en' ? 'Article not found' : 'Bài viết không tồn tại');
	}

	const html = marked.parse(post.content);
	const html_en = post.content_en ? marked.parse(post.content_en) : null;
	
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
