// @ts-check
import { fail } from '@sveltejs/kit';
import { getLeads, updateLead, deleteLead } from '$lib/server/content.js';

export const load = async ({ locals }) => {
	const domain = locals.domain || 'default';
	const leads = await getLeads(domain);

	return {
		leads,
		domain
	};
};

export const actions = {
	updateStatus: async ({ request, locals }) => {
		const form = await request.formData();
		const id = form.get('id')?.toString();
		const status = /** @type {any} */ (form.get('status')?.toString());
		const adminNote = form.get('adminNote')?.toString() ?? '';

		if (!id || !status) {
			return fail(400, { message: 'Missing update information' });
		}

		try {
			const updated = await updateLead(locals.domain, id, { status, adminNote });
			if (!updated) {
				return fail(404, { message: 'Lead not found' });
			}
			return { success: true, message: 'Lead status updated successfully!' };
		} catch (error) {
			console.error('Error updating lead:', error);
			return fail(500, { message: 'Could not update lead.' });
		}
	},

	delete: async ({ request, locals }) => {
		const form = await request.formData();
		const id = form.get('id')?.toString();

		if (!id) {
			return fail(400, { message: 'Missing lead ID' });
		}

		try {
			const success = await deleteLead(locals.domain, id);
			if (!success) {
				return fail(404, { message: 'Lead not found for deletion' });
			}
			return { success: true, message: 'Lead deleted successfully!' };
		} catch (error) {
			console.error('Error deleting lead:', error);
			return fail(500, { message: 'Could not delete lead.' });
		}
	}
};
