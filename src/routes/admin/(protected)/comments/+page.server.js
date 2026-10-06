import { fail } from '@sveltejs/kit';
import { getAllComments, deleteComment } from '$lib/server/content.js';

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ locals }) => {
	const comments = await getAllComments(locals.domain);
	return {
		comments
	};
};

/** @type {import('./$types').Actions} */
export const actions = {
	delete: async ({ request, locals }) => {
		const formData = await request.formData();
		const slug = formData.get('slug')?.toString();
		const id = formData.get('id')?.toString();

		if (!slug || !id) {
			return fail(400, { message: 'admin.comments.missingInfo' });
		}

		try {
			const success = await deleteComment(locals.domain, slug, id);
			if (!success) {
				return fail(404, { message: 'admin.comments.deleteNotFound' });
			}
			return { success: true, message: 'admin.comments.deleteSuccess' };
		} catch (error) {
			console.error('Lỗi khi xoá bình luận:', error);
			return fail(500, { message: 'admin.comments.deleteError' });
		}
	}
};
