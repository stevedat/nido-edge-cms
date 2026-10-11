import { json } from '@sveltejs/kit';
import { triggerDeploy } from '$lib/server/github.js';
import { env } from '$env/dynamic/private';
import { serverT } from '$lib/i18n/index.js';

export async function POST({ locals }) {
	// Only logged in users (admin/clients) can publish
	if (!locals.isAuthenticated) {
		return json({ error: serverT('api.github.unauthorized', locals.locale) }, { status: 401 });
	}

	try {
		// We use the branch stored in locals.user.branch, or the default GITHUB_BRANCH
		const branchName = locals.user?.branch || env.GITHUB_BRANCH || 'main';

		await triggerDeploy(branchName);

		return json({ success: true, message: serverT('admin.publish.success', locals.locale) });
	} catch (error) {
		console.error('Publish deploy error:', error);
		return json({ error: serverT('admin.publish.error', locals.locale) }, { status: 500 });
	}
}
