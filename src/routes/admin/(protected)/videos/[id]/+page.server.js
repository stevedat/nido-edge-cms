// @ts-check
import { error, fail, redirect, isRedirect, isHttpError } from '@sveltejs/kit';
import { getVideo, updateVideo, deleteVideo } from '$lib/server/content.js';

export const load = async ({ params, locals }) => {
	const videoId = params.id;
	const domain = locals?.domain || 'default';

	try {
		const video = await getVideo(domain, videoId);
		if (!video) {
			throw error(404, 'admin.videos.notFound');
		}

		return { video };
	} catch (err) {
		if (isHttpError(err) || isRedirect(err)) {
			throw err;
		}
		console.error('Failed to load video', err);
		throw error(500, 'admin.videos.loadError');
	}
};

export const actions = {
	update: async ({ request, params, locals }) => {
		const form = await request.formData();
		const videoId = params.id;
		const title = form.get('title')?.toString().trim();
		const platform = form.get('platform')?.toString().trim();
		const url = form.get('url')?.toString().trim();
		const domain = locals?.domain || 'default';

		if (!title || !platform || !url) {
			return fail(400, { message: 'admin.videos.missingInfo' });
		}

		try {
			const existing = await getVideo(domain, videoId);
			if (!existing) {
				return fail(404, { message: 'admin.videos.updateNotFound' });
			}

			await updateVideo(domain, videoId, { title, platform, url });
			throw redirect(303, '/admin/videos');
		} catch (err) {
			if (isRedirect(err)) throw err;
			console.error('Failed to update video', err);
			return fail(500, { message: 'admin.videos.updateError' });
		}
	},

	delete: async ({ params, locals }) => {
		const videoId = params.id;
		const domain = locals?.domain || 'default';

		try {
			const existing = await getVideo(domain, videoId);
			if (!existing) {
				return fail(404, { message: 'admin.videos.deleteNotFound' });
			}

			await deleteVideo(domain, videoId);
			throw redirect(303, '/admin/videos');
		} catch (err) {
			if (isRedirect(err)) throw err;
			console.error('Failed to delete video', err);
			return fail(500, { message: 'admin.videos.deleteError' });
		}
	}
};
