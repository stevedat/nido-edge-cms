<script lang="ts">
	import { enhance } from '$app/forms';
	import { t } from '$lib/i18n/index.js';
	import { Eye, EyeOff, Lock, ArrowLeft } from 'lucide-svelte';
	let { form }: { form?: { message?: string } } = $props();
	
	let isSubmitting = $state(false);
	let showPassword = $state(false);
	let localErrorMessage = $state('');
</script>

<svelte:head>
	<title>{t('admin.login.pageTitle', { defaultValue: 'Admin Login - CMS' })}</title>
</svelte:head>

<div class="min-h-screen bg-main-bg flex items-center justify-center p-4 sm:p-6 transition-colors duration-200">
	<form 
		method="POST" 
		use:enhance={() => {
			isSubmitting = true;
			localErrorMessage = '';
			return async ({ result, update }) => {
				isSubmitting = false;
				if (result.type === 'failure') {
					const data = result.data as Record<string, any> | undefined;
					localErrorMessage = typeof data?.message === 'string' ? data.message : String(t('admin.login.errorFallback', { defaultValue: 'An error occurred, please try again.' }));
				} else {
					update();
				}
			};
		}}
		class="w-full max-w-md space-y-6 rounded-3xl bg-surface border border-border-subtle p-6 sm:p-8 shadow-sm"
	>
		<div class="space-y-2 text-center">
			<div class="size-14 bg-primary/10 text-primary rounded-2xl mx-auto mb-3 flex items-center justify-center font-bold">
				<Lock strokeWidth={1.75} size={26} />
			</div>
			<p class="text-xs uppercase tracking-[0.2em] font-bold text-text-muted">Edge CMS</p>
			<h1 class="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">{t('admin.login.title', { defaultValue: 'Admin Login' })}</h1>
			<p class="text-xs sm:text-sm text-text-body font-normal">{t('admin.login.subtitle', { defaultValue: 'Enter admin password to access system' })}</p>
		</div>

		{#if form?.message || localErrorMessage}
			<div class="rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-3">
				<p class="text-xs sm:text-sm text-red-600 dark:text-red-400 font-semibold">{localErrorMessage || form?.message}</p>
			</div>
		{/if}

		<div class="space-y-4">
			<label class="block text-xs sm:text-sm font-bold text-text-main">
				{t('admin.login.passwordLabel', { defaultValue: 'Admin Password *' })}
				<div class="relative mt-2">
					<input
						type={showPassword ? "text" : "password"}
						name="password"
						required
						disabled={isSubmitting}
						class="w-full rounded-2xl bg-soft-bg border border-border-subtle text-text-main text-base sm:text-sm px-4 py-3 pr-12 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
						placeholder={t('admin.login.passwordPlaceholder', { defaultValue: 'Enter admin password' })}
					/>
					<button
						type="button"
						onclick={() => showPassword = !showPassword}
						class="absolute inset-y-0 right-0 flex items-center pr-4 text-text-muted hover:text-text-main transition-colors focus:outline-none cursor-pointer"
						aria-label={showPassword ? t('admin.login.hidePassword', { defaultValue: 'Hide password' }) : t('admin.login.showPassword', { defaultValue: 'Show password' })}
					>
						{#if showPassword}
							<EyeOff strokeWidth={1.75} size={18} />
						{:else}
							<Eye strokeWidth={1.75} size={18} />
						{/if}
					</button>
				</div>
			</label>
			<!-- Hidden identifier to satisfy the action -->
			<input type="hidden" name="identifier" value="admin" />
		</div>

		<button
			type="submit"
			disabled={isSubmitting}
			class="w-full rounded-2xl bg-primary hover:bg-primary-light text-white font-bold py-3 text-center text-xs sm:text-sm transition-all shadow-sm active:scale-98 disabled:opacity-50 cursor-pointer"
		>
			{isSubmitting ? t('admin.login.authenticating', { defaultValue: 'Authenticating...' }) : t('admin.login.loginBtn', { defaultValue: 'Login' })}
		</button>

		<div class="text-center pt-2">
			<a 
				href="/" 
				class="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-main transition-colors"
			>
				<ArrowLeft strokeWidth={1.75} size={14} />
				<span>{t('admin.login.backHome', { defaultValue: 'Back to home' })}</span>
			</a>
		</div>
	</form>
</div>
