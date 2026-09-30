<script lang="ts">
	import { enhance } from '$app/forms';
	import { PenLine, Trash2, Plus, FileText, Loader2 } from 'lucide-svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import { t } from '$lib/i18n/index.js';

	let isDeleting = $state(false);
	let showDeleteConfirm = $state(false);
	let deletePostSlug = $state('');
	let deletePostTitle = $state('');
	let deleteFormEl = $state<HTMLFormElement | null>(null);

	function openDeleteConfirm(slug: string, title: string) {
		deletePostSlug = slug;
		deletePostTitle = title;
		showDeleteConfirm = true;
	}

	let { data, form }:
		{
			data: {
				posts: { slug: string; meta: { title: string; date: string; tags: string[] } }[];
			};
			form?: { message?: string };
		} = $props();
</script>

<svelte:head>
	<title>{t('admin.posts.title', { defaultValue: 'Manage Posts - Admin' })}</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-3xl bg-surface p-6 sm:p-8 shadow-sm border border-border-subtle">
		<div>
			<div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase mb-2">
				<FileText strokeWidth={1.75} size={14} />
				<span>{t('admin.posts.contentManagement', { defaultValue: 'Content Management' })}</span>
			</div>
			<h1 class="text-2xl sm:text-4xl font-extrabold text-text-main tracking-tight">{t('admin.posts.heading', { defaultValue: 'Manage Posts' })}</h1>
			<p class="mt-1 text-text-muted text-xs sm:text-sm">{t('admin.posts.description', { defaultValue: 'List of posts displayed on the Blog page.' })}</p>
		</div>
		<a 
			class="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-light px-5 py-2.5 text-xs sm:text-sm font-bold text-white transition-all shadow-sm active:scale-98" 
			href="/admin/posts/new"
		>
			<Plus strokeWidth={1.75} size={16} />
			<span>{t('admin.posts.newPost', { defaultValue: 'New Post' })}</span>
		</a>
	</div>

	{#if form?.message}
		<div class="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-6 py-4 flex items-center gap-3">
			<div class="size-2 rounded-full bg-emerald-500"></div>
			<p class="text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-300">{form.message}</p>
		</div>
	{/if}

	<!-- Table -->
	<div class="rounded-3xl bg-surface shadow-sm border border-border-subtle overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-sm text-left">
				<thead class="bg-soft-bg/50 text-text-muted border-b border-border-subtle">
					<tr>
						<th class="px-6 py-4 font-bold text-xs uppercase tracking-wider">{t('admin.posts.table.title', { defaultValue: 'Title' })}</th>
						<th class="px-6 py-4 font-bold text-xs uppercase tracking-wider">{t('admin.posts.table.date', { defaultValue: 'Publish Date' })}</th>
						<th class="px-6 py-4 font-bold text-xs uppercase tracking-wider">{t('admin.posts.table.tags', { defaultValue: 'Tags' })}</th>
						<th class="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right">{t('admin.posts.table.actions', { defaultValue: 'Actions' })}</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-border-subtle">
					{#each data.posts as post}
						<tr class="hover:bg-soft-bg/40 transition-colors group">
							<td class="px-6 py-4">
								<p class="font-bold text-text-main mb-1 group-hover:text-primary transition-colors text-sm sm:text-base">{post.meta.title}</p>
								<p class="text-xs text-text-muted font-mono">{post.slug}</p>
							</td>
							<td class="px-6 py-4">
								<span class="inline-flex items-center px-2.5 py-1 rounded-md bg-soft-bg text-text-muted text-xs font-semibold">
									{new Date(post.meta.date || new Date()).toLocaleDateString('vi-VN')}
								</span>
							</td>
							<td class="px-6 py-4">
								<div class="flex flex-wrap gap-1.5">
									{#each post.meta.tags || [] as tag}
										<span class="inline-flex px-2 py-0.5 rounded-md bg-soft-bg text-text-muted text-[11px] font-semibold border border-border-subtle">
											#{typeof (tag as any) === 'object' ? (tag as any)?.name || tag : tag}
										</span>
									{/each}
								</div>
							</td>
							<td class="px-6 py-4 text-right">
								<div class="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
									<a 
										class="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-soft-bg transition-colors" 
										href={`/admin/posts/${post.slug}`}
										title={t('admin.posts.table.edit', { defaultValue: 'Edit' })}
									>
										<PenLine strokeWidth={1.75} size={16} />
									</a>
									<button
										type="button"
										onclick={() => openDeleteConfirm(post.slug, post.meta.title)}
										class="p-2 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
										title={t('admin.posts.table.delete', { defaultValue: 'Delete Post' })}
									>
										<Trash2 strokeWidth={1.75} size={16} />
									</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>

<ConfirmDialog
	bind:open={showDeleteConfirm}
	title={t('admin.dialog.deleteTitle')}
	message={deletePostTitle ? t('admin.posts.dialog.deletePostConfirmWithTitle', { defaultValue: `Are you sure you want to delete the post "{title}"? This action cannot be undone.`, title: deletePostTitle }) : t('admin.dialog.deletePostConfirm')}
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
	<input type="hidden" name="slug" value={deletePostSlug} />
</form>
