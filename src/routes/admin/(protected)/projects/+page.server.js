// @ts-check
import { fail } from '@sveltejs/kit';
import { getProjects, deleteProject, saveProjects } from '$lib/server/content.js';

/**
 * @param {unknown} data
 */
const toJson = (data) => `${JSON.stringify(data, null, 2)}\n`;

export const load = async ({ locals }) => {
	let projects = [];
	try {
		const result = await getProjects(locals.domain, { limit: 100 });
		projects = result.projects;
	} catch (error) {
		console.error('projects load error', error);
	}
	
	return {
		projects,
		projectsJson: toJson(projects),
		sha: null
	};
};

export const actions = {
	updateJson: async ({ request, locals }) => {
		const form = await request.formData();
		const projects = form.get('projects')?.toString();

		if (!projects) {
			return fail(400, { message: 'admin.projects.missingJson' });
		}

		let parsed;
		try {
			parsed = JSON.parse(projects);
		} catch (error) {
			const details = error instanceof Error ? error.message : 'Unknown error';
			return fail(400, { message: 'admin.projects.invalidJson', details });
		}
		
		try {
			await saveProjects(locals.domain, parsed);
			return { success: true };
		} catch (error) {
			console.error('Failed to update projects JSON:', error);
			const details = error instanceof Error ? error.message : 'Unknown error';
			return fail(500, { message: 'admin.projects.updateListError', details });
		}
	},

	delete: async ({ request, locals }) => {
		const form = await request.formData();
		const projectId = form.get('id')?.toString()?.trim();

		if (!projectId) {
			return fail(400, { message: 'admin.projects.missingId' });
		}

		try {
			await deleteProject(locals.domain, projectId);
			return { success: true, message: 'admin.projects.deleteSuccess' };
		} catch (error) {
			console.error('Failed to delete project', error);
			const message = error instanceof Error ? error.message : 'admin.projects.deleteError';
			return fail(500, { message });
		}
	}
};
