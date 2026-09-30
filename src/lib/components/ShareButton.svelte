<script lang="ts">
	import { Share2, Check, Copy, Linkedin } from 'lucide-svelte';
	import { t } from '$lib/i18n/index.js';
	import { SITE_URL } from '$lib/config.js';
	import { onMount } from 'svelte';

	interface Props {
		url?: string;
		title: string;
		description?: string;
		variant?: 'pill' | 'icon' | 'compact' | 'bar';
		class?: string;
	}

	let {
		url = '',
		title,
		description = '',
		variant = 'pill',
		class: customClass = ''
	}: Props = $props();

	let isOpen = $state(false);
	let isCopied = $state(false);
	let hasNativeShare = $state(false);
	let containerEl: HTMLElement | null = null;

	// Resolve absolute URL
	let fullUrl = $derived(
		url.startsWith('http')
			? url
			: `${SITE_URL}${url.startsWith('/') ? url : `/${url}`}`
	);

	onMount(() => {
		hasNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

		function handleClickOutside(event: MouseEvent) {
			if (containerEl && !containerEl.contains(event.target as Node)) {
				isOpen = false;
			}
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				isOpen = false;
			}
		}

		document.addEventListener('click', handleClickOutside);
		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('click', handleClickOutside);
			document.removeEventListener('keydown', handleKeyDown);
		};
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
				isOpen = false;
				return;
			} catch (e) {
				// User cancelled or share failed, fallback to popover
			}
		}
		isOpen = !isOpen;
	}

	function handleMainClick() {
		// On touch/mobile with native share, invoke native share sheet directly
		if (hasNativeShare && typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches) {
			triggerNativeShare();
		} else {
			isOpen = !isOpen;
		}
	}

	function openSocialWindow(shareUrl: string) {
		if (typeof window === 'undefined') return;
		window.open(shareUrl, '_blank', 'width=600,height=500,location=no,menubar=no,status=no');
		isOpen = false;
	}

	let encodedUrl = $derived(encodeURIComponent(fullUrl));
	let encodedTitle = $derived(encodeURIComponent(title));
	let encodedText = $derived(encodeURIComponent(description || title));

	let shareLinks = $derived([
		{
			id: 'facebook',
			name: t('share.facebook'),
			url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
			color: 'hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400'
		},
		{
			id: 'x',
			name: t('share.twitter'),
			url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
			color: 'hover:bg-neutral-500/10 hover:text-neutral-900 dark:hover:text-white'
		},
		{
			id: 'linkedin',
			name: t('share.linkedin'),
			url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
			color: 'hover:bg-sky-500/10 hover:text-sky-600 dark:hover:text-sky-400'
		}
	]);
</script>

<div class="relative inline-block text-left" bind:this={containerEl}>
	<!-- Variant 1: Pill Button (standard for headers, action bars) -->
	{#if variant === 'pill'}
		<button
			type="button"
			onclick={handleMainClick}
			class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-surface border border-border-subtle hover:border-border-strong text-text-muted hover:text-text-main transition-all shadow-2xs cursor-pointer active:scale-98 {customClass}"
			title={t('share.title')}
			aria-expanded={isOpen}
			aria-haspopup="true"
		>
			<Share2 size={13} strokeWidth={1.75} />
			<span>{t('share.title')}</span>
		</button>

	<!-- Variant 2: Icon only button (for compact project cards, video cards) -->
	{:else if variant === 'icon'}
		<button
			type="button"
			onclick={handleMainClick}
			class="size-8 sm:size-9 rounded-xl bg-soft-bg border border-border-subtle hover:border-border-strong text-text-muted hover:text-text-main flex items-center justify-center transition-all shadow-2xs cursor-pointer active:scale-95 {customClass}"
			title={t('share.title')}
			aria-label={t('share.title')}
			aria-expanded={isOpen}
			aria-haspopup="true"
		>
			<Share2 size={14} strokeWidth={1.75} />
		</button>

	<!-- Variant 3: Compact Pill -->
	{:else if variant === 'compact'}
		<button
			type="button"
			onclick={handleMainClick}
			class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-soft-bg hover:bg-surface border border-border-subtle hover:border-border-strong text-text-muted hover:text-text-main transition-all cursor-pointer {customClass}"
			title={t('share.title')}
			aria-expanded={isOpen}
			aria-haspopup="true"
		>
			<Share2 size={12} strokeWidth={1.75} />
			<span>{t('share.title')}</span>
		</button>
	{/if}

	<!-- Share Popover Dropdown -->
	{#if isOpen}
		<div
			class="absolute right-0 bottom-full sm:bottom-auto sm:top-full mb-2 sm:mb-0 sm:mt-2 w-64 rounded-2xl bg-surface/95 backdrop-blur-xl border border-border-subtle shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1"
			role="menu"
		>
			<div class="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted border-b border-border-subtle flex items-center justify-between">
				<span>{t('share.shareVia')}</span>
				{#if hasNativeShare}
					<button
						type="button"
						onclick={triggerNativeShare}
						class="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer lowercase text-[10px]"
					>
						+ system
					</button>
				{/if}
			</div>

			<!-- Social Platform Direct Links -->
			<div class="grid grid-cols-2 gap-1 pt-1">
				{#each shareLinks as item}
					<button
						type="button"
						onclick={() => openSocialWindow(item.url)}
						class="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-text-main transition-colors text-left {item.color} cursor-pointer"
					>
						{#if item.id === 'facebook'}
							<svg class="size-3.5 fill-current shrink-0" viewBox="0 0 24 24">
								<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
							</svg>
						{:else if item.id === 'x'}
							<svg class="size-3.5 fill-current shrink-0" viewBox="0 0 24 24">
								<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
							</svg>
						{:else if item.id === 'linkedin'}
							<svg class="size-3.5 fill-current shrink-0" viewBox="0 0 24 24">
								<path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.4 1.4 0 1 0 0-2.8 1.4 1.4 0 0 0 0 2.8m1.39 9.97V9.92H5.07v8.81h2.78z"/>
							</svg>
						{/if}
						<span>{item.name}</span>
					</button>
				{/each}
			</div>

			<!-- Copy Direct Link Button -->
			<div class="pt-1 border-t border-border-subtle">
				<button
					type="button"
					onclick={copyToClipboard}
					class="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold hover:bg-soft-bg text-text-main transition-colors cursor-pointer"
				>
					<span class="flex items-center gap-2">
						{#if isCopied}
							<Check size={14} strokeWidth={2.25} class="text-emerald-500" />
							<span class="text-emerald-600 dark:text-emerald-400 font-bold">{t('share.copiedLink')}</span>
						{:else}
							<Copy size={14} strokeWidth={1.75} class="text-text-muted" />
							<span>{t('share.copyLink')}</span>
						{/if}
					</span>
					<span class="text-[10px] text-text-muted uppercase font-bold tracking-wider">URL</span>
				</button>
			</div>
		</div>
	{/if}
</div>
