// @ts-check
import { fail, redirect, isRedirect } from '@sveltejs/kit';
import { createVideo } from '$lib/server/content.js';
import { serverT } from '$lib/i18n/index.js';

export const actions = {
	default: async ({ request, locals }) => {
		const form = await request.formData();
		const title = form.get('title')?.toString().trim();
		const platform = form.get('platform')?.toString().trim();
		const url = form.get('url')?.toString().trim();

		if (!title || !platform || !url) {
			return fail(400, { message: serverT('admin.videos.missingInfo', locals.locale) });
		}

		try {
			const domain = locals?.domain || 'default';
			await createVideo(domain, {
				title,
				platform,
				url,
				authorId: locals.user?.id || 'admin'
			});

			throw redirect(303, '/admin/videos');
		} catch (error) {
			if (isRedirect(error)) throw error;
			console.error('Failed to add video', error);
			return fail(500, {
				message: serverT('admin.videos.createError', locals.locale),
				details: error instanceof Error ? error.message : 'unknown'
			});
		}
	}
};
