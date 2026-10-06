<script lang="ts">
	import { enhance } from '$app/forms';
	import { MessageSquare, Trash2, ExternalLink, Clock, Mail, Loader2 } from 'lucide-svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import { t } from '$lib/i18n/index.js';

	interface CommentData {
		id: string;
		name: string;
		email?: string;
		content: string;
		createdAt: string;
		postSlug?: string;
	}

	let {
		data,
		form
	}: {
		data: {
			comments: CommentData[];
		};
		form?: { message?: string; success?: boolean };
	} = $props();

	let deletingId = $state<string | null>(null);
	let showDeleteConfirm = $state(false);
	let targetCommentId = $state('');
	let targetCommentSlug = $state('');
	let targetCommentAuthor = $state('');
	let deleteFormEl = $state<HTMLFormElement | null>(null);

	function openDeleteConfirm(id: string, slug: string, author: string) {
		targetCommentId = id;
		targetCommentSlug = slug;
		targetCommentAuthor = author;
		showDeleteConfirm = true;
	}

	function formatTime(dateString: string): string {
		try {
			const date = new Date(dateString);
			return date.toLocaleString('vi-VN', {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		} catch {
			return dateString;
		}
	}
</script>

<svelte:head>
	<title>{t('admin.comments.pageTitle', { defaultValue: 'Manage Comments - Admin CMS' })}</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div
		class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-3xl bg-surface p-6 sm:p-8 shadow-sm border border-border-subtle"
	>
		<div>
			<div
				class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase mb-2"
			>
				<MessageSquare strokeWidth={1.75} size={14} />
				<span>{t('admin.comments.readerInteraction', { defaultValue: 'Reader Interaction' })}</span>
			</div>
			<h1 class="text-2xl sm:text-4xl font-extrabold text-text-main tracking-tight">
				{t('admin.comments.manageComments', { defaultValue: 'Manage Comments' })}
			</h1>
			<p class="mt-1 text-text-muted text-xs sm:text-sm">
				{t('admin.comments.description', {
					defaultValue: 'All feedback and comments from readers on blog posts.'
				})}
			</p>
		</div>
		<div class="flex items-center gap-3">
			<span
				class="px-4 py-2 rounded-xl bg-soft-bg text-text-main text-xs sm:text-sm font-bold border border-border-subtle"
			>
				{t('admin.comments.totalComments', {
					count: data.comments.length,
					defaultValue: `Total: ${data.comments.length} comments`
				})}
			</span>
		</div>
	</div>

	<!-- Thông báo phản hồi -->
	{#if form?.message}
		<div
			class={`rounded-2xl px-6 py-4 flex items-center gap-3 border ${
				form.success
					? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
					: 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300'
			}`}
		>
			<div class={`size-2 rounded-full ${form.success ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
			<p class="text-xs sm:text-sm font-semibold">{t(form.message)}</p>
		</div>
	{/if}

	<!-- Bảng bình luận -->
	<div class="rounded-3xl bg-surface shadow-sm border border-border-subtle overflow-hidden">
		{#if data.comments.length === 0}
			<div class="text-center py-16 px-4 space-y-3">
				<div
					class="size-14 rounded-2xl bg-soft-bg mx-auto flex items-center justify-center text-text-muted"
				>
					<MessageSquare strokeWidth={1.75} size={26} />
				</div>
				<h3 class="text-lg font-bold text-text-main mb-1">
					{t('admin.comments.noComments', { defaultValue: 'No comments yet' })}
				</h3>
				<p class="text-xs sm:text-sm text-text-muted max-w-sm mx-auto">
					{t('admin.comments.noCommentsDesc', {
						defaultValue:
							'When readers comment on blog posts, the information will appear here for you to track easily.'
					})}
				</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-sm text-left">
					<thead class="bg-soft-bg/50 text-text-muted border-b border-border-subtle">
						<tr>
							<th class="px-6 py-4 font-bold text-xs uppercase tracking-wider"
								>{t('admin.comments.sender', { defaultValue: 'Sender' })}</th
							>
							<th class="px-6 py-4 font-bold text-xs uppercase tracking-wider"
								>{t('admin.comments.content', { defaultValue: 'Content' })}</th
							>
							<th class="px-6 py-4 font-bold text-xs uppercase tracking-wider"
								>{t('admin.comments.post', { defaultValue: 'Post' })}</th
							>
							<th class="px-6 py-4 font-bold text-xs uppercase tracking-wider"
								>{t('admin.comments.time', { defaultValue: 'Time' })}</th
							>
							<th class="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right"
								>{t('admin.comments.actions', { defaultValue: 'Actions' })}</th
							>
						</tr>
					</thead>
					<tbody class="divide-y divide-border-subtle">
						{#each data.comments as comment (comment.id)}
							<tr class="hover:bg-soft-bg/40 transition-colors group">
								<!-- Người gửi -->
								<td class="px-6 py-4 align-top whitespace-nowrap">
									<p class="font-bold text-text-main text-sm">
										{comment.name}
									</p>
									{#if comment.email}
										<p class="text-xs text-text-muted flex items-center gap-1 mt-0.5 font-mono">
											<Mail strokeWidth={1.75} size={11} />
											{comment.email}
										</p>
									{/if}
								</td>

								<!-- Nội dung -->
								<td class="px-6 py-4 align-top max-w-md">
									<p class="text-text-body leading-relaxed whitespace-pre-line text-xs sm:text-sm">
										{comment.content}
									</p>
								</td>

								<!-- Bài viết -->
								<td class="px-6 py-4 align-top whitespace-nowrap">
									{#if comment.postSlug}
										<a
											href={`/blog/${comment.postSlug}#comments`}
											target="_blank"
											class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-soft-bg hover:bg-surface border border-border-subtle text-text-main hover:text-primary text-xs font-mono transition-colors"
										>
											<span>{comment.postSlug}</span>
											<ExternalLink strokeWidth={1.75} size={12} />
										</a>
									{:else}
										<span class="text-xs text-text-muted">-</span>
									{/if}
								</td>

								<!-- Thời gian -->
								<td class="px-6 py-4 align-top whitespace-nowrap text-xs text-text-muted font-mono">
									<div class="flex items-center gap-1.5">
										<Clock strokeWidth={1.75} size={12} />
										<span>{formatTime(comment.createdAt)}</span>
									</div>
								</td>

								<!-- Thao tác -->
								<td class="px-6 py-4 align-top text-right whitespace-nowrap">
									<button
										type="button"
										onclick={() =>
											openDeleteConfirm(comment.id, comment.postSlug || '', comment.name)}
										class="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors active:scale-95 cursor-pointer"
										title={t('admin.comments.deleteTooltip', { defaultValue: 'Delete comment' })}
									>
										<Trash2 strokeWidth={1.75} size={13} />
										<span>{t('common.delete', { defaultValue: 'Delete' })}</span>
									</button>
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
	message={targetCommentAuthor
		? t('admin.comments.deleteConfirmAuthored', {
				author: targetCommentAuthor,
				defaultValue: `Are you sure you want to delete the comment by "${targetCommentAuthor}"? This action cannot be undone.`
			})
		: t('admin.dialog.deleteCommentConfirm')}
	loading={deletingId !== null}
	onconfirm={() => {
		deletingId = targetCommentId;
		deleteFormEl?.requestSubmit();
	}}
/>

<form
	bind:this={deleteFormEl}
	method="POST"
	action="?/delete"
	use:enhance={() => {
		return async ({ update }) => {
			deletingId = null;
			showDeleteConfirm = false;
			await update();
		};
	}}
	class="hidden"
>
	<input type="hidden" name="slug" value={targetCommentSlug} />
	<input type="hidden" name="id" value={targetCommentId} />
</form>
