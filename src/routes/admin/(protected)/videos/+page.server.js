// @ts-check
import { fail } from '@sveltejs/kit';
import { core } from '$lib/server/core.js';
import { getVideos } from '$lib/server/content.js';

/**
 * @param {unknown} data
 */
const toJson = (data) => `${JSON.stringify(data, null, 2)}\n`;

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
		const videoId = form.get('id')?.toString();
		const domainPath = `src/content/${locals.domain || 'default'}/videos.json`;

		if (!videoId) {
			return fail(400, { message: 'admin.videos.missingId' });
		}

		try {
			const remote = await core.storage.read(domainPath);
			/** @type {Array<{id: string, title?: string, [key: string]: any}>} */
			let videos = [];
			
			if (remote) {
				try {
					videos = JSON.parse(remote);
				} catch (parseError) {
					return fail(500, { message: 'admin.videos.invalidJson' });
				}
			}

			const videoIndex = videos.findIndex((v) => v.id === videoId);
			if (videoIndex === -1) {
				return fail(404, { message: 'admin.videos.deleteNotFound' });
			}

			const deletedVideo = videos[videoIndex];
			videos.splice(videoIndex, 1);

			await core.storage.write(domainPath, toJson(videos), `Delete video ${deletedVideo.title}`);

			return { success: true, message: 'admin.videos.deleteSuccess' };
		} catch (error) {
			console.error('Failed to delete video', error);
			return fail(500, { message: 'admin.videos.deleteError' });
		}
	}
};
