<script>
	import { page } from '$app/stores';
	import { t } from '$lib/i18n/index.js';
</script>

<svelte:head>
	<title>{t('admin.posts.error.notFoundTitle', { defaultValue: 'Post Not Found | Admin' })}</title>
</svelte:head>

<div class="min-h-screen bg-main-bg p-6 flex items-center justify-center">
	<div class="max-w-md w-full">
		<div class="bg-surface border border-border-subtle rounded-2xl shadow-xs p-8 text-center">
			<div class="mb-6">
				<div class="text-5xl mb-4">📝</div>
				<h1 class="text-2xl font-bold text-text-main mb-2">
					{t('admin.posts.error.heading', { defaultValue: 'Post does not exist' })}
				</h1>
				<p class="text-text-muted text-sm">
					{t('admin.posts.error.slugNotFound', { defaultValue: 'Cannot find post with slug:' })} <code class="bg-soft-bg text-text-main border border-border-subtle px-2 py-0.5 rounded-md text-xs font-mono">{$page.params.slug}</code>
				</p>
			</div>

			<div class="space-y-4">
				<p class="text-xs text-text-muted">
					{t('admin.posts.error.desc', { defaultValue: 'The post may have been deleted or the static URL changed.' })}
				</p>
				
				<div class="flex flex-col sm:flex-row gap-3 justify-center pt-2">
					<a 
						href="/admin/posts" 
						class="bg-primary hover:opacity-90 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-xs active:scale-98"
					>
						{t('admin.posts.error.backToList', { defaultValue: 'Posts list' })}
					</a>
					<a 
						href="/admin/posts/new" 
						class="bg-soft-bg hover:bg-surface border border-border-subtle text-text-main font-semibold px-5 py-2.5 rounded-xl text-sm transition-all active:scale-98"
					>
						{t('admin.posts.error.createNew', { defaultValue: 'Create new post' })}
					</a>
				</div>
			</div>
		</div>
	</div>
</div>