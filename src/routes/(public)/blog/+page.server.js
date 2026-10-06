import { getPostSummaries, getVideos } from '$lib/server/content.js';

export const load = async ({ locals }) => {
	const domain = locals.domain || 'default';
	const [posts, videos] = await Promise.all([getPostSummaries(domain), getVideos(domain)]);

	return {
		posts,
		videos
	};
};
