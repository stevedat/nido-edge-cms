// @ts-check
import { error, fail, redirect, isRedirect } from '@sveltejs/kit';
import { core } from '$lib/server/core.js';

/**
 * @param {unknown} data
 */
const toJson = (data) => `${JSON.stringify(data, null, 2)}\n`;

export const load = async ({ params, locals }) => {
	const videoId = params.id;
	const domain = locals?.domain || 'default';
	const domainPath = `src/content/${domain}/videos.json`;
	
	try {
		/** @type {Array<{id: string, [key: string]: any}>} */
		let videos = [];
		const remote = await core.storage.read(domainPath);
		if (remote) {
			videos = JSON.parse(remote);
		}

		const video = videos.find((v) => v.id === videoId);
		if (!video) {
			throw error(404, 'admin.videos.notFound');
		}

		return {
			video
		};
	} catch (err) {
		console.error('Failed to load video', err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
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
		const domainPath = `src/content/${domain}/videos.json`;

		if (!title || !platform || !url) {
			return fail(400, { message: 'admin.videos.missingInfo' });
		}

		try {
			/** @type {Array<{id: string, [key: string]: any}>} */
			let videos = [];
			const remote = await core.storage.read(domainPath);
			if (remote) {
				videos = JSON.parse(remote);
			}

			const videoIndex = videos.findIndex((v) => v.id === videoId);
			if (videoIndex === -1) {
				return fail(404, { message: 'admin.videos.updateNotFound' });
			}

			videos[videoIndex] = {
				...videos[videoIndex],
				title,
				platform,
				url
			};

			const jsonContent = toJson(videos);
			await core.storage.write(domainPath, jsonContent, `Update video ${title}`);

			throw redirect(303, '/admin/videos');
		} catch (error) {
			if (isRedirect(error)) throw error;
			console.error('Failed to update video', error);
			return fail(500, { message: 'admin.videos.updateError' });
		}
	},

	delete: async ({ params, locals }) => {
		const videoId = params.id;
		const domain = locals?.domain || 'default';
		const domainPath = `src/content/${domain}/videos.json`;

		try {
			/** @type {Array<{id: string, title?: string, [key: string]: any}>} */
			let videos = [];
			const remote = await core.storage.read(domainPath);
			if (remote) {
				videos = JSON.parse(remote);
			}

			const videoIndex = videos.findIndex((v) => v.id === videoId);
			if (videoIndex === -1) {
				return fail(404, { message: 'admin.videos.deleteNotFound' });
			}

			const deletedVideo = videos[videoIndex];
			videos.splice(videoIndex, 1);
			const jsonContent = toJson(videos);

			await core.storage.write(domainPath, jsonContent, `Delete video ${deletedVideo.title}`);

			throw redirect(303, '/admin/videos');
		} catch (error) {
			if (isRedirect(error)) throw error;
			console.error('Failed to delete video', error);
			return fail(500, { message: 'admin.videos.deleteError' });
		}
	}
};