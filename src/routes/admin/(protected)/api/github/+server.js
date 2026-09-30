import { error, json } from '@sveltejs/kit';
import { createOrUpdateFile, deleteFile, getFile, uploadImage } from '$lib/server/github.js';
import { serverT } from '$lib/i18n/index.js';

export const POST = async ({ request, locals }) => {
	const contentType = request.headers.get('content-type') ?? '';

	if (contentType.startsWith('multipart/form-data')) {
		const formData = await request.formData();
		const file = formData.get('file');

		if (!(file instanceof File)) {
			throw error(400, serverT('api.github.missingFile', locals.locale));
		}

		const url = await uploadImage(file);
		return json({ url });
	}

	const body = await request.json();

	switch (body.action) {
		case 'read': {
			const file = await getFile(body.path);
			return json(file);
		}
		case 'write': {
			const result = await createOrUpdateFile(body.path, body.content, body.message ?? 'Update from Admin', {
				sha: body.sha
			});
			return json(result);
		}
		default:
			throw error(400, serverT('api.github.unsupportedAction', locals.locale));
	}
};

export const DELETE = async ({ request, locals }) => {
	const body = await request.json();
	if (!body?.path || !body?.sha) {
		throw error(400, serverT('api.github.missingPathOrSha', locals.locale));
	}

	await deleteFile(body.path, body.sha, body.message ?? 'Delete from Admin');
	return json({ success: true });
};
