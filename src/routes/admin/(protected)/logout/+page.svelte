<script>
	import { enhance } from '$app/forms';
	import { t } from '$lib/i18n/index.js';
</script>

<svelte:head>
	<title>{t('admin.logout.title', { defaultValue: 'Log Out' })} - Admin</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-main-bg p-4">
	<div class="bg-surface border border-border-subtle p-8 rounded-2xl shadow-xs max-w-md w-full">
		<h1 class="text-2xl font-bold text-text-main mb-3 text-center">
			{t('admin.logout.title', { defaultValue: 'Log Out' })}
		</h1>
		
		<p class="text-text-muted mb-8 text-center text-sm">
			{t('admin.logout.confirmMessage', { defaultValue: 'Are you sure you want to log out of Edge CMS admin?' })}
		</p>

		<form method="POST" use:enhance class="space-y-4">
			<button
				type="submit"
				class="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-xs cursor-pointer active:scale-98"
			>
				{t('admin.logout.submit', { defaultValue: 'Log Out' })}
			</button>
		</form>

		<div class="mt-6 text-center">
			<a href="/admin/dashboard" class="text-primary hover:underline text-sm font-medium">
				← {t('admin.logout.backToDashboard', { defaultValue: 'Back to Dashboard' })}
			</a>
		</div>
	</div>
</div>