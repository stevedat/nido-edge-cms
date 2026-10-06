<script lang="ts">
	import { t, localized } from '$lib/i18n/index.js';
	import { ArrowDown, ArrowRight } from 'lucide-svelte';
	import { openFreeSlotModal } from '$lib/stores/freeSlot.js';

	let { data }: { data: any } = $props();

	function scrollToContent() {
		const element = document.getElementById('story-content');
		if (element) {
			element.scrollIntoView({ behavior: 'smooth' });
		}
	}
</script>

<svelte:head>
	<title>{localized(data.settings, 'authorName')} - {t('nav.about')}</title>
	<meta name="description" content={localized(data.settings, 'heroBio')} />
	<style>
		.fade-up {
			animation: fadeUp 1s ease-out forwards;
		}

		@keyframes fadeUp {
			from {
				opacity: 0;
				transform: translateY(20px);
			}
			to {
				opacity: 1;
				transform: translateY(0);
			}
		}
	</style>
</svelte:head>

<div class="bg-main-bg text-text-main antialiased m-0 p-0 selection:bg-soft-bg">
	<!-- Hero Section -->
	<section class="pt-32 pb-16 flex flex-col items-center justify-center text-center px-4 fade-up">
		<h1
			class="font-serif text-6xl md:text-8xl text-text-main tracking-tight leading-[1.1] max-w-4xl mb-8"
		>
			{t('aboutStory.heroTitle')}
		</h1>
		<p class="text-xl text-text-muted max-w-2xl leading-relaxed">
			{t('aboutStory.heroDesc')}
		</p>

		<button
			onclick={scrollToContent}
			class="mt-8 animate-bounce cursor-pointer p-4 rounded-full hover:bg-soft-bg transition-colors active:scale-95"
			aria-label="Read story"
		>
			<ArrowDown size={24} strokeWidth={1.75} class="text-text-muted" />
		</button>
	</section>

	<!-- Editorial Story Content -->
	<article id="story-content" class="px-4 py-12 md:py-16 max-w-3xl mx-auto w-full">
		<div class="space-y-32">
			<!-- Chapter 1 -->
			<section class="space-y-8 fade-up" style="animation-delay: 0.2s">
				<h2
					class="font-serif text-3xl md:text-5xl text-text-main leading-tight border-b border-border-strong pb-6"
				>
					{t('aboutStory.chapter1Title')}
				</h2>
				<p class="text-lg md:text-xl text-text-body leading-relaxed font-normal">
					{t('aboutStory.chapter1Prose')}
				</p>
			</section>

			<!-- Chapter 2 -->
			<section class="space-y-8">
				<h2
					class="font-serif text-3xl md:text-5xl text-text-main leading-tight border-b border-border-strong pb-6"
				>
					{t('aboutStory.chapter2Title')}
				</h2>
				<p class="text-lg md:text-xl text-text-body leading-relaxed font-normal">
					{t('aboutStory.chapter2Prose')}
				</p>
			</section>

			<!-- Chapter 3 -->
			<section class="space-y-8">
				<h2
					class="font-serif text-3xl md:text-5xl text-text-main leading-tight border-b border-border-strong pb-6"
				>
					{t('aboutStory.chapter3Title')}
				</h2>
				<p class="text-lg md:text-xl text-text-body leading-relaxed font-normal">
					{t('aboutStory.chapter3Prose')}
				</p>
			</section>

			<!-- Craftsmanship Colophon -->
			<section
				class="mt-40 p-10 md:p-12 bg-soft-bg rounded-[2rem] border border-border-subtle relative overflow-hidden"
			>
				<!-- Decorative elements -->
				<div
					class="absolute -top-10 -right-10 w-40 h-40 bg-text-main opacity-5 rounded-full blur-3xl"
				></div>

				<span class="text-xs font-bold text-text-muted uppercase tracking-[0.2em] mb-4 block"
					>Craftsmanship</span
				>
				<h3 class="font-serif text-2xl md:text-3xl text-text-main mb-6">Edge-native Philosophy</h3>
				<p class="text-base md:text-lg text-text-muted leading-relaxed font-medium">
					{t('aboutStory.craftsmanship')}
				</p>
			</section>
		</div>
	</article>

	<!-- Call to action Section (Matches Homepage) -->
	<section
		class="py-40 bg-surface dark:bg-soft-bg text-center rounded-t-[3rem] border-t border-border-subtle relative z-10 mt-20"
	>
		<div class="max-w-2xl mx-auto px-4">
			<h2 class="font-serif text-5xl md:text-6xl mb-8 text-text-main">
				{t('homeStory.readyToStart')}
			</h2>
			<p class="text-text-muted text-lg mb-12">
				{t('homeStory.ctaMessage')}
			</p>

			{#if data.settings.headerCtaAction === 'modal'}
				<button
					onclick={() => openFreeSlotModal()}
					class="px-8 py-4 rounded-full bg-text-main text-surface font-medium hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-black/5 dark:shadow-none"
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
					<a href={data.settings.githubUrl} target="_blank" class="hover:text-text-main transition"
						>GitHub</a
					>
					<span>•</span>
				{/if}
				{#if data.settings.contactEmail}
					<a href="mailto:{data.settings.contactEmail}" class="hover:text-text-main transition"
						>Email</a
					>
					<span>•</span>
				{/if}
				{#if data.settings.linkedinUrl}
					<a
						href={data.settings.linkedinUrl}
						target="_blank"
						class="hover:text-text-main transition">LinkedIn</a
					>
				{/if}
			</div>
		</div>
	</section>
</div>
