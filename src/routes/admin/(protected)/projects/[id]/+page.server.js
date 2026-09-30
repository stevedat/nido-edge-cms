// @ts-check
import { error, fail, redirect, isRedirect, isHttpError } from '@sveltejs/kit';
import { getProject, updateProject, deleteProject } from '$lib/server/content.js';

export const load = async ({ params, locals }) => {
	const projectId = params.id;
	
	try {
		const project = await getProject(locals.domain || 'default', projectId);
		if (!project) {
			throw error(404, 'admin.projects.notFound');
		}

		return {
			project
		};
	} catch (err) {
		console.error('Failed to load project', err);
		if (isHttpError(err) || isRedirect(err)) {
			throw err;
		}
		throw error(500, 'admin.projects.loadError');
	}
};

export const actions = {
	update: async ({ request, params, locals }) => {
		const form = await request.formData();
		const projectId = params.id;
		const title = form.get('title')?.toString().trim();
		const description = form.get('description')?.toString().trim();
		const link = form.get('link')?.toString().trim();
		const tagsInput = form.get('tags')?.toString() ?? '';

		if (!title || !description) {
			return fail(400, { message: 'admin.projects.missingInfo' });
		}

		try {
			const tags = tagsInput
				.split(',')
				.map((tag) => tag.trim())
				.filter(Boolean);

			await updateProject(locals.domain, projectId, {
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
			console.error('Failed to update project', error);
			const message = error instanceof Error ? error.message : 'admin.projects.updateError';
			return fail(500, { message });
		}
	},

	delete: async ({ params, locals }) => {
		const projectId = params.id;

		try {
			await deleteProject(locals.domain || 'default', projectId);
			throw redirect(303, '/admin/projects');
		} catch (error) {
			if (isRedirect(error)) throw error;
			console.error('Failed to delete project', error);
			const message = error instanceof Error ? error.message : 'admin.projects.deleteError';
			return fail(500, { message });
		}
	}
};