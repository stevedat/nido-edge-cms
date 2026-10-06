<script lang="ts">
	import { page } from '$app/stores';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
	import { t } from '$lib/i18n/index.js';
	import {
		LayoutDashboard,
		FileText,
		PenSquare,
		Video,
		Film,
		Briefcase,
		PlusSquare,
		Settings,
		LogOut,
		Globe,
		BookOpen,
		MessageSquare,
		Menu,
		X,
		Users,
		Wand2
	} from 'lucide-svelte';
	import { isMasterDomain } from '$lib/utils/index.js';

	const baseMenu = [
		{ key: 'dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
		{ key: 'leads', href: '/admin/leads', icon: Users,
		Wand2 },
		{ key: 'posts', href: '/admin/posts', icon: FileText },
		{ key: 'newPost', href: '/admin/posts/new', icon: PenSquare },
		{ key: 'comments', href: '/admin/comments', icon: MessageSquare },
		{ key: 'videos', href: '/admin/videos', icon: Video },
		{ key: 'newVideo', href: '/admin/videos/new', icon: Film },
		{ key: 'projects', href: '/admin/projects', icon: Briefcase },
		{ key: 'newProject', href: '/admin/projects/new', icon: PlusSquare },
		{ key: 'tenants', href: '/admin/tenants', icon: Globe },
		{ key: 'builder', href: '/admin/builder', icon: Wand2 },
		{ key: 'settings', href: '/admin/settings', icon: Settings }
	];

	import AdminToast from '$lib/components/admin/AdminToast.svelte';
	import { toast } from '$lib/stores/toast.js';

	let { children, data } = $props();

	function isActive(href: string) {
		return $page.url.pathname === href || $page.url.pathname.startsWith(href + '/');
	}

	let isMaster = $derived(isMasterDomain(data?.domain));
	let finalMenu = $derived(
		baseMenu.filter((item) => {
			if (!isMaster && (item.href === '/admin/tenants' || item.href === '/admin/leads')) {
				return false;
			}
			return true;
		})
	);
	let isPublishing = $state(false);
	let isMobileMenuOpen = $state(false);

	async function handlePublish() {
		if (isPublishing) return;
		isPublishing = true;
		toast.info(t('admin.nav.publishing', { defaultValue: 'Triggering publish workflow...' }));
		try {
			const res = await fetch('/admin/publish', { method: 'POST' });
			const result = await res.json();
			if (result.success) {
				toast.success(
					result.message ||
						t('admin.dashboard.publishSuccess', { defaultValue: 'Website published successfully!' })
				);
			} else {
				toast.error(
					result.error ||
						t('admin.dashboard.publishError', {
							defaultValue: 'Publishing failed, please try again!'
						})
				);
			}
		} catch (error) {
			toast.error(
				t('admin.dashboard.publishConnectError', {
					defaultValue: 'Cannot connect to the publishing server.'
				})
			);
		} finally {
			isPublishing = false;
		}
	}
</script>

<div class="min-h-screen bg-main-bg text-text-main transition-colors duration-300">
	<!-- Top Bar for Mobile (< lg) -->
	<header
		class="lg:hidden h-16 bg-surface/90 backdrop-blur-md border-b border-border-subtle flex items-center justify-between px-4 sticky top-0 z-30"
	>
		<div class="flex items-center gap-3">
			<button
				type="button"
				onclick={() => (isMobileMenuOpen = !isMobileMenuOpen)}
				class="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 -ml-1 rounded-xl text-text-muted hover:text-text-main hover:bg-soft-bg transition-all active:scale-95 cursor-pointer"
				aria-label="Toggle navigation menu"
			>
				{#if isMobileMenuOpen}
					<X strokeWidth={1.75} class="w-5 h-5" />
				{:else}
					<Menu strokeWidth={1.75} class="w-5 h-5" />
				{/if}
			</button>
			<div class="flex items-center gap-2.5">
				<div
					class="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm"
				>
					D
				</div>
				<span class="text-sm font-bold text-text-main tracking-tight">Edge CMS</span>
			</div>
		</div>

		<div class="flex items-center gap-2">
			<LanguageSwitcher />
			<ThemeToggle />
		</div>
	</header>

	<!-- Mobile Drawer Backdrop -->
	{#if isMobileMenuOpen}
		<button
			type="button"
			class="fixed inset-0 bg-overlay backdrop-blur-xs z-40 lg:hidden transition-opacity"
			onclick={() => (isMobileMenuOpen = false)}
			aria-label="Close navigation"
		></button>
	{/if}

	<!-- Sidebar (Desktop Fixed, Mobile Drawer) -->
	<aside
		class="fixed inset-y-0 left-0 z-40 w-64 bg-surface border-r border-border-subtle flex flex-col transition-transform duration-300 ease-in-out {isMobileMenuOpen
			? 'translate-x-0 shadow-2xl'
			: '-translate-x-full lg:translate-x-0'}"
	>
		<!-- Header -->
		<div class="h-16 lg:h-20 flex items-center justify-between px-4 border-b border-border-subtle">
			<div class="flex items-center gap-2.5">
				<div
					class="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm"
				>
					D
				</div>
				<div>
					<h2 class="text-xs font-bold text-text-main tracking-tight">Edge CMS</h2>
					<div class="flex items-center gap-1.5 mt-0.5">
						{#if data?.domain === 'default'}
							<span class="size-1.5 rounded-full bg-emerald-500"></span>
							<p class="text-[10px] text-text-muted font-medium">
								{t('admin.nav.defaultTenant', { defaultValue: 'Main Workspace' })}
							</p>
						{:else}
							<span class="size-1.5 rounded-full bg-amber-500 animate-pulse"></span>
							<p
								class="text-[10px] text-amber-600 dark:text-amber-400 font-bold truncate max-w-[90px]"
							>
								{data?.domain}
							</p>
							<a
								href="?tenant=default"
								class="text-[10px] text-primary hover:underline font-bold"
								title={t('admin.nav.backToDefaultTenant', {
									defaultValue: 'Back to Main Workspace'
								})}>[Reset]</a
							>
						{/if}
					</div>
				</div>
			</div>
			<div class="hidden lg:flex items-center gap-1.5">
				<LanguageSwitcher />
				<ThemeToggle />
			</div>
			<button
				type="button"
				onclick={() => (isMobileMenuOpen = false)}
				class="min-w-[44px] min-h-[44px] flex items-center justify-center p-2.5 -mr-1 rounded-xl text-text-muted hover:text-text-main hover:bg-soft-bg transition-all active:scale-95 cursor-pointer lg:hidden"
				aria-label="Close menu"
			>
				<X strokeWidth={1.75} class="w-5 h-5" />
			</button>
		</div>

		<!-- Navigation List -->
		<div class="flex-1 overflow-y-auto py-5 px-3 no-scrollbar">
			<p class="px-3 text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">
				{t('admin.nav.mainMenu')}
			</p>
			<ul class="space-y-1">
				{#each finalMenu as item}
					{@const active =
						isActive(item.href) &&
						(item.href === '/admin/dashboard' ? $page.url.pathname === '/admin/dashboard' : true)}
					{@const Icon = item.icon}
					<li>
						<a
							class="group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium transition-all duration-150 {active
								? 'bg-primary/10 text-primary font-semibold shadow-2xs'
								: 'text-text-muted hover:bg-soft-bg hover:text-text-main'}"
							href={item.href}
							onclick={() => (isMobileMenuOpen = false)}
						>
							<Icon
								class="w-4 h-4 transition-transform duration-150 {active
									? 'text-primary scale-105'
									: 'text-text-muted group-hover:text-text-main'}"
								strokeWidth={active ? 2.5 : 2}
							/>
							<span class="flex-1">{t(`admin.nav.${item.key}`)}</span>
							{#if active}
								<div class="w-1.5 h-1.5 rounded-full bg-primary"></div>
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		</div>

		<!-- Footer Actions -->
		<div class="p-4 border-t border-border-subtle bg-soft-bg/40 space-y-3">
			<button
				onclick={handlePublish}
				disabled={isPublishing}
				class="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-3.5 py-2.5 text-xs font-bold transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
			>
				{#if isPublishing}
					<svg
						class="animate-spin h-3.5 w-3.5 text-white"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					<span>{t('admin.nav.publishing')}</span>
				{:else}
					<span>🚀 {t('admin.nav.publishSite')}</span>
				{/if}
			</button>

			<div class="space-y-0.5">
				<a
					href="/"
					target="_blank"
					class="group flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text-main hover:bg-surface transition-all"
				>
					<Globe
						strokeWidth={1.75}
						class="w-3.5 h-3.5 text-text-muted group-hover:text-text-main"
					/>
					<span>{t('admin.nav.viewHome')}</span>
				</a>
				<a
					href="/blog"
					target="_blank"
					class="group flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text-main hover:bg-surface transition-all"
				>
					<BookOpen
						strokeWidth={1.75}
						class="w-3.5 h-3.5 text-text-muted group-hover:text-text-main"
					/>
					<span>{t('admin.nav.viewBlog')}</span>
				</a>
			</div>

			<a
				href="/admin/logout"
				class="flex items-center justify-center gap-2 w-full rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 px-3 py-2 text-xs font-medium transition-colors"
			>
				<LogOut strokeWidth={1.75} class="w-3.5 h-3.5" />
				<span>{t('admin.nav.logout')}</span>
			</a>
		</div>
	</aside>

	<!-- Main Content Area -->
	<main class="flex-1 lg:pl-64 min-h-screen">
		{#if data?.domain && data.domain !== 'default'}
			<div
				class="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 flex items-center justify-between text-xs text-amber-700 dark:text-amber-300"
			>
				<div class="flex items-center gap-2">
					<span class="size-2 rounded-full bg-amber-500 animate-pulse"></span>
					<span
						>{t('admin.nav.currentTenant', { defaultValue: 'Current Tenant:' })}
						<strong>{data.domain}</strong></span
					>
				</div>
				<a
					href="?tenant=default"
					class="font-bold underline hover:text-amber-900 dark:hover:text-amber-100 transition-colors"
				>
					{t('admin.nav.backToDefaultTenant', { defaultValue: 'Back to Main Workspace' })} &rarr;
				</a>
			</div>
		{/if}
		{@render children()}
	</main>

	<!-- Global Admin Toast Notifications -->
	<AdminToast />
</div>

<style>
	/* Hide scrollbar for Chrome, Safari and Opera */
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	/* Hide scrollbar for IE, Edge and Firefox */
	.no-scrollbar {
		-ms-overflow-style: none; /* IE and Edge */
		scrollbar-width: none; /* Firefox */
	}
</style>
