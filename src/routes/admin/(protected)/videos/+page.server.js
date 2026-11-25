// @ts-check
import { fail } from '@sveltejs/kit';
import { getVideos, getVideo, deleteVideo } from '$lib/server/content.js';

export const load = async ({ locals }) => {
	try {
		const { videos } = await getVideos(locals.domain, { limit: 100 });
		return { videos };
	} catch (error) {
		console.error('Failed to load videos', error);
		return { videos: [] };
	}
};

export const actions = {
	delete: async ({ request, locals }) => {
		const form = await request.formData();
		const videoId = form.get('id')?.toString().trim();
		const domain = locals.domain || 'default';

		if (!videoId) {
			return fail(400, { message: 'admin.videos.missingId' });
		}

		try {
			const existing = await getVideo(domain, videoId);
			if (!existing) {
				return fail(404, { message: 'admin.videos.deleteNotFound' });
			}

			await deleteVideo(domain, videoId);
			return { success: true, message: 'admin.videos.deleteSuccess' };
		} catch (error) {
			console.error('Failed to delete video', error);
			return fail(500, { message: 'admin.videos.deleteError' });
		}
	}
};
