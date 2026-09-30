<script lang="ts">
	import { enhance } from '$app/forms';
	import { t } from '$lib/i18n/index.js';
	import { ArrowLeft, Save, Youtube, Link as LinkIcon, MonitorPlay } from 'lucide-svelte';

	let { form }: { form?: { message?: string; details?: string; success?: boolean } } = $props();
	let isSubmitting = $state(false);
	
	let title = $state('');
	let url = $state('');
	let platform = $state('YOUTUBE');
</script>

<svelte:head>
	<title>{t('admin.videos.new.pageTitle', { defaultValue: 'Add Video - Admin' })}</title>
</svelte:head>

<div class="max-w-4xl mx-auto space-y-6">
	<!-- Header -->
	<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-3xl bg-surface p-6 sm:p-8 shadow-sm border border-border-subtle">
		<div>
			<a href="/admin/videos" class="inline-flex items-center text-xs sm:text-sm font-semibold text-text-muted hover:text-primary transition-colors mb-3 group">
				<ArrowLeft strokeWidth={1.75} size={16} class="mr-1.5 group-hover:-translate-x-1 transition-transform" />
				{t('admin.videos.new.backToList', { defaultValue: 'Back to list' })}
			</a>
			<h1 class="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight flex items-center gap-3">
				<div class="p-2 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
					<Youtube strokeWidth={1.75} size={24} />
				</div>
				<span>{t('admin.videos.new.title', { defaultValue: 'Add new Video' })}</span>
			</h1>
		</div>
	</div>

	{#if form?.message}
		<div class="rounded-2xl p-4 {form.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300'} border flex flex-col gap-1">
			<div class="flex items-center gap-2.5">
				<div class="size-2 rounded-full {form.success ? 'bg-emerald-500' : 'bg-red-500'}"></div>
				<p class="text-xs sm:text-sm font-semibold">{form.message}</p>
			</div>
			{#if form.details}
				<p class="text-xs mt-1 pl-4 opacity-80">{form.details}</p>
			{/if}
		</div>
	{/if}

	<form 
		method="POST" 
		use:enhance={() => {
			isSubmitting = true;
			return async ({ update }) => {
				await update();
				isSubmitting = false;
			};
		}}
		class="grid gap-6 md:grid-cols-[1fr_300px]"
	>
		<!-- Left Column -->
		<div class="space-y-6">
			<div class="rounded-3xl bg-surface shadow-sm border border-border-subtle p-6 sm:p-8 space-y-5">
				<label class="block">
					<span class="block text-xs sm:text-sm font-bold text-text-main mb-2 flex items-center gap-2">
						<Youtube strokeWidth={1.75} size={16} class="text-rose-500" /> {t('admin.videos.new.videoTitle', { defaultValue: 'Video Title' })} <span class="text-red-500">*</span>
					</span>
					<input
						type="text"
						name="title"
						required
						bind:value={title}
						class="w-full rounded-2xl bg-soft-bg border border-border-subtle px-4 py-3 text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-semibold text-base sm:text-lg"
						placeholder="{t('admin.videos.new.titlePlaceholder', { defaultValue: 'Example: SvelteKit 2026 Tutorial' })}"
					/>
				</label>

				<label class="block">
					<span class="block text-xs sm:text-sm font-bold text-text-main mb-2 flex items-center gap-2">
						<LinkIcon size={16} class="text-primary" /> {t('admin.videos.new.videoUrl', { defaultValue: 'Video URL Path' })} <span class="text-red-500">*</span>
					</span>
					<input
						type="url"
						name="url"
						required
						bind:value={url}
						class="w-full rounded-2xl bg-soft-bg border border-border-subtle px-4 py-3 text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-xs sm:text-sm"
						placeholder="https://youtube.com/watch?v=..."
					/>
				</label>
			</div>
		</div>

		<!-- Right Column -->
		<div class="space-y-6">
			<!-- Submit Card -->
			<div class="rounded-3xl bg-surface shadow-sm border border-border-subtle p-5">
				<button 
					type="submit" 
					disabled={isSubmitting || !title || !url}
					class="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed py-3 px-4 text-xs sm:text-sm font-bold text-white transition-all shadow-sm cursor-pointer"
				>
					<Save strokeWidth={1.75} size={16} />
					<span>{isSubmitting ? t('admin.videos.new.saving', { defaultValue: 'Saving...' }) : t('admin.videos.new.submitBtn', { defaultValue: 'Add Video' })}</span>
				</button>
			</div>

			<!-- Platform Selection -->
			<div class="rounded-3xl bg-surface shadow-sm border border-border-subtle p-5 space-y-3">
				<label class="block">
					<span class="block text-xs sm:text-sm font-bold text-text-main mb-2 flex items-center gap-2">
						<MonitorPlay strokeWidth={1.75} size={16} /> {t('admin.videos.new.platform', { defaultValue: 'Platform' })} <span class="text-red-500">*</span>
					</span>
					<select
						name="platform"
						required
						bind:value={platform}
						class="w-full rounded-xl bg-soft-bg border border-border-subtle px-3 py-2.5 text-text-main focus:outline-none focus:border-primary text-xs sm:text-sm"
					>
						<option value="YOUTUBE">YouTube</option>
						<option value="TIKTOK">TikTok</option>
						<option value="VIMEO">Vimeo</option>
						<option value="FACEBOOK">Facebook</option>
						<option value="OTHER">{t('admin.videos.new.platformOther', { defaultValue: 'Other' })}</option>
					</select>
				</label>
			</div>
		</div>
	</form>
</div>
