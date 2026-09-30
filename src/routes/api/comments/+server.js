import { json } from '@sveltejs/kit';
import { getPublicComments, addComment, sanitizePublicComment } from '$lib/server/content.js';
import { getClientIP } from '$lib/server/auth.js';
import { verifyCommentSubmission } from '$lib/server/antispam.js';
import { serverT } from '$lib/i18n/index.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url, locals }) {
	const slug = url.searchParams.get('slug');
	if (!slug) {
		return json({ error: serverT('api.comments.missingSlug', locals.locale) }, { status: 400 });
	}

	try {
		const comments = await getPublicComments(locals.domain, slug);
		return json({ success: true, comments });
	} catch (error) {
		return json({ error: serverT('api.comments.loadError', locals.locale) }, { status: 500 });
	}
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals }) {
	try {
		const data = await request.json();
		const { 
			slug, 
			name, 
			email, 
			content, 
			honeypot, 
			website, 
			phone_number, 
			phone, 
			parentId, 
			token, 
			nonce 
		} = data;

		// 1. Basic payload validation
		if (!slug || typeof slug !== 'string') {
			return json({ error: serverT('api.comments.invalidPost', locals.locale) }, { status: 400 });
		}

		if (!name || typeof name !== 'string' || name.trim().length < 2) {
			return json({ error: serverT('api.comments.invalidName', locals.locale) }, { status: 400 });
		}

		if (!content || typeof content !== 'string' || content.trim().length < 2) {
			return json({ error: serverT('api.comments.invalidContent', locals.locale) }, { status: 400 });
		}

		const isAuthor = Boolean(locals.isAuthenticated);
		const ip = getClientIP(request);

		// 2. Comprehensive Multi-layer Anti-Bot & Anti-Spam Check
		const check = await verifyCommentSubmission({
			slug,
			content,
			honeypots: {
				honeypot,
				website,
				phone_number: phone_number || phone
			},
			token,
			nonce,
			ip,
			isAdmin: isAuthor
		});

		// Silent drop bot submissions (return fake 200 OK without committing to GitHub)
		if (check.silentDrop) {
			return json({
				success: true,
				message: serverT('api.comments.successMessage', locals.locale)
			});
		}

		if (!check.isValid) {
			return json({ 
				error: check.error || serverT('api.comments.invalidRequest', locals.locale) 
			}, { 
				status: check.status || 400 
			});
		}

		// 3. Save comment to Git-backed storage
		const newComment = await addComment(locals.domain, slug, {
			name: name.trim(),
			email: email?.trim(),
			content: content.trim(),
			parentId: parentId ? String(parentId) : undefined,
			isAuthor
		});

		return json({
			success: true,
			comment: sanitizePublicComment(newComment),
			message: serverT('api.comments.successMessage', locals.locale)
		});
	} catch (error) {
		console.error('Lỗi khi thêm bình luận:', error);
		return json({
			error: /** @type {any} */ (error).message || serverT('api.comments.systemError', locals.locale)
		}, { status: 500 });
	}
}
