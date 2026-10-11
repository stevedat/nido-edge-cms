// @ts-check
import { fail, redirect, isRedirect } from '@sveltejs/kit';
import { createProject } from '$lib/server/content.js';
import { serverT } from '$lib/i18n/index.js';

export const actions = {
	default: async ({ request, locals }) => {
		const form = await request.formData();
		const title = form.get('title')?.toString().trim();
		const description = form.get('description')?.toString().trim();
		const link = form.get('link')?.toString().trim();
		const tagsInput = form.get('tags')?.toString() ?? '';

		if (!title || !description) {
			return fail(400, { message: serverT('admin.projects.missingInfo', locals.locale) });
		}

		try {
			const tags = tagsInput
				.split(',')
				.map((tag) => tag.trim())
				.filter(Boolean);

			await createProject(locals.domain || 'default', {
				title,
				description,
				link: link || '',
				url: link || '',
				tags,
				tagSlugs: tags
			});

			throw redirect(303, '/admin/projects');
		} catch (error) {
			if (isRedirect(error)) throw error;
			console.error('Failed to add project', error);
			const message =
				error instanceof Error
					? error.message
					: serverT('admin.projects.createError', locals.locale);
			return fail(500, { message });
		}
	}
};
