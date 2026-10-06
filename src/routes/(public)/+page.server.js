import { getPostSummaries, getProjects, getVideos } from '$lib/server/content.js';

export const load = async ({ locals }) => {
	const domain = locals.domain || 'default';
	const [posts, videos, projects] = await Promise.all([
		getPostSummaries(domain),
		getVideos(domain),
		getProjects(domain)
	]);

	return {
		domain,
		posts: posts.slice(0, 4),
		videos: videos.slice(0, 2),
		projects: projects.slice(0, 3)
	};
};
