import { json } from '@sveltejs/kit';
import { triggerDeploy } from '$lib/server/github.js';
import { env } from '$env/dynamic/private';

export async function POST({ locals }) {
	// Only logged in users (admin/clients) can publish
	if (!locals.isAuthenticated) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		// We use the branch stored in locals.user.branch, or the default GITHUB_BRANCH
		const branchName = locals.user?.branch || env.GITHUB_BRANCH || 'main';

		await triggerDeploy(branchName);

		return json({ success: true, message: 'Đã kích hoạt Xuất bản thành công!' });
	} catch (error) {
		console.error('Lỗi khi xuất bản:', error);
		return json({ error: 'Không thể xuất bản, vui lòng thử lại sau.' }, { status: 500 });
	}
}
