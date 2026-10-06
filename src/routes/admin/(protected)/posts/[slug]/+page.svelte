<script lang="ts">
	import { enhance } from '$app/forms';
	import { slugify } from '$lib/utils/index.js';
	import MarkdownEditor from '$lib/components/MarkdownEditor.svelte';
	import {
		ArrowLeft,
		Save,
		FileText,
		Image as ImageIcon,
		Tag,
		Calendar,
		PenLine,
		ExternalLink
	} from 'lucide-svelte';
	import { t } from '$lib/i18n/index.js';

	let {
		data,
		form
	}: {
		data: {
			post: {
				slug: string;
				title: string;
				date: string;
				tags: string[];
				thumbnail: string;
				content: string;
				[key: string]: any;
			};
			schema?: any;
		};
		form?: { message?: string; details?: string };
	} = $props();

	let title = $state(data.post.title);
	let slug = $state(data.post.slug);
	let content = $state(data.post.content);
	let isSubmitting = $state(false);

	const onTitle = (value: string) => {
		title = value;
		slug = slugify(value) || data.post.slug;
	};
</script>

<svelte:head>
	<title
		>{t('admin.posts.edit.pageTitle', {
			defaultValue: 'Edit Post: {title} - Admin',
			title: data.post.title
		})}</title
	>
</svelte:head>

<div class="max-w-5xl mx-auto space-y-6">
	<!-- Header -->
	<div
		class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-3xl bg-surface p-6 sm:p-8 shadow-sm border border-border-subtle"
	>
		<div>
			<a
				href="/admin/posts"
				class="inline-flex items-center text-xs sm:text-sm font-semibold text-text-muted hover:text-primary transition-colors mb-3 group"
			>
				<ArrowLeft
					strokeWidth={1.75}
					size={16}
					class="mr-1.5 group-hover:-translate-x-1 transition-transform"
				/>
				{t('admin.posts.edit.backToList', { defaultValue: 'Back to list' })}
			</a>
			<h1
				class="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight flex items-center gap-3"
			>
				<div class="p-2 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
					<PenLine strokeWidth={1.75} size={24} />
				</div>
				<span>{t('admin.posts.edit.heading', { defaultValue: 'Edit Post' })}</span>
			</h1>
		</div>
		<div class="flex items-center gap-3">
			<a
				href="/blog/{data.post.slug}"
				target="_blank"
				class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-soft-bg hover:bg-surface border border-border-subtle text-text-main font-semibold text-xs sm:text-sm transition-colors"
			>
				<ExternalLink strokeWidth={1.75} size={15} />
				<span>{t('admin.posts.edit.viewPost', { defaultValue: 'View Post' })}</span>
			</a>
		</div>
	</div>

	{#if form?.message}
		<div class="rounded-2xl bg-red-500/10 border border-red-500/20 px-6 py-4 flex flex-col gap-1">
			<div class="flex items-center gap-2.5">
				<div class="size-2 rounded-full bg-red-500"></div>
				<p class="text-xs sm:text-sm font-semibold text-red-600 dark:text-red-400">
					{t(form.message)}
				</p>
			</div>
			{#if form.details}
				<p class="text-xs text-red-600 dark:text-red-400 mt-1 pl-4">{t(form.details)}</p>
			{/if}
		</div>
	{/if}

	<form
		method="POST"
		enctype="multipart/form-data"
		use:enhance={() => {
			isSubmitting = true;
			return async ({ update }) => {
				await update();
				isSubmitting = false;
			};
		}}
		class="grid gap-6 lg:grid-cols-[1fr_350px]"
	>
		<!-- Cột Trái: Nội dung chính -->
		<div class="space-y-6">
			<div class="rounded-3xl bg-surface shadow-sm border border-border-subtle p-6 sm:p-8">
				<label class="block mb-6">
					<span
						class="block text-xs sm:text-sm font-bold text-text-main mb-2 flex items-center gap-2"
					>
						<FileText strokeWidth={1.75} size={16} class="text-primary" />
						{t('admin.posts.edit.form.titleLabel', { defaultValue: 'Post Title' })}
						<span class="text-red-500">*</span>
					</span>
					<input
						type="text"
						name="title"
						required
						class="w-full rounded-2xl bg-soft-bg border border-border-subtle px-4 py-3 text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-semibold text-base sm:text-lg"
						bind:value={title}
						oninput={(event) => onTitle(event.currentTarget.value)}
						placeholder={t('admin.posts.edit.form.titlePlaceholder', {
							defaultValue: 'Enter an engaging title...'
						})}
					/>
				</label>

				<div class="space-y-2">
					<span class="block text-xs sm:text-sm font-bold text-text-main flex items-center gap-2">
						<FileText strokeWidth={1.75} size={16} class="text-primary" />
						{t('admin.posts.edit.form.contentLabel', { defaultValue: 'Content' })}
						<span class="text-red-500">*</span>
					</span>
					<div
						class="rounded-2xl overflow-hidden border border-border-subtle focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all"
					>
						<MarkdownEditor
							bind:value={content}
							placeholder={t('admin.posts.edit.form.contentPlaceholder', {
								defaultValue: 'Write your post content in Markdown...'
							})}
							height="650px"
							showWordCount={true}
							autosave={true}
							autosaveKey={`post-edit-${data.post.slug}`}
							theme="light"
						/>
					</div>
					<input type="hidden" name="content" bind:value={content} />
				</div>
			</div>
		</div>

		<!-- Cột Phải: Thông tin phụ & Action -->
		<div class="space-y-6">
			<!-- Publish Card -->
			<div
				class="rounded-3xl bg-surface shadow-sm border border-border-subtle p-6 flex flex-col gap-4"
			>
				<h3
					class="font-bold text-text-main flex items-center gap-2 border-b border-border-subtle pb-3 text-sm sm:text-base"
				>
					{t('admin.posts.edit.sidebar.update', { defaultValue: 'Update' })}
				</h3>
				<button
					type="submit"
					disabled={isSubmitting || !title || !content}
					class="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed py-3 px-4 text-xs sm:text-sm font-bold text-white transition-all shadow-sm cursor-pointer"
				>
					<Save strokeWidth={1.75} size={16} />
					<span
						>{isSubmitting
							? t('admin.posts.edit.sidebar.saving', { defaultValue: 'Saving...' })
							: t('admin.posts.edit.sidebar.saveChanges', { defaultValue: 'Save Changes' })}</span
					>
				</button>
			</div>

			<!-- Meta Info Card -->
			<div class="rounded-3xl bg-surface shadow-sm border border-border-subtle p-6 space-y-4">
				<h3
					class="font-bold text-text-main flex items-center gap-2 border-b border-border-subtle pb-3 text-sm sm:text-base"
				>
					{t('admin.posts.edit.sidebar.details', { defaultValue: 'Details' })}
				</h3>

				<label class="block">
					<span class="block text-xs sm:text-sm font-semibold text-text-main mb-1.5">
						URL Slug
					</span>
					<input
						type="text"
						name="slug"
						class="w-full rounded-xl bg-soft-bg border border-border-subtle px-3.5 py-2.5 text-text-main focus:outline-none focus:border-primary font-mono text-xs sm:text-sm"
						bind:value={slug}
						placeholder="url-bai-viet"
					/>
					<p class="text-[11px] text-text-muted mt-1.5 font-mono break-all">
						/blog/{slug || '...'}
					</p>
				</label>

				<label class="block">
					<span
						class="block text-xs sm:text-sm font-semibold text-text-main mb-1.5 flex items-center gap-1.5"
					>
						<Calendar strokeWidth={1.75} size={15} />
						{t('admin.posts.edit.sidebar.date', { defaultValue: 'Date' })}
					</span>
					<input
						type="date"
						name="date"
						class="w-full rounded-xl bg-soft-bg border border-border-subtle px-3.5 py-2.5 text-text-main focus:outline-none focus:border-primary text-xs sm:text-sm"
						value={data.post.date
							? new Date(data.post.date).toISOString().slice(0, 10)
							: new Date().toISOString().slice(0, 10)}
					/>
				</label>

				<label class="block">
					<span
						class="block text-xs sm:text-sm font-semibold text-text-main mb-1.5 flex items-center gap-1.5"
					>
						<Tag strokeWidth={1.75} size={15} />
						{t('admin.posts.edit.sidebar.tags', { defaultValue: 'Tags' })}
					</span>
					<input
						type="text"
						name="tags"
						class="w-full rounded-xl bg-soft-bg border border-border-subtle px-3.5 py-2.5 text-text-main focus:outline-none focus:border-primary text-xs sm:text-sm"
						value={Array.isArray(data.post.tags) ? data.post.tags.join(', ') : data.post.tags || ''}
						placeholder={t('admin.posts.edit.sidebar.tagsPlaceholder', {
							defaultValue: 'javascript, svelte, tips'
						})}
					/>
				</label>

				<!-- Dynamic Schema Fields -->
				{#if /** @type {any} */ (data).schema && Array.isArray(/** @type {any} */ (data).schema) && /** @type {any} */ (data).schema.length > 0}
					<div class="pt-4 mt-4 border-t border-border-subtle space-y-4">
						<h4 class="text-xs sm:text-sm font-bold text-text-muted uppercase tracking-wider mb-2">
							{t('admin.posts.edit.sidebar.customFields', { defaultValue: 'Custom Fields' })}
						</h4>

						{#each data.schema as field}
							<label class="block">
								<span
									class="block text-xs sm:text-sm font-semibold text-text-main mb-1.5 flex items-center gap-1.5"
								>
									{field.label || field.name}
									{#if field.required}
										<span class="text-red-500">*</span>
									{/if}
								</span>

								{#if field.type === 'textarea'}
									<textarea
										name={field.name}
										required={field.required}
										placeholder={field.placeholder || ''}
										value={/** @type {any} */ (data.post)[field.name] || ''}
										class="w-full rounded-xl bg-soft-bg border border-border-subtle px-3.5 py-2.5 text-text-main focus:outline-none focus:border-primary text-xs sm:text-sm min-h-[80px]"
									></textarea>
								{:else if field.type === 'select'}
									<select
										name={field.name}
										required={field.required}
										value={/** @type {any} */ (data.post)[field.name] || ''}
										class="w-full rounded-xl bg-soft-bg border border-border-subtle px-3.5 py-2.5 text-text-main focus:outline-none focus:border-primary text-xs sm:text-sm"
									>
										{#if !field.required}
											<option value=""
												>-- {t('admin.common.select', { defaultValue: 'Select' })} --</option
											>
										{/if}
										{#each field.options || [] as option}
											<option value={option.value || option}>{option.label || option}</option>
										{/each}
									</select>
								{:else}
									<input
										type={field.type === 'number' ? 'number' : 'text'}
										name={field.name}
										required={field.required}
										placeholder={field.placeholder || ''}
										value={/** @type {any} */ (data.post)[field.name] || ''}
										class="w-full rounded-xl bg-soft-bg border border-border-subtle px-3.5 py-2.5 text-text-main focus:outline-none focus:border-primary text-xs sm:text-sm"
									/>
								{/if}
							</label>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Media Card -->
			<div class="rounded-3xl bg-surface shadow-sm border border-border-subtle p-6 space-y-4">
				<h3
					class="font-bold text-text-main flex items-center gap-2 border-b border-border-subtle pb-3 text-sm sm:text-base"
				>
					{t('admin.posts.edit.sidebar.thumbnail', { defaultValue: 'Thumbnail' })}
				</h3>

				<label class="block">
					<span
						class="block text-xs sm:text-sm font-semibold text-text-main mb-1.5 flex items-center gap-1.5"
					>
						<ImageIcon size={15} /> Image URL
					</span>
					<input
						type="text"
						name="thumbnail"
						value={data.post.thumbnail || ''}
						class="w-full rounded-xl bg-soft-bg border border-border-subtle px-3.5 py-2.5 text-text-main focus:outline-none focus:border-primary text-xs sm:text-sm"
						placeholder="https://..."
					/>
				</label>

				<div>
					<div
						class="relative w-full rounded-2xl border-2 border-dashed border-border-subtle hover:border-primary bg-soft-bg/50 p-6 flex flex-col items-center justify-center gap-2 transition-colors group cursor-pointer"
					>
						<ImageIcon
							size={24}
							class="text-text-muted group-hover:text-primary transition-colors"
						/>
						<span class="text-xs font-semibold text-text-main text-center">
							{@html t('admin.posts.edit.sidebar.uploadImage', {
								defaultValue:
									'Upload New Image<br/><span class="text-[10px] font-normal text-text-muted">JPG, PNG, WebP</span>'
							})}
						</span>
						<input
							type="file"
							name="thumbnail_file"
							accept="image/*"
							class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
						/>
					</div>
				</div>
			</div>
		</div>
	</form>
</div>
