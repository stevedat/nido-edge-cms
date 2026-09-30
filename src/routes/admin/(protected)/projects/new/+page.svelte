<script lang="ts">
	import { enhance } from '$app/forms';
	import { t } from '$lib/i18n/index.js';
	import { ArrowLeft, Save, FolderGit2, Link as LinkIcon, Tag, AlignLeft, Info } from 'lucide-svelte';

	let { form }: { form?: { message?: string; details?: string; success?: boolean } } = $props();
	let isSubmitting = $state(false);
	
	let title = $state('');
	let description = $state('');
</script>

<svelte:head>
	<title>{t('admin.projects.newProjectTitle', { defaultValue: 'New Project - Admin' })}</title>
</svelte:head>

<div class="max-w-4xl mx-auto space-y-6">
	<!-- Header -->
	<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-3xl bg-surface p-6 sm:p-8 shadow-sm border border-border-subtle">
		<div>
			<a href="/admin/projects" class="inline-flex items-center text-xs sm:text-sm font-semibold text-text-muted hover:text-primary transition-colors mb-3 group">
				<ArrowLeft strokeWidth={1.75} size={16} class="mr-1.5 group-hover:-translate-x-1 transition-transform" />
				{t('admin.projects.backToList', { defaultValue: 'Back to list' })}
			</a>
			<h1 class="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight flex items-center gap-3">
				<div class="p-2 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
					<FolderGit2 strokeWidth={1.75} size={24} />
				</div>
				<span>{t('admin.projects.addNewProject', { defaultValue: 'Add New Project' })}</span>
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
						<FolderGit2 strokeWidth={1.75} size={16} class="text-indigo-500" /> {t('admin.projects.projectName', { defaultValue: 'Project Name' })} <span class="text-red-500">*</span>
					</span>
					<input
						type="text"
						name="title"
						required
						bind:value={title}
						class="w-full rounded-2xl bg-soft-bg border border-border-subtle px-4 py-3 text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-semibold text-base sm:text-lg"
						placeholder="{t('admin.projects.projectNamePlaceholder', { defaultValue: 'e.g. Edge CMS Platform' })}"
					/>
				</label>

				<label class="block">
					<span class="block text-xs sm:text-sm font-bold text-text-main mb-2 flex items-center gap-2">
						<AlignLeft strokeWidth={1.75} size={16} class="text-indigo-500" /> {t('admin.projects.projectDesc', { defaultValue: 'Project Description' })} <span class="text-red-500">*</span>
					</span>
					<textarea
						name="description"
						rows="4"
						required
						bind:value={description}
						class="w-full rounded-2xl bg-soft-bg border border-border-subtle px-4 py-3 text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none text-xs sm:text-sm leading-relaxed"
						placeholder="{t('admin.projects.projectDescPlaceholder', { defaultValue: 'Brief description of goals and outcomes...' })}"
					></textarea>
				</label>
			</div>
		</div>

		<!-- Right Column -->
		<div class="space-y-6">
			<!-- Submit Card -->
			<div class="rounded-3xl bg-surface shadow-sm border border-border-subtle p-5">
				<button 
					type="submit" 
					disabled={isSubmitting || !title || !description}
					class="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed py-3 px-4 text-xs sm:text-sm font-bold text-white transition-all shadow-sm cursor-pointer"
				>
					<Save strokeWidth={1.75} size={16} />
					<span>{isSubmitting ? t('common.saving', { defaultValue: 'Saving...' }) : t('admin.projects.addProjectBtn', { defaultValue: 'Add Project' })}</span>
				</button>
			</div>

			<!-- Meta Data -->
			<div class="rounded-3xl bg-surface shadow-sm border border-border-subtle p-5 space-y-4">
				<label class="block">
					<span class="block text-xs sm:text-sm font-bold text-text-main mb-2 flex items-center gap-2">
						<LinkIcon size={16} /> {t('admin.projects.demoLink', { defaultValue: 'Demo / Website Link' })}
					</span>
					<input
						type="url"
						name="link"
						class="w-full rounded-xl bg-soft-bg border border-border-subtle px-3 py-2 text-text-main focus:outline-none focus:border-primary text-xs sm:text-sm"
						placeholder="https://example.com"
					/>
				</label>

				<label class="block">
					<span class="block text-xs sm:text-sm font-bold text-text-main mb-2 flex items-center gap-2">
						<Tag strokeWidth={1.75} size={16} /> {t('admin.projects.tags', { defaultValue: 'Tags (comma separated)' })}
					</span>
					<input
						type="text"
						name="tags"
						class="w-full rounded-xl bg-soft-bg border border-border-subtle px-3 py-2 text-text-main focus:outline-none focus:border-primary text-xs sm:text-sm"
						placeholder="SvelteKit, Tailwind, Cloudflare"
					/>
				</label>
			</div>
		</div>
	</form>
</div>