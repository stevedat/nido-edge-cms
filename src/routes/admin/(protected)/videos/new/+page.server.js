import { fail, redirect, isRedirect } from '@sveltejs/kit';
import { createOrUpdateFile, getFile } from '$lib/server/github.js';

/**
 * @param {unknown} data
 */
const toJson = (data) => `${JSON.stringify(data, null, 2)}\n`;

export const actions = {
	default: async ({ request, locals }) => {
		const form = await request.formData();
		const title = form.get('title')?.toString().trim();
		const platform = form.get('platform')?.toString().trim();
		const url = form.get('url')?.toString().trim();

		if (!title || !platform || !url) {
			return fail(400, { message: 'Điền đủ thông tin video' });
		}

		try {
			const domain = locals?.domain || 'default';
			const domainPath = `src/content/${domain}/videos.json`;
			let videos = [];
			let remoteSha;

			try {
				const remote = await getFile(domainPath);
				if (remote?.content) {
					videos = JSON.parse(remote.content);
					remoteSha = remote.sha;
				}
			} catch (e) {
				console.warn('GitHub getFile failed:', e);
			}

			if (!videos || videos.length === 0) {
				try {
					const fs = await import('node:fs/promises');
					const path = await import('node:path');
					const content = await fs.readFile(path.resolve(process.cwd(), domainPath), 'utf-8');
					videos = JSON.parse(content);
				} catch (err) {
					try {
						const fs = await import('node:fs/promises');
						const path = await import('node:path');
						const content = await fs.readFile(path.resolve(process.cwd(), 'src/content/default/videos.json'), 'utf-8');
						videos = JSON.parse(content);
					} catch (e2) {}
				}
			}

			const entry = {
				id: `vid-${Date.now()}`,
				title,
				platform,
				url
			};

			const jsonContent = toJson([...videos, entry]);

			try {
				await createOrUpdateFile(domainPath, jsonContent, `Add video ${title}`, {
					sha: remoteSha
				});
			} catch (githubError) {
				console.warn('GitHub add failed, saving locally:', githubError);
				try {
					const fs = await import('node:fs/promises');
					const path = await import('node:path');
					await fs.writeFile(path.resolve(process.cwd(), domainPath), jsonContent, 'utf-8');
				} catch (localWriteError) {
					throw githubError;
				}
			}

			throw redirect(303, '/admin/videos');
		} catch (error) {
			if (isRedirect(error)) throw error;
			console.error('Failed to add video', error);
			return fail(500, { message: 'Không thể thêm video', details: error instanceof Error ? error.message : 'unknown' });
		}
	}
};
