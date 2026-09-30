<script lang="ts">
	import { page } from '$app/stores';
	import { ArrowLeft, Home } from 'lucide-svelte';
	import { t } from '$lib/i18n/index.js';
</script>

<svelte:head>
	<title>{$page.status} | {t('errors.notFoundTitle')}</title>
</svelte:head>

<div class="py-20 sm:py-28 flex flex-col items-center justify-center text-center px-4">
	<!-- Status Code Badge -->
	<div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-bold mb-6">
		<span>HTTP {$page.status}</span>
	</div>

	<h1 class="text-4xl sm:text-6xl font-extrabold text-text-main tracking-tight mb-4">
		{#if $page.status === 404}
			{t('errors.notFoundHeading')}
		{:else}
			{t('errors.genericHeading')}
		{/if}
	</h1>

	<p class="text-text-muted text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed">
		{#if $page.status === 404}
			{t('errors.notFoundDesc')}
		{:else}
			{$page.error?.message || t('errors.genericDesc')}
		{/if}
	</p>

	<!-- Quick Navigation Buttons -->
	<div class="flex flex-col sm:flex-row items-center gap-3">
		<a
			href="/"
			class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:opacity-90 text-white text-sm font-semibold transition-all shadow-xs"
		>
			<Home strokeWidth={1.75} class="size-4" />
			<span>{t('errors.homeBtn')}</span>
		</a>
		<a
			href="/blog"
			class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-surface hover:bg-soft-bg border border-border-subtle text-text-main text-sm font-medium transition-all"
		>
			<span>{t('errors.blogBtn')}</span>
		</a>
		<button
			type="button"
			onclick={() => history.back()}
			class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-text-muted hover:text-text-main hover:bg-soft-bg text-sm font-medium transition-all cursor-pointer"
		>
			<ArrowLeft strokeWidth={1.75} class="size-4" />
			<span>{t('errors.backBtn')}</span>
		</button>
	</div>
</div>
