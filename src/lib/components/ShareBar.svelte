<script lang="ts">
	import { Share2, Check, Copy } from 'lucide-svelte';
	import { t } from '$lib/i18n/index.js';
	import { SITE_URL } from '$lib/config.js';
	import { onMount } from 'svelte';

	interface Props {
		url?: string;
		title: string;
		description?: string;
	}

	let {
		url = '',
		title,
		description = ''
	}: Props = $props();

	let isCopied = $state(false);
	let hasNativeShare = $state(false);

	let fullUrl = $derived(
		url.startsWith('http')
			? url
			: `${SITE_URL}${url.startsWith('/') ? url : `/${url}`}`
	);

	onMount(() => {
		hasNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
	});

	async function copyToClipboard() {
		if (typeof window === 'undefined') return;
		try {
			await navigator.clipboard.writeText(fullUrl);
			isCopied = true;
			setTimeout(() => {
				isCopied = false;
			}, 2500);
		} catch (err) {
			console.error('Failed to copy', err);
		}
	}

	async function triggerNativeShare() {
		if (hasNativeShare) {
			try {
				await navigator.share({
					title,
					text: description || title,
					url: fullUrl
				});
			} catch (e) {}
		}
	}

	function openSocial(shareUrl: string) {
		if (typeof window === 'undefined') return;
		window.open(shareUrl, '_blank', 'width=600,height=500,location=no,menubar=no,status=no');
	}

	let encodedUrl = $derived(encodeURIComponent(fullUrl));
	let encodedTitle = $derived(encodeURIComponent(title));
</script>

<div class="my-10 p-5 sm:p-6 rounded-3xl bg-surface border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
	<div class="space-y-1 max-w-sm">
		<h4 class="text-sm sm:text-base font-bold text-text-main flex items-center gap-2">
			<Share2 size={16} strokeWidth={1.75} class="text-primary" />
			<span>{t('share.shareArticle')}</span>
		</h4>
		<p class="text-xs text-text-muted leading-relaxed">
			{t('share.shareArticleDesc')}
		</p>
	</div>

	<div class="flex flex-wrap items-center gap-2">
		<!-- Facebook -->
		<button
			type="button"
			onclick={() => openSocial(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`)}
			class="size-9 rounded-xl bg-soft-bg border border-border-subtle hover:border-blue-500/50 hover:bg-blue-500/10 text-text-muted hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
			title={t('share.facebook')}
			aria-label={t('share.facebook')}
		>
			<svg class="size-4 fill-current" viewBox="0 0 24 24">
				<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
			</svg>
		</button>

		<!-- X / Twitter -->
		<button
			type="button"
			onclick={() => openSocial(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`)}
			class="size-9 rounded-xl bg-soft-bg border border-border-subtle hover:border-neutral-500/50 hover:bg-neutral-500/10 text-text-muted hover:text-neutral-900 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
			title={t('share.twitter')}
			aria-label={t('share.twitter')}
		>
			<svg class="size-3.5 fill-current" viewBox="0 0 24 24">
				<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
			</svg>
		</button>

		<!-- LinkedIn -->
		<button
			type="button"
			onclick={() => openSocial(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`)}
			class="size-9 rounded-xl bg-soft-bg border border-border-subtle hover:border-sky-500/50 hover:bg-sky-500/10 text-text-muted hover:text-sky-600 dark:hover:text-sky-400 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
			title={t('share.linkedin')}
			aria-label={t('share.linkedin')}
		>
			<svg class="size-3.5 fill-current" viewBox="0 0 24 24">
				<path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.4 1.4 0 1 0 0-2.8 1.4 1.4 0 0 0 0 2.8m1.39 9.97V9.92H5.07v8.81h2.78z"/>
			</svg>
		</button>

		<!-- Native share button if available -->
		{#if hasNativeShare}
			<button
				type="button"
				onclick={triggerNativeShare}
				class="size-9 rounded-xl bg-soft-bg border border-border-subtle hover:border-primary hover:text-primary text-text-muted flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
				title={t('share.title')}
				aria-label={t('share.title')}
			>
				<Share2 size={15} strokeWidth={1.75} />
			</button>
		{/if}

		<!-- Copy Link Button -->
		<button
			type="button"
			onclick={copyToClipboard}
			class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-text-main text-main-bg hover:opacity-90 transition-opacity cursor-pointer shadow-2xs active:scale-98"
			title={t('share.copyLink')}
		>
			{#if isCopied}
				<Check size={14} strokeWidth={2.25} class="text-emerald-400" />
				<span>{t('share.copiedLink')}</span>
			{:else}
				<Copy size={13} strokeWidth={1.75} />
				<span>{t('share.copyLink')}</span>
			{/if}
		</button>
	</div>
</div>
