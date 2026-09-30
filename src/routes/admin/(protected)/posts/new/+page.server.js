import { fail, redirect } from '@sveltejs/kit';
import { createPost } from '$lib/server/content.js';
import { uploadImage } from '$lib/server/github.js';
import { slugify } from '$lib/utils/index.js';

export const actions = {
	default: async ({ request, locals }) => {
		const form = await request.formData();
		const title = form.get('title')?.toString().trim();
		const body = form.get('content')?.toString().trim();
		const tagsInput = form.get('tags')?.toString() ?? '';
		const date = form.get('date')?.toString() ?? new Date().toISOString().slice(0, 10);
		let slug = form.get('slug')?.toString().trim() ?? '';
		let thumbnail = form.get('thumbnail')?.toString().trim();
		const thumbnailFile = form.get('thumbnail_file');

		if (!title || !body) {
			return fail(400, { message: 'Cần có tiêu đề và nội dung' });
		}

		slug = slug || slugify(title);

		try {
			if (thumbnailFile instanceof File && thumbnailFile.size > 0) {
				thumbnail = await uploadImage(thumbnailFile);
			}

			const tags = tagsInput
				.split(',')
				.map((tag) => tag.trim())
				.filter(Boolean);

			await createPost(locals.domain || 'default', {
				title,
				slug,
				content: body,
				excerpt: body.substring(0, 150) + '...',
				thumbnail: thumbnail || null,
				tags,
				status: 'PUBLISHED',
				publishedAt: new Date(date).toISOString()
			}, locals.user?.id || 'admin');

		} catch (error) {
			console.error('Failed to create post', error);
			const message = error instanceof Error ? error.message : 'Lỗi không xác định';
			return fail(500, {
				message: 'Không thể tạo bài viết. Lỗi: ' + message
			});
		}

		throw redirect(303, '/admin/posts');
	}
};
