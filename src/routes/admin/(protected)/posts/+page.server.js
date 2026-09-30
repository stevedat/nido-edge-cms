import { fail } from '@sveltejs/kit';
import { getPosts, deletePost } from '$lib/server/content.js';

export const load = async ({ locals }) => {
	const domain = locals.domain || 'default';
	const { posts } = await getPosts(domain, { limit: 100 });
	return { 
		posts: posts.map((/** @type {any} */ post) => ({
			slug: post.slug,
			meta: {
				title: post.title,
				date: post.publishedAt || post.createdAt || new Date().toISOString(),
				tags: post.tags || post.tagSlugs || []
			}
		}))
	};
};

export const actions = {
	delete: async ({ request, locals }) => {
		const formData = await request.formData();
		const slug = formData.get('slug')?.toString().trim() || formData.get('id')?.toString().trim();
		if (!slug) {
			return fail(400, { message: 'Thiếu định danh bài viết' });
		}

		try {
			const domain = locals.domain || 'default';
			await deletePost(domain, slug, locals.user?.id || 'admin');
			return { message: `Đã xoá thành công` };
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Lỗi khi xóa bài viết';
			return fail(500, { message });
		}
	}
};
