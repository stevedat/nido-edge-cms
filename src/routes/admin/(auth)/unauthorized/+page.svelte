<script lang="ts">
	import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-svelte';
	import { t } from '$lib/i18n/index.js';
</script>

<svelte:head>
	<title>{t('admin.unauthorized.pageTitle', { defaultValue: 'Unauthorized - CMS' })}</title>
</svelte:head>

<div class="min-h-screen bg-main-bg flex items-center justify-center p-4 sm:p-6 transition-colors duration-200">
	<div class="w-full max-w-md text-center space-y-6 rounded-3xl bg-surface border border-border-subtle p-6 sm:p-8 shadow-sm">
		<div class="size-16 bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl mx-auto flex items-center justify-center">
			<ShieldAlert strokeWidth={1.75} size={32} />
		</div>
		
		<div class="space-y-2">
			<h1 class="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
				{t('admin.unauthorized.heading', { defaultValue: 'Access Denied' })}
			</h1>
			<p class="text-xs sm:text-sm text-text-body">
				{t('admin.unauthorized.desc', { defaultValue: 'Your account does not have sufficient permissions to view this section.' })}
			</p>
		</div>

		<div class="space-y-3 pt-2">
			<a 
				href="/admin/dashboard" 
				class="block w-full rounded-2xl bg-primary hover:bg-primary-light py-3 text-center text-xs sm:text-sm font-bold text-white transition-all shadow-sm active:scale-98"
			>
				{t('admin.unauthorized.backToDashboard', { defaultValue: 'Back to Dashboard' })}
			</a>
			
			<a 
				href="/admin/logout" 
				class="block w-full rounded-2xl bg-soft-bg hover:bg-surface border border-border-subtle py-3 text-center text-xs sm:text-sm font-semibold text-text-main transition-colors active:scale-98"
			>
				{t('admin.unauthorized.logout', { defaultValue: 'Log Out' })}
			</a>
		</div>
	</div>
</div>