<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
	import FreeSlotModal from '$lib/components/FreeSlotModal.svelte';
	import { openFreeSlotModal } from '$lib/stores/freeSlot.js';
	import { initLocale, t, getLocale, localized } from '$lib/i18n/index.js';
	import {
		Github,
		Mail,
		ArrowUp,
		Menu,
		X,
		Gift,
		Sparkles,
		ArrowRight,
		Linkedin,
		Facebook,
		Youtube,
		Phone,
		Lock
	} from 'lucide-svelte';
	import { SITE_URL, SITE_NAME, TWITTER_HANDLE } from '$lib/config.js';
	import { isMasterDomain } from '$lib/utils/index.js';

	let {
		children,
		data
	}: {
		children: () => any;
		data: { isAuthenticated: boolean; settings: any; locale?: string; domain?: string };
	} = $props();

	// Initialize i18n from server-detected locale
	initLocale(data.locale);

	// Dynamic navigation labels with tenant custom override & i18n support
	let navProjectsLabel = $derived(
		getLocale() === 'en' && data.settings?.navProjectsLabel_en
			? data.settings.navProjectsLabel_en
			: data.settings?.navProjectsLabel || t('nav.projects')
	);
	let navBlogLabel = $derived(
		getLocale() === 'en' && data.settings?.navBlogLabel_en
			? data.settings.navBlogLabel_en
			: data.settings?.navBlogLabel ||
					(data.settings?.combineBlogAndVideos
						? getLocale() === 'en'
							? 'Insights'
							: 'Chia sẻ'
						: t('nav.blog'))
	);
	let navVideosLabel = $derived(
		getLocale() === 'en' && data.settings?.navVideosLabel_en
			? data.settings.navVideosLabel_en
			: data.settings?.navVideosLabel || t('nav.videos')
	);
	let navAboutLabel = $derived(
		getLocale() === 'en' && data.settings?.navAboutLabel_en
			? data.settings.navAboutLabel_en
			: data.settings?.navAboutLabel || t('nav.about')
	);

	let isCombinedInsights = $derived(data.settings?.combineBlogAndVideos === true);

	let links = $derived([
		...(data.settings?.showProjects !== false
			? [{ href: '/projects', label: navProjectsLabel }]
			: []),
		...(data.settings?.showBlog !== false ? [{ href: '/blog', label: navBlogLabel }] : []),
		...(!isCombinedInsights && data.settings?.showVideos !== false
			? [{ href: '/videos', label: navVideosLabel }]
			: []),
		{ href: '/about', label: navAboutLabel }
	]);

	let contactEmail = $derived(
		data.settings?.contactEmail ||
			(data.settings?.githubUrl || data.settings?.phone ? '' : 'hello@example.com')
	);
	let contactUrl = $derived(data.settings?.contactUrl || '/about#connect');
	let githubUrl = $derived(data.settings?.githubUrl);
	let linkedinUrl = $derived(data.settings?.linkedinUrl);
	let facebookUrl = $derived(data.settings?.facebookUrl);
	let youtubeUrl = $derived(data.settings?.youtubeUrl);
	let phone = $derived(data.settings?.phone);

	let isMaster = $derived(isMasterDomain(data.domain) && data.settings?.showFreeSlot !== false);

	let headerCtaText = $derived(
		getLocale() === 'en' && data.settings?.headerCtaText_en
			? data.settings.headerCtaText_en
			: data.settings?.headerCtaText ||
					(isMaster ? t('nav.freeSlotCTA') : getLocale() === 'en' ? 'Contact' : 'Liên hệ')
	);
	let headerCtaAction = $derived(data.settings?.headerCtaAction || (isMaster ? 'modal' : 'link'));
	let headerCtaUrl = $derived(data.settings?.headerCtaUrl || contactUrl);

	let socialLinks = $derived([
		...(githubUrl
			? [{ id: 'github', label: 'GitHub', href: githubUrl, icon: Github, external: true }]
			: []),
		...(linkedinUrl
			? [{ id: 'linkedin', label: 'LinkedIn', href: linkedinUrl, icon: Linkedin, external: true }]
			: []),
		...(facebookUrl
			? [{ id: 'facebook', label: 'Facebook', href: facebookUrl, icon: Facebook, external: true }]
			: []),
		...(youtubeUrl
			? [{ id: 'youtube', label: 'YouTube', href: youtubeUrl, icon: Youtube, external: true }]
			: []),
		...(phone
			? [
					{
						id: 'phone',
						label: phone,
						href: `tel:${phone.replace(/[\s\-\(\)]/g, '')}`,
						icon: Phone,
						external: false
					}
				]
			: []),
		...(contactEmail
			? [
					{
						id: 'email',
						label: t('footer.sendEmail'),
						href: `mailto:${contactEmail}`,
						icon: Mail,
						external: false
					}
				]
			: [])
	]);

	let isAdminRoute = $derived($page.url.pathname.startsWith('/admin'));
	let isBlogPost = $derived(
		$page.url.pathname.startsWith('/blog/') && $page.url.pathname !== '/blog'
	);

	let isMobileMenuOpen = $state(false);

	$effect(() => {
		// Auto close mobile drawer on route transition
		if ($page.url.pathname) {
			isMobileMenuOpen = false;
		}
	});

	$effect(() => {
		const currentTheme = data.settings?.themePreset || 'apple';
		if (typeof document !== 'undefined') {
			document.documentElement.setAttribute('data-theme', currentTheme);
		}
	});

	onMount(() => {
		const regParam = $page.url.searchParams.get('register');
		if (isMaster && (regParam === '1' || regParam === 'true')) {
			openFreeSlotModal('url_param');
		}
	});

	// Scroll progress for reading long articles
	let scrollY = $state(0);
	let scrollProgress = $state(0);

	function updateScrollProgress() {
		if (typeof window === 'undefined') return;
		const docHeight = document.documentElement.scrollHeight - window.innerHeight;
		if (docHeight > 0) {
			scrollProgress = Math.min(100, Math.max(0, (window.scrollY / docHeight) * 100));
		} else {
			scrollProgress = 0;
		}
	}

	function scrollToTop() {
		if (typeof window !== 'undefined') {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}

	function isLinkActive(href: string): boolean {
		const path = $page.url.pathname;
		if (href === '/') return path === '/';
		return path.startsWith(href);
	}
</script>

<svelte:window bind:scrollY onscroll={updateScrollProgress} />

<svelte:head>
	<link rel="icon" href={favicon} />
	<title
		>{localized(data.settings, 'siteTitle') ||
			data.settings?.siteTitle ||
			'Modern Edge CMS & Docs'}</title
	>
	<meta
		name="description"
		content={localized(data.settings, 'siteDescription') ||
			data.settings?.siteDescription ||
			(getLocale() === 'en'
				? 'Explore EdTech & FinTech products, engineering articles, and pragmatic insights.'
				: 'Khám phá các sản phẩm EdTech, FinTech, bài viết chuyên sâu và video chia sẻ kinh nghiệm thực tế.')}
	/>

	<!-- Canonical & OpenGraph with Official Production Domain -->
	<link rel="canonical" href="{SITE_URL}{$page.url.pathname}" />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:url" content="{SITE_URL}{$page.url.pathname}" />
	<meta property="og:type" content="website" />
	<meta
		property="og:title"
		content={localized(data.settings, 'siteTitle') ||
			data.settings?.siteTitle ||
			'Modern Edge CMS & Docs'}
	/>
	<meta
		property="og:description"
		content={localized(data.settings, 'siteDescription') ||
			data.settings?.siteDescription ||
			'Explore EdTech & FinTech products, engineering articles, and pragmatic insights.'}
	/>
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content={TWITTER_HANDLE} />
	<meta name="twitter:domain" content="example.com" />
	<meta property="og:image" content="{SITE_URL}/og-image.png" />
	<meta name="twitter:image" content="{SITE_URL}/og-image.png" />
</svelte:head>

<div
	data-theme={data.settings?.themePreset || 'apple'}
	class="min-h-screen bg-main-bg text-text-main transition-colors duration-300 flex flex-col selection:bg-primary/20 selection:text-primary"
>
	{#if !isAdminRoute}
		<!-- Sticky Glassmorphic Header -->
		<header
			class="sticky top-0 z-50 w-full backdrop-blur-xl bg-main-bg/85 dark:bg-main-bg/80 border-b border-border-subtle/80 transition-all"
		>
			<div
				class="mx-auto w-full max-w-5xl px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3"
			>
				<!-- Site Identity / Logo -->
				<a
					href="/"
					class="group flex items-center gap-2 text-base sm:text-lg font-bold tracking-tight text-text-main hover:text-primary transition-colors shrink-0"
					onclick={() => (isMobileMenuOpen = false)}
				>
					<span
						class="w-7 h-7 rounded-lg bg-text-main text-main-bg flex items-center justify-center text-xs font-black tracking-tighter group-hover:scale-105 transition-transform"
					>
						DT
					</span>
					<span class="truncate max-w-[140px] xs:max-w-none"
						>{data.settings?.siteName || 'Edge CMS'}</span
					>
				</a>

				<!-- Mobile Quick Actions & Hamburger (Visible on < md) -->
				<div class="flex items-center gap-1.5 md:hidden">
					<!-- Quick CTA Button on Mobile Header -->
					{#if headerCtaAction === 'modal'}
						<button
							type="button"
							onclick={() => openFreeSlotModal('header_mobile_button')}
							class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
							title={headerCtaText}
						>
							{#if isMaster}
								<span class="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
							{/if}
							<span>{headerCtaText}</span>
						</button>
					{:else}
						<a
							href={headerCtaUrl}
							class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold transition-all shadow-2xs active:scale-95"
						>
							<span>{headerCtaText}</span>
						</a>
					{/if}

					<ThemeToggle />

					<button
						type="button"
						onclick={() => (isMobileMenuOpen = !isMobileMenuOpen)}
						class="min-w-[44px] min-h-[44px] flex items-center justify-center p-2.5 -mr-1 rounded-xl text-text-muted hover:text-text-main hover:bg-soft-bg transition-all active:scale-95 cursor-pointer"
						aria-label={isMobileMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
						aria-expanded={isMobileMenuOpen}
					>
						{#if isMobileMenuOpen}
							<X size={20} strokeWidth={2} />
						{:else}
							<Menu size={20} strokeWidth={2} />
						{/if}
					</button>
				</div>

				<!-- Desktop Navigation (Visible on >= md) -->
				<nav
					class="hidden md:flex items-center gap-1.5 sm:gap-2 text-sm font-medium"
					aria-label="Main navigation"
				>
					{#each links as link}
						{@const active = isLinkActive(link.href)}
						<a
							href={link.href}
							aria-current={active ? 'page' : undefined}
							class="relative px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all {active
								? 'text-text-main bg-soft-bg dark:bg-surface font-semibold shadow-2xs border border-border-subtle'
								: 'text-text-muted hover:text-text-main hover:bg-soft-bg/50'}"
						>
							{link.label}
							{#if active}
								<span
									class="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-4 h-[2px] bg-primary rounded-full"
								></span>
							{/if}
						</a>
					{/each}

					<div class="h-4 w-px bg-border-subtle mx-1 sm:mx-2"></div>

					<!-- Language Switcher -->
					<LanguageSwitcher />

					<!-- Theme Switcher -->
					<ThemeToggle />

					<!-- CTA Action Button on Desktop Header -->
					{#if headerCtaAction === 'modal'}
						<button
							type="button"
							onclick={() => openFreeSlotModal('header_button')}
							class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-text-main text-main-bg hover:opacity-90 font-bold text-xs transition-all shadow-2xs cursor-pointer ml-1 active:scale-95"
							title={headerCtaText}
						>
							{#if isMaster}
								<span class="size-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
							{:else}
								<Sparkles size={13} strokeWidth={1.75} />
							{/if}
							<span>{headerCtaText}</span>
						</button>
					{:else}
						<a
							href={headerCtaUrl}
							class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-text-main text-main-bg hover:opacity-90 font-bold text-xs transition-all shadow-2xs active:scale-95 ml-1"
						>
							<span>{headerCtaText}</span>
							<ArrowRight size={13} strokeWidth={1.75} />
						</a>
					{/if}
				</nav>
			</div>

			<!-- Reading progress bar on individual blog posts -->
			{#if isBlogPost}
				<div class="w-full h-[2px] bg-border-subtle/30 overflow-hidden">
					<div
						class="h-full bg-indigo-600 dark:bg-indigo-400 transition-all duration-150 ease-out"
						style="width: {scrollProgress}%;"
					></div>
				</div>
			{/if}
		</header>

		<!-- Mobile Menu Drawer (Peer of Header to bypass backdrop-filter containing block) -->
		{#if isMobileMenuOpen}
			<div
				class="md:hidden fixed inset-x-0 top-16 bottom-0 z-40 bg-main-bg/95 dark:bg-main-bg/95 backdrop-blur-2xl border-b border-border-subtle overflow-y-auto p-5 space-y-5 animate-in fade-in slide-in-from-top-3 duration-200"
			>
				<!-- Navigation Links (Large touch targets >= 48px) -->
				<div class="space-y-1">
					<p class="px-3 text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">
						{t('nav.navigation')}
					</p>
					{#each links as link}
						{@const active = isLinkActive(link.href)}
						<a
							href={link.href}
							onclick={() => (isMobileMenuOpen = false)}
							class="flex items-center justify-between p-3.5 rounded-2xl text-base font-semibold transition-all {active
								? 'bg-surface border border-border-subtle text-primary shadow-xs'
								: 'text-text-main hover:bg-soft-bg'}"
						>
							<span>{link.label}</span>
							{#if active}
								<div class="size-2 rounded-full bg-primary"></div>
							{:else}
								<ArrowRight size={16} strokeWidth={1.75} class="text-text-muted" />
							{/if}
						</a>
					{/each}
				</div>

				<!-- Mobile Admin Access -->
				<div class="pt-1">
					<a
						href={data.isAuthenticated ? '/admin/dashboard' : '/admin/login'}
						onclick={() => (isMobileMenuOpen = false)}
						data-sveltekit-preload-data="off"
						class="flex items-center justify-between p-3 rounded-xl text-xs font-semibold text-text-muted hover:text-text-main hover:bg-soft-bg border border-border-subtle/60 transition-colors"
					>
						<span class="flex items-center gap-2">
							<Lock size={14} strokeWidth={1.75} class="text-primary" />
							<span>{data.isAuthenticated ? t('footer.dashboard') : t('footer.admin')}</span>
						</span>
						{#if data.isAuthenticated}
							<span
								class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
							>
								Active
							</span>
						{:else}
							<ArrowRight size={13} strokeWidth={1.75} class="text-text-muted" />
						{/if}
					</a>
				</div>

				<!-- Mobile Action / VIP Highlight Card -->
				{#if isMaster}
					<div class="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-3">
						<div class="flex items-center gap-2">
							<div
								class="size-7 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0"
							>
								<Gift size={16} strokeWidth={1.75} />
							</div>
							<div>
								<h4 class="text-xs font-bold text-indigo-900 dark:text-indigo-200">
									{t('home.vipBanner.badge')}
								</h4>
								<p class="text-[11px] text-text-muted">{t('home.vipBanner.desc')}</p>
							</div>
						</div>
						<button
							type="button"
							onclick={() => {
								isMobileMenuOpen = false;
								openFreeSlotModal('mobile_drawer');
							}}
							class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-sm active:scale-98 cursor-pointer"
						>
							<Sparkles size={14} strokeWidth={1.75} />
							<span>{t('home.vipBanner.ctaBtn')}</span>
						</button>
					</div>
				{:else}
					<div class="p-4 rounded-2xl bg-surface border border-border-subtle space-y-3">
						<div class="flex items-center gap-2">
							<div
								class="size-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0"
							>
								<Sparkles size={16} strokeWidth={1.75} />
							</div>
							<div>
								<h4 class="text-xs font-bold text-text-main">{headerCtaText}</h4>
								<p class="text-[11px] text-text-muted">
									{data.settings?.siteName || 'Liên hệ tư vấn trực tiếp'}
								</p>
							</div>
						</div>
						{#if headerCtaAction === 'modal'}
							<button
								type="button"
								onclick={() => {
									isMobileMenuOpen = false;
									openFreeSlotModal('mobile_drawer');
								}}
								class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary hover:opacity-90 text-white text-xs font-bold transition-all shadow-sm active:scale-98 cursor-pointer"
							>
								<span>{headerCtaText}</span>
								<ArrowRight size={14} strokeWidth={1.75} />
							</button>
						{:else}
							<a
								href={headerCtaUrl}
								onclick={() => (isMobileMenuOpen = false)}
								class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary hover:opacity-90 text-white text-xs font-bold transition-all shadow-sm active:scale-98"
							>
								<span>{headerCtaText}</span>
								<ArrowRight size={14} strokeWidth={1.75} />
							</a>
						{/if}
					</div>
				{/if}

				<!-- Mobile Controls & Utility -->
				<div class="pt-2 border-t border-border-subtle flex items-center justify-between">
					<span class="text-xs font-medium text-text-muted">{t('nav.languageDisplay')}</span>
					<LanguageSwitcher />
				</div>

				<!-- Direct Contact & Social Links -->
				{#if socialLinks.length > 0 || contactUrl}
					<div
						class="pt-2 border-t border-border-subtle flex flex-wrap items-center justify-between gap-2 text-xs text-text-muted"
					>
						<div class="flex flex-wrap items-center gap-3">
							{#each socialLinks as item}
								{@const Icon = item.icon}
								<a
									href={item.href}
									target={item.external ? '_blank' : undefined}
									rel={item.external ? 'noopener noreferrer' : undefined}
									class="inline-flex items-center gap-1.5 hover:text-text-main p-1 font-medium"
								>
									<Icon size={16} strokeWidth={1.75} />
									<span>{item.label}</span>
								</a>
							{/each}
						</div>
						{#if contactUrl}
							<a
								href={contactUrl}
								onclick={() => (isMobileMenuOpen = false)}
								class="inline-flex items-center gap-1 hover:text-text-main p-1 font-medium text-primary"
							>
								<span>{t('footer.contact')}</span>
							</a>
						{/if}
					</div>
				{/if}
			</div>
		{/if}
	{/if}

	{#if isAdminRoute}
		{@render children()}
	{:else}
		<main class="mx-auto w-full max-w-5xl px-4 sm:px-6 pb-20 flex-grow pt-4">
			{@render children()}
		</main>
	{/if}

	{#if !isAdminRoute}
		<!-- Refined Minimal Footer -->
		<footer
			class="mt-auto border-t border-border-subtle bg-surface/40 backdrop-blur-sm transition-colors duration-300"
		>
			<div
				class="mx-auto max-w-5xl px-4 sm:px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-text-muted"
			>
				<div class="space-y-1 text-center md:text-left">
					<div class="flex items-center justify-center md:justify-start gap-2 flex-wrap">
						<p class="font-medium text-text-main">
							&copy; {new Date().getFullYear()}
							{data.settings?.footerCopyright || 'Edge CMS'}. {t('footer.rights')}
						</p>
						<a
							href={data.isAuthenticated ? '/admin/dashboard' : '/admin/login'}
							data-sveltekit-preload-data="off"
							class="inline-flex items-center gap-1 text-text-muted/60 hover:text-text-main px-1.5 py-0.5 rounded-md hover:bg-soft-bg transition-colors text-[11px] font-medium group"
							title={data.isAuthenticated ? t('footer.dashboard') : t('footer.admin')}
							aria-label="Admin CMS"
						>
							<Lock
								size={11}
								strokeWidth={1.75}
								class="opacity-70 group-hover:opacity-100 transition-opacity"
							/>
							<span>{t('footer.admin')}</span>
							{#if data.isAuthenticated}
								<span class="size-1.5 rounded-full bg-emerald-500 inline-block" title="Online"
								></span>
							{/if}
						</a>
					</div>
					{#if data.settings?.companyName}
						<p class="text-xs text-text-muted font-medium mt-1">
							{data.settings.companyName}
							{#if data.settings.taxId}
								<span class="px-1.5 opacity-50">&middot;</span> {t('common.taxId', { defaultValue: 'MST' })}: {data.settings.taxId}
							{/if}
						</p>
					{/if}
					{#if data.settings?.officeAddress}
						<p class="text-xs text-text-muted mt-0.5 max-w-lg">
							{data.settings.officeAddress}
						</p>
					{/if}
				</div>

				<!-- Social & Connection Links -->
				<div
					class="flex items-center flex-wrap justify-center md:justify-end gap-3 sm:gap-4 text-xs font-medium"
				>
					{#each socialLinks as item}
						{@const Icon = item.icon}
						<a
							href={item.href}
							target={item.external ? '_blank' : undefined}
							rel={item.external ? 'noopener noreferrer' : undefined}
							class="inline-flex items-center gap-1.5 hover:text-text-main transition-colors p-1"
							aria-label={item.label}
						>
							<Icon size={15} strokeWidth={1.75} />
							<span class="hidden sm:inline">{item.label}</span>
						</a>
					{/each}
					{#if contactUrl}
						<a
							href={contactUrl}
							class="inline-flex items-center gap-1.5 hover:text-text-main transition-colors p-1 font-medium"
						>
							<span>{t('footer.contact')}</span>
						</a>
					{/if}
				</div>
			</div>
		</footer>

		<!-- Back to top floating button on scroll -->
		{#if scrollY > 400}
			<button
				type="button"
				onclick={scrollToTop}
				class="fixed bottom-6 right-6 z-40 p-2.5 rounded-full bg-surface border border-border-subtle text-text-muted hover:text-text-main shadow-md hover:shadow-lg transition-all active:scale-95"
				aria-label={t('common.backToTop')}
				title={t('common.backToTop')}
			>
				<ArrowUp size={16} strokeWidth={1.75} />
			</button>
		{/if}

		<!-- Free Slot Registration Modal -->
		<FreeSlotModal />
	{/if}
</div>
