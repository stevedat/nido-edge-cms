<script lang="ts">
	import { t, localized } from '$lib/i18n/index.js';
	import { ArrowRight } from 'lucide-svelte';

	let { data }: { data: any } = $props();

	// Format date nicely
	function formatDate(dateString: string) {
		const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
		return new Date(dateString).toLocaleDateString(undefined, options);
	}
</script>

<svelte:head>
	<title>{localized(data.settings, 'authorName')} - {t('nav.blog')}</title>
	<meta name="description" content="Editorial Journal" />
</svelte:head>

<div class="bg-main-bg text-text-main antialiased m-0 p-0 selection:bg-soft-bg min-h-screen">
	<main class="max-w-4xl mx-auto px-4 pt-8 pb-24 md:pt-12 md:pb-32">
		
		<!-- Header -->
		<header class="mb-12 border-b-2 border-text-main pb-8">
			<h1 class="font-serif text-6xl md:text-8xl tracking-tight text-text-main">
				{t('blogMagazine.heroTitle')}
			</h1>
			<p class="text-xl text-text-muted mt-6 max-w-xl">
				{t('blogMagazine.heroDesc')}
			</p>
		</header>

		<!-- Articles List -->
		{#if data.posts && data.posts.length > 0}
			<div class="space-y-0">
				{#each data.posts as post}
					<article class="group block border-b border-border-subtle hover:border-border-strong transition-colors py-12 relative cursor-pointer">
						<a href="/blog/{post.slug}" class="absolute inset-0 z-10" aria-label={localized(post, 'title')}></a>
						
						<div class="flex flex-col md:flex-row md:items-baseline gap-4 md:gap-12">
							<div class="w-full md:w-32 shrink-0">
								<time class="text-sm font-semibold tracking-widest text-text-muted uppercase">
									{formatDate(post.meta.date)}
								</time>
							</div>
							
							<div class="flex-1 space-y-4">
								<h2 class="font-serif text-3xl md:text-4xl text-text-main group-hover:text-primary transition-colors leading-tight">
									{localized(post, 'title')}
								</h2>
								{#if localized(post, 'excerpt')}
									<p class="text-lg text-text-body leading-relaxed max-w-2xl">
										{localized(post, 'excerpt')}
									</p>
								{/if}
								
								<div class="flex items-center gap-2 text-sm font-medium text-text-main pt-4 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
									<span>{t('blogMagazine.readArticle')}</span>
									<ArrowRight size={16} strokeWidth={1.75} />
								</div>
							</div>
						</div>
					</article>
				{/each}
			</div>
		{:else}
			<div class="py-32 text-center border-y border-border-subtle">
				<p class="font-serif text-3xl text-text-muted">{t('blogMagazine.emptyState')}</p>
			</div>
		{/if}

	</main>
</div>
