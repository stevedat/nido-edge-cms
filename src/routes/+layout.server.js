import { getSettings, sanitizePublicSettings } from '$lib/server/content.js';

export const load = async ({ locals }) => {
	const domain = locals.domain || 'default';
	const rawSettings = locals.settings || (await getSettings(domain));

	return {
		isAuthenticated: locals.isAuthenticated ?? false,
		domain,
		locale: locals.locale || 'vi',
		settings: sanitizePublicSettings(rawSettings)
	};
};
