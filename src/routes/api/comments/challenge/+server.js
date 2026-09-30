import { json } from '@sveltejs/kit';
import { createAntiSpamChallenge } from '$lib/server/antispam.js';
import { serverT } from '$lib/i18n/index.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url, locals }) {
	const slug = url.searchParams.get('slug');
	if (!slug) {
		return json({ error: serverT('api.comments.missingSlug', locals.locale) }, { status: 400 });
	}

	try {
		const challengeData = await createAntiSpamChallenge(slug);
		return json({
			success: true,
			...challengeData
		});
	} catch (error) {
		console.error('Lỗi khi tạo mã bảo vệ chống bot:', error);
		return json({ error: serverT('api.comments.createChallengeError', locals.locale) }, { status: 500 });
	}
}
