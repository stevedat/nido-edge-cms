import { error, json } from '@sveltejs/kit';
import { createOrUpdateFile, deleteFile, getFile, uploadImage } from '$lib/server/github.js';
import { serverT } from '$lib/i18n/index.js';

const CONTENT_ROOT = 'src/content/';
const UPLOADS_ROOT = 'static/uploads/';

/**
 * Reject anything that is not a plain relative repo path before it reaches the
 * GitHub Contents API: traversal segments, path separators the API does not use,
 * query/fragment injection and absolute paths.
 * @param {unknown} rawPath
 * @returns {string | null}
 */
function normalizeRepoPath(rawPath) {
	if (typeof rawPath !== 'string') return null;

	const cleaned = rawPath.trim().replace(/^\/+/, '');
	if (!cleaned) return null;
	if (cleaned.includes('..') || cleaned.includes('\0')) return null;
	if (/[\\?#]/.test(cleaned)) return null;

	return cleaned;
}

/**
 * Tenant-scoped path guard (AGENTS.md Law 5).
 *
 * hooks.server.js authenticates every /admin request, but a tenant admin is a
 * customer, not an operator — they may only reach their own
 * `src/content/<domain>/` subtree. Only the master admin may touch other
 * tenants' content. Uploads are shared and reachable by any admin.
 *
 * @param {unknown} rawPath
 * @param {any} locals
 * @returns {string} the validated repo-relative path
 */
function assertRepoPath(rawPath, locals) {
	const path = normalizeRepoPath(rawPath);
	if (!path) {
		throw error(400, serverT('api.github.invalidPath', locals.locale));
	}

	const isMasterAdmin = locals.user?.id === 'admin';
	const tenantRoot = `${CONTENT_ROOT}${locals.domain || 'default'}/`;

	if (path.startsWith(UPLOADS_ROOT)) return path;
	if (path.startsWith(tenantRoot)) return path;
	if (isMasterAdmin && path.startsWith(CONTENT_ROOT)) return path;

	throw error(403, serverT('api.github.forbiddenPath', locals.locale));
}

export const POST = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, serverT('api.github.unauthorized', locals.locale));
	}

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
			const path = assertRepoPath(body.path, locals);
			const file = await getFile(path);
			return json(file);
		}
		case 'write': {
			const path = assertRepoPath(body.path, locals);
			if (typeof body.content !== 'string') {
				throw error(400, serverT('api.github.invalidPath', locals.locale));
			}
			const result = await createOrUpdateFile(
				path,
				body.content,
				body.message ?? 'Update from Admin',
				{
					sha: body.sha
				}
			);
			return json(result);
		}
		default:
			throw error(400, serverT('api.github.unsupportedAction', locals.locale));
	}
};

export const DELETE = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, serverT('api.github.unauthorized', locals.locale));
	}

	const body = await request.json();
	if (!body?.path || !body?.sha) {
		throw error(400, serverT('api.github.missingPathOrSha', locals.locale));
	}

	const path = assertRepoPath(body.path, locals);

	await deleteFile(path, body.sha, body.message ?? 'Delete from Admin');
	return json({ success: true });
};
