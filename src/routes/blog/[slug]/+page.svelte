<script lang="ts">
	import { t, localized } from '$lib/i18n/index.js';
	import Comments from '$lib/components/Comments.svelte';
	import ShareButton from '$lib/components/ShareButton.svelte';
	import { ArrowLeft } from 'lucide-svelte';
	import { page } from '$app/stores';

	let { data }: { data: any } = $props();

	function formatDate(dateString: string) {
		const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
		return new Date(dateString).toLocaleDateString(undefined, options);
	}
</script>

<svelte:head>
	<title>{localized(data.post, 'title')} - {localized(data.settings, 'authorName')}</title>
	<meta name="description" content={localized(data.post, 'excerpt')} />
	{#if data.post.thumbnail}
		<meta property="og:image" content={data.post.thumbnail} />
	{/if}
</svelte:head>

<div class="bg-main-bg text-text-main antialiased m-0 p-0 selection:bg-soft-bg min-h-screen">
	<article class="max-w-3xl mx-auto px-4 pt-8 pb-24 md:pt-12 md:pb-32">
		
		<!-- Back Button -->
		<a href="/blog" class="inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text-main transition-colors mb-8">
			<ArrowLeft size={16} strokeWidth={1.75} />
			<span>{t('blogMagazine.backToJournal')}</span>
		</a>

		<!-- Article Header -->
		<header class="mb-8 md:mb-24">
			<time class="block text-sm font-semibold tracking-widest text-text-muted uppercase mb-6">
				{formatDate(data.post.meta.date)}
			</time>
			<h1 class="font-serif text-5xl md:text-7xl tracking-tight text-text-main leading-[1.1] mb-8">
				{localized(data.post, 'title')}
			</h1>
			{#if localized(data.post, 'excerpt')}
				<p class="text-xl md:text-2xl text-text-muted leading-relaxed font-serif italic">
					{localized(data.post, 'excerpt')}
				</p>
			{/if}
			
			{#if data.post.thumbnail}
				<figure class="mt-16 -mx-4 md:mx-0 relative aspect-video rounded-none md:rounded-2xl overflow-hidden bg-soft-bg">
					<img src={data.post.thumbnail} alt={localized(data.post, 'title')} class="w-full h-full object-cover" />
				</figure>
			{/if}
		</header>

		<!-- Prose Content -->
		<div class="prose prose-lg md:prose-xl max-w-none prose-neutral dark:prose-invert prose-headings:font-serif prose-headings:font-medium prose-p:leading-relaxed prose-a:text-primary hover:prose-a:text-text-main prose-img:rounded-xl">
			
			<!-- Drop-cap effect using global style wrapper -->
			<div class="drop-cap-article">
				{@html localized(data.post, 'html')}
			</div>

		</div>

		<div class="mt-24"><Comments comments={data.comments || []} slug={data.post.slug} antiSpamChallenge={data.antiSpamChallenge} /></div>
		<!-- Footer -->
		<footer class="mt-32 pt-12 border-t border-border-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
			<div>
				<h3 class="text-sm font-bold uppercase tracking-widest text-text-muted mb-1">{t('blogMagazine.writtenBy')}</h3>
				<p class="text-lg font-serif text-text-main">{localized(data.settings, 'authorName')}</p>
			</div>
			
			<div class="flex items-center gap-4">
				<span class="text-sm font-medium text-text-muted">{t('blogMagazine.shareArticle')}</span>
				<ShareButton 
					url="{$page.url.origin}/blog/{data.post.slug}"
					title={localized(data.post, 'title')}
					description={localized(data.post, 'excerpt')}
					variant="icon"
				/>
			</div>
		</footer>

	</article>
</div>

<style>
	/* Custom CSS for Drop-cap on the first letter of the first paragraph */
	:global(.drop-cap-article > p:first-of-type::first-letter) {
		float: left;
		font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
		font-size: 6rem;
		line-height: 0.8;
		padding-top: 0.1rem;
		padding-right: 0.5rem;
		color: var(--color-text-main, #111);
	}
	@media (prefers-color-scheme: dark) {
		:global(.drop-cap-article > p:first-of-type::first-letter) {
			color: var(--color-text-main, #fff);
		}
	}
	:global(html.dark .drop-cap-article > p:first-of-type::first-letter) {
		color: #fff;
	}
</style>
