<script lang="ts">
	import { t, localized } from '$lib/i18n/index.js';
	import VideoEmbed from '$lib/components/VideoEmbed.svelte';
	import { openFreeSlotModal } from '$lib/stores/freeSlot.js';

	interface Video {
		id: string;
		title: string;
		url: string;
		platform: string;
	}

	let { data }: {
		data: {
			settings: any;
			videos: Video[];
		};
	} = $props();
</script>

<svelte:head>
	<title>{localized(data.settings, 'authorName')} - {t('videoTheater.heroTitle')}</title>
	<meta name="description" content={t('videoTheater.heroDesc')} />
</svelte:head>

<div class="bg-main-bg text-text-main antialiased m-0 p-0 selection:bg-soft-bg min-h-screen">
	<!-- Hero Section -->
	<header class="pt-32 pb-16 flex flex-col items-center justify-center text-center px-4">
		<h1 class="font-serif text-6xl md:text-8xl tracking-tight text-text-main leading-[1.1] mb-6">
			{t('videoTheater.heroTitle')}
		</h1>
		<p class="text-xl text-text-muted max-w-2xl">
			{t('videoTheater.heroDesc')}
		</p>
	</header>

	<!-- Theater Section -->
	<section class="max-w-5xl mx-auto px-4 pb-32 space-y-32">
		{#if data.videos && data.videos.length > 0}
			{#each data.videos as video, index}
				<article class="space-y-6">
					<h2 class="font-serif text-3xl md:text-4xl text-text-main text-center">
						{localized(video, 'title')}
					</h2>
					<div class="rounded-3xl overflow-hidden bg-surface aspect-video shadow-2xl">
						<VideoEmbed url={video.url} platform={video.platform} title={localized(video, 'title')} autoplay={index === 0} />
					</div>
				</article>
			{/each}
		{:else}
			<div class="text-center py-16 border-y border-border-subtle">
				<p class="font-serif text-3xl text-text-muted">No videos found.</p>
			</div>
		{/if}
	</section>

	<!-- Call to action Section (Matches Homepage & About) -->
	<section class="py-40 bg-surface dark:bg-soft-bg text-center rounded-t-[3rem] border-t border-border-subtle relative z-10">
		<div class="max-w-2xl mx-auto px-4">
			<h2 class="font-serif text-5xl md:text-6xl mb-8 text-text-main">{t('homeStory.readyToStart')}</h2>
			<p class="text-text-muted text-lg mb-12">
				{t('homeStory.ctaMessage')}
			</p>
			
			{#if data.settings.headerCtaAction === 'modal'}
				<button 
					onclick={() => openFreeSlotModal()}
					class="px-8 py-4 rounded-full bg-text-main text-surface font-medium hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-black/5 dark:shadow-none cursor-pointer"
				>
					{localized(data.settings, 'headerCtaText') || t('nav.freeSlotCTA')}
				</button>
			{:else}
				<a 
					href={data.settings.headerCtaUrl || '#connect'}
					class="inline-block px-8 py-4 rounded-full bg-text-main text-surface font-medium hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-black/5 dark:shadow-none"
				>
					{localized(data.settings, 'headerCtaText') || t('nav.freeSlotCTA')}
				</a>
			{/if}
			
			<div class="mt-12 flex items-center justify-center gap-4 text-sm font-medium text-text-muted">
				{#if data.settings.githubUrl}
					<a href={data.settings.githubUrl} target="_blank" class="hover:text-text-main transition">GitHub</a>
					<span>•</span>
				{/if}
				{#if data.settings.contactEmail}
					<a href="mailto:{data.settings.contactEmail}" class="hover:text-text-main transition">Email</a>
					<span>•</span>
				{/if}
				{#if data.settings.linkedinUrl}
					<a href={data.settings.linkedinUrl} target="_blank" class="hover:text-text-main transition">LinkedIn</a>
				{/if}
			</div>
		</div>
	</section>
</div>
