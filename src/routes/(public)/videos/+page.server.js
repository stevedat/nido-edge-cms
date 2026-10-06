import { getVideos } from '$lib/server/content.js';

export const load = async ({ locals }) => ({
	videos: await getVideos(locals.domain)
});
