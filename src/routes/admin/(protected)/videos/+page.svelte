<script lang="ts">
	import { enhance } from '$app/forms';
	import { Youtube, Plus, PenLine, Trash2, ExternalLink, Video } from 'lucide-svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import { t } from '$lib/i18n/index.js';

	let { data, form }: { 
		data: { videos: { id: string; title: string; platform: string; url: string }[] },
		form: any
	} = $props();

	let deleteVideoId = $state('');
	let deleteVideoTitle = $state('');
	let showDeleteConfirm = $state(false);
	let isDeleting = $state(false);
	let deleteFormEl = $state<HTMLFormElement | null>(null);

	function confirmDelete(videoId: string, videoTitle: string) {
		deleteVideoId = videoId;
		deleteVideoTitle = videoTitle;
		showDeleteConfirm = true;
	}
</script>

<svelte:head>
	<title>{t('admin.videos.metaTitle', { defaultValue: 'Manage Videos - Admin' })}</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-6">
	<!-- Header -->
	<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-3xl bg-surface p-6 sm:p-8 shadow-sm border border-border-subtle">
		<div>
			<p class="text-xs uppercase tracking-[0.2em] text-text-muted font-bold mb-2">{t('admin.videos.mediaManagement', { defaultValue: 'Media Management' })}</p>
			<h1 class="text-2xl sm:text-4xl font-extrabold text-text-main tracking-tight flex items-center gap-3">
				<div class="p-2.5 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
					<Youtube strokeWidth={1.75} size={28} />
				</div>
				<span>{t('admin.videos.title', { defaultValue: 'Manage Videos' })}</span>
			</h1>
		</div>
		<div class="flex items-center gap-3">
			<a 
				href="/admin/videos/new" 
				class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white font-bold text-xs sm:text-sm transition-all shadow-sm active:scale-98"
			>
				<Plus strokeWidth={1.75} size={16} />
				<span>{t('admin.videos.addVideo', { defaultValue: 'Add Video' })}</span>
			</a>
		</div>
	</div>

	{#if form?.message}
		<div class="rounded-2xl p-4 {form.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300'} border">
			{form.message}
		</div>
	{/if}

	<!-- Videos List -->
	<div class="rounded-3xl bg-surface shadow-sm border border-border-subtle overflow-hidden">
		{#if data.videos.length === 0}
			<div class="flex flex-col items-center justify-center py-16 text-center px-4 space-y-4">
				<div class="size-16 bg-soft-bg rounded-2xl flex items-center justify-center text-text-muted">
					<Video strokeWidth={1.75} size={32} />
				</div>
				<div class="space-y-1">
					<h3 class="text-lg font-bold text-text-main">{t('admin.videos.emptyTitle', { defaultValue: 'No videos yet' })}</h3>
					<p class="text-xs sm:text-sm text-text-muted max-w-sm">{t('admin.videos.emptyDesc', { defaultValue: 'Add your first video to the system.' })}</p>
				</div>
				<a 
					href="/admin/videos/new" 
					class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-text-main text-main-bg font-bold text-xs sm:text-sm transition-all shadow-sm"
				>
					<Plus strokeWidth={1.75} size={16} /> 
					<span>{t('admin.videos.addVideoNow', { defaultValue: 'Add video now' })}</span>
				</a>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-left border-collapse">
					<thead>
						<tr class="border-b border-border-subtle bg-soft-bg/50">
							<th class="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">{t('admin.videos.colName', { defaultValue: 'Video Name' })}</th>
							<th class="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">{t('admin.videos.colPlatform', { defaultValue: 'Platform' })}</th>
							<th class="px-6 py-4 text-right text-xs font-bold text-text-muted uppercase tracking-wider w-32">{t('admin.videos.colActions', { defaultValue: 'Actions' })}</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border-subtle">
						{#each data.videos as video}
							<tr class="group hover:bg-soft-bg/40 transition-colors">
								<td class="px-6 py-4">
									<div class="flex flex-col">
										<span class="font-bold text-text-main group-hover:text-primary transition-colors text-sm sm:text-base">{video.title}</span>
										<a href={video.url} target="_blank" class="text-xs font-medium text-text-muted hover:text-primary flex items-center gap-1 mt-1 transition-colors w-fit">
											{video.url} <ExternalLink strokeWidth={1.75} size={12} />
										</a>
									</div>
								</td>
								<td class="px-6 py-4">
									<span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold border {video.platform === 'YOUTUBE' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' : 'bg-soft-bg text-text-muted border-border-subtle'}">
										{video.platform}
									</span>
								</td>
								<td class="px-6 py-4 text-right">
									<div class="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
										<a href="/admin/videos/{video.id}" class="p-2 text-text-muted hover:text-primary hover:bg-soft-bg rounded-lg transition-all" title={t('admin.videos.edit', { defaultValue: 'Edit' })}>
											<PenLine strokeWidth={1.75} size={16} />
										</a>
										<button onclick={() => confirmDelete(video.id, video.title)} class="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer" title={t('admin.videos.delete', { defaultValue: 'Delete' })}>
											<Trash2 strokeWidth={1.75} size={16} />
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>

<ConfirmDialog
	bind:open={showDeleteConfirm}
	title={t('admin.dialog.deleteTitle')}
	message={deleteVideoTitle ? t('admin.videos.deleteConfirm', { title: deleteVideoTitle, defaultValue: `Are you sure you want to delete the video "${deleteVideoTitle}"? This action cannot be undone.` }) : t('admin.dialog.deleteVideoConfirm')}
	loading={isDeleting}
	onconfirm={() => {
		deleteFormEl?.requestSubmit();
	}}
/>

<form
	bind:this={deleteFormEl}
	method="POST"
	action="?/delete"
	use:enhance={() => {
		isDeleting = true;
		return async ({ update }) => {
			await update();
			isDeleting = false;
			showDeleteConfirm = false;
		};
	}}
	class="hidden"
>
	<input type="hidden" name="id" value={deleteVideoId} />
</form>
