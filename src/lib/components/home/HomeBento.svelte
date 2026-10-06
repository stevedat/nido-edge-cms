<script lang="ts">
	import {
		Sparkles,
		Layers,
		ArrowUpRight,
		ArrowRight,
		Code2,
		Zap,
		Globe,
		Cpu,
		BookOpen,
		Clock,
		PlayCircle,
		ExternalLink
	} from 'lucide-svelte';
	import { openFreeSlotModal } from '$lib/stores/freeSlot.js';
	import {
		t,
		getLocale,
		formatDate,
		formatReadingTime,
		localized,
		localizedArray
	} from '$lib/i18n/index.js';
	import VideoEmbed from '$lib/components/VideoEmbed.svelte';
	import ShareButton from '$lib/components/ShareButton.svelte';
	import { isMasterDomain } from '$lib/utils/index.js';

	let {
		data
	}: {
		data: {
			settings: any;
			posts: {
				slug: string;
				meta: { title: string; date: string; tags: string[]; thumbnail: string };
				content?: string;
				excerpt?: string;
				excerpt_en?: string;
				readingMinutes?: number;
			}[];
			videos: { id: string; title: string; url: string; platform: string }[];
			projects: {
				id: string;
				title: string;
				tagline?: string;
				description: string;
				highlights?: string[];
				link: string;
				tags: string[];
				platforms?: string[];
				thumbnail?: string;
			}[];
			domain?: string;
		};
	} = $props();

	let isMaster = $derived(isMasterDomain(data.domain) && data.settings?.showFreeSlot !== false);

	let featuredProject = $derived(data.projects[0] || null);
	let otherProjects = $derived(data.projects.slice(1, 4));

	const techStack = [
		{ name: 'SvelteKit 2', category: 'Frontend', glow: 'hover:border-orange-500/40' },
		{ name: 'Tailwind CSS', category: 'Design', glow: 'hover:border-cyan-500/40' },
		{ name: 'Cloudflare Edge', category: 'Infra', glow: 'hover:border-amber-500/40' },
		{ name: 'TypeScript', category: 'Language', glow: 'hover:border-blue-500/40' },
		{ name: 'Git-backed JSON', category: 'Storage', glow: 'hover:border-emerald-500/40' },
		{ name: 'Native Web API', category: 'Core', glow: 'hover:border-purple-500/40' }
	];

	function calculateReadingTime(content?: string, readingMinutes?: number): string {
		if (readingMinutes) return formatReadingTime(readingMinutes);
		if (!content) return formatReadingTime(3);
		const words = content.trim().split(/\s+/).length;
		const minutes = Math.ceil(words / 200);
		return formatReadingTime(Math.max(2, minutes));
	}
</script>

<div class="space-y-20 sm:space-y-28 py-4">
	<!-- Bento Hero Header -->
	<section class="relative pt-12 pb-6 sm:pt-16 sm:pb-8 space-y-6 rounded-3xl">
		<div
			class="absolute -top-16 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 ambient-glow-warm pointer-events-none -z-10"
		></div>

		<div
			class="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-surface border border-border-subtle specular-highlight shadow-2xs backdrop-blur-md"
		>
			<span class="relative flex h-2 w-2">
				<span
					class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"
				></span>
				<span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
			</span>
			<span class="text-xs font-semibold text-text-body">
				{t('bento.heroSubtitle')}
			</span>
		</div>

		<div class="space-y-4 max-w-3xl">
			<h1
				class="text-3xl sm:text-5xl md:text-6xl font-extrabold text-text-main tracking-tight leading-[1.1] text-balance break-words"
			>
				{getLocale() === 'en' && data.settings?.heroTitle_en
					? data.settings.heroTitle_en
					: data.settings?.heroTitle || t('bento.heroTitle')}
			</h1>
			<p class="text-base sm:text-xl text-text-body leading-relaxed font-normal text-balance">
				{getLocale() === 'en' && data.settings?.heroBio_en
					? data.settings.heroBio_en
					: data.settings?.heroBio || t('bento.heroBio')}
			</p>
		</div>

		<div class="flex flex-wrap items-center gap-3 pt-2">
			{#if data.settings?.showProjects !== false}
				<a
					href="/projects"
					class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-text-main text-main-bg hover:opacity-90 font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-98 min-h-[44px]"
				>
					<Layers size={16} strokeWidth={1.75} />
					<span>{t('bento.exploreBtn')}</span>
				</a>
			{:else if data.settings?.showBlog !== false}
				<a
					href="/blog"
					class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-text-main text-main-bg hover:opacity-90 font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-98 min-h-[44px]"
				>
					<BookOpen size={16} strokeWidth={1.75} />
					<span>{t('nav.blog')}</span>
				</a>
			{/if}
			{#if isMaster}
				<button
					type="button"
					onclick={() => openFreeSlotModal('bento_hero')}
					class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-surface border border-border-subtle text-text-main hover:bg-soft-bg font-semibold text-xs sm:text-sm transition-all active:scale-98 min-h-[44px] cursor-pointer"
				>
					<span>{t('bento.contactBtn')}</span>
					<ArrowRight size={15} strokeWidth={1.75} />
				</button>
			{:else}
				<a
					href={data.settings?.contactUrl || '/about'}
					class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-surface border border-border-subtle text-text-main hover:bg-soft-bg font-semibold text-xs sm:text-sm transition-all active:scale-98 min-h-[44px]"
				>
					<span>{t('bento.contactBtn')}</span>
					<ArrowRight size={15} strokeWidth={1.75} />
				</a>
			{/if}
		</div>
	</section>

	<!-- Main Bento Grid Section -->
	<section class="space-y-6">
		<div class="grid grid-cols-1 md:grid-cols-12 gap-5">
			<!-- BENTO CELL 1: Flagship Project Showcase (Span 8 / 12) -->
			{#if featuredProject && data.settings?.showProjects !== false}
				<article
					class="md:col-span-8 rounded-3xl bg-surface border border-border-subtle specular-highlight hover:border-primary/40 hover:shadow-xl transition-all duration-300 p-6 sm:p-8 flex flex-col justify-between space-y-6 group relative overflow-hidden"
				>
					<div class="space-y-4">
						<div class="flex items-center justify-between gap-3">
							<span
								class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20"
							>
								<Sparkles size={12} strokeWidth={1.75} />
								<span>{t('bento.flagshipBadge')}</span>
							</span>
							<ShareButton
								url="/projects#{featuredProject.id}"
								title="{featuredProject.title} · Edge CMS"
								description={localized(featuredProject, 'description')}
								variant="icon"
							/>
						</div>

						<div>
							<a
								href={featuredProject.link}
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex items-center gap-2 text-2xl sm:text-3xl font-extrabold text-text-main group-hover:text-primary transition-colors"
							>
								<span>{featuredProject.title}</span>
								<ArrowUpRight
									size={22}
									strokeWidth={1.75}
									class="text-text-muted group-hover:text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
								/>
							</a>
							{#if localized(featuredProject, 'tagline')}
								<p class="text-xs sm:text-sm text-text-muted font-medium mt-1">
									{localized(featuredProject, 'tagline')}
								</p>
							{/if}
						</div>

						<p class="text-xs sm:text-sm text-text-body leading-relaxed max-w-xl">
							{localized(featuredProject, 'description')}
						</p>

						{#if featuredProject.thumbnail}
							<div
								class="w-full aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden bg-soft-bg border border-border-subtle relative mt-2"
							>
								<img
									src={featuredProject.thumbnail}
									alt={featuredProject.title}
									class="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-102"
									loading="lazy"
								/>
							</div>
						{/if}
					</div>

					<div
						class="pt-4 border-t border-border-subtle flex flex-wrap items-center justify-between gap-3"
					>
						<div class="flex flex-wrap gap-1.5">
							{#each (featuredProject.tags || []).slice(0, 4) as tag}
								<span
									class="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-soft-bg text-text-muted border border-border-subtle"
								>
									{tag}
								</span>
							{/each}
						</div>
						<a
							href={featuredProject.link}
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
						>
							<span>{t('projects.liveDemo')}</span>
							<ExternalLink size={13} strokeWidth={1.75} />
						</a>
					</div>
				</article>
			{/if}

			<!-- BENTO CELL 2: Quick Impact Metrics (Span 4 / 12 or 12 / 12 if projects disabled) -->
			<div
				class="{featuredProject && data.settings?.showProjects !== false
					? 'md:col-span-4'
					: 'md:col-span-12'} rounded-3xl bg-surface border border-border-subtle specular-highlight p-6 sm:p-8 flex flex-col justify-between space-y-6"
			>
				<div class="space-y-2">
					<span class="text-xs font-bold uppercase tracking-wider text-text-muted"
						>{t('bento.coreMetrics')}</span
					>
					<h3 class="text-xl font-extrabold text-text-main">{t('bento.performanceEdge')}</h3>
				</div>

				<div
					class="grid {featuredProject && data.settings?.showProjects !== false
						? 'grid-cols-1'
						: 'grid-cols-1 sm:grid-cols-3'} gap-4"
				>
					<div
						class="p-3.5 rounded-2xl bg-soft-bg border border-border-subtle flex items-center justify-between"
					>
						<div>
							<div class="text-2xl font-black text-text-main">10+</div>
							<div class="text-[11px] text-text-muted">{t('bento.statsExperience')}</div>
						</div>
						<Zap size={22} strokeWidth={1.75} class="text-amber-500" />
					</div>

					<div
						class="p-3.5 rounded-2xl bg-soft-bg border border-border-subtle flex items-center justify-between"
					>
						<div>
							<div class="text-2xl font-black text-text-main">$0/mo</div>
							<div class="text-[11px] text-text-muted">{t('bento.statsAutonomy')}</div>
						</div>
						<Globe size={22} strokeWidth={1.75} class="text-emerald-500" />
					</div>

					<div
						class="p-3.5 rounded-2xl bg-soft-bg border border-border-subtle flex items-center justify-between"
					>
						<div>
							<div class="text-2xl font-black text-text-main">&lt; 100ms</div>
							<div class="text-[11px] text-text-muted">{t('bento.statsResponse')}</div>
						</div>
						<Cpu size={22} strokeWidth={1.75} class="text-blue-500" />
					</div>
				</div>

				{#if isMaster}
					<button
						type="button"
						onclick={() => openFreeSlotModal('bento_metrics')}
						class="w-full py-2.5 px-3 rounded-xl bg-text-main text-main-bg hover:opacity-90 font-bold text-xs transition-all text-center cursor-pointer"
					>
						{t('bento.claimSlot')}
					</button>
				{/if}
			</div>

			<!-- BENTO CELL 3: Tech Stack Matrix -->
			<div
				class="{isMaster
					? 'md:col-span-5'
					: 'md:col-span-8'} rounded-3xl bg-surface border border-border-subtle specular-highlight p-6 sm:p-8 flex flex-col justify-between space-y-6"
			>
				<div class="space-y-2">
					<div class="flex items-center gap-2 text-primary">
						<Code2 size={16} strokeWidth={1.75} />
						<span class="text-xs font-bold uppercase tracking-wider">{t('bento.tooling')}</span>
					</div>
					<h3 class="text-xl font-extrabold text-text-main">{t('bento.skillsTitle')}</h3>
					<p class="text-xs text-text-body">
						{t('bento.toolingDesc')}
					</p>
				</div>

				<div class="grid grid-cols-2 gap-2.5">
					{#each techStack as tech}
						<div
							class="p-3 rounded-xl bg-soft-bg border border-border-subtle {tech.glow} transition-colors"
						>
							<div class="text-xs font-bold text-text-main">{tech.name}</div>
							<div class="text-[10px] text-text-muted">{tech.category}</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- BENTO CELL 4: VIP Sponsorship & Free Slots (Span 7 / 12) -->
			{#if isMaster}
				<div
					class="md:col-span-7 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-surface to-surface border border-indigo-500/30 specular-highlight p-6 sm:p-8 flex flex-col justify-between space-y-6 relative overflow-hidden"
				>
					<div class="space-y-3">
						<div
							class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold"
						>
							<span class="size-2 rounded-full bg-indigo-500 animate-pulse"></span>
							<span>{t('home.vipBanner.badge')}</span>
						</div>
						<h3 class="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
							{t('home.vipBanner.title')}
						</h3>
						<p class="text-xs sm:text-sm text-text-body leading-relaxed max-w-lg">
							{t('home.vipBanner.desc')}
						</p>
					</div>

					<div
						class="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-border-subtle"
					>
						<div class="text-xs text-text-muted">
							<strong class="text-text-main">{t('bento.slotRemaining')}</strong> · {t(
								'bento.slotTime'
							)}
						</div>
						<button
							type="button"
							onclick={() => openFreeSlotModal('bento_banner')}
							class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer"
						>
							<span>{t('home.vipBanner.ctaBtn')}</span>
							<ArrowRight size={14} strokeWidth={1.75} />
						</button>
					</div>
				</div>
			{/if}
		</div>
	</section>

	<!-- Bento Section 2: Other Projects & Latest Articles -->
	{#if data.settings?.showProjects !== false && otherProjects.length > 0}
		<section class="space-y-6 border-t border-border-subtle pt-12">
			<div class="flex items-end justify-between gap-4">
				<div class="space-y-1">
					<span class="text-xs font-bold uppercase tracking-wider text-text-muted"
						>{t('bento.moreWorks')}</span
					>
					<h2 class="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
						{t('projects.title')}
					</h2>
				</div>
				<a
					href="/projects"
					class="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-text-muted hover:text-primary transition-colors"
				>
					<span>{t('home.viewAllProjects')}</span>
					<ArrowRight size={14} strokeWidth={1.75} />
				</a>
			</div>

			<div class="grid gap-5 sm:grid-cols-3">
				{#each otherProjects as project}
					<article
						class="p-5 rounded-2xl bg-surface border border-border-subtle specular-highlight hover:border-border-strong hover:shadow-md transition-all flex flex-col justify-between space-y-4"
					>
						<div class="space-y-2.5">
							<div class="flex items-start justify-between gap-2">
								<h3
									class="font-bold text-text-main text-base group-hover:text-primary transition-colors"
								>
									{project.title}
								</h3>
								<a
									href={project.link}
									target="_blank"
									rel="noopener noreferrer"
									class="text-text-muted hover:text-primary transition-colors"
								>
									<ArrowUpRight size={16} strokeWidth={1.75} />
								</a>
							</div>
							<p class="text-xs text-text-body line-clamp-3 leading-relaxed">
								{localized(project, 'description')}
							</p>
						</div>

						<div class="pt-3 border-t border-border-subtle flex flex-wrap gap-1">
							{#each (localizedArray(project, 'tags') || project.tags).slice(0, 2) as tag}
								<span
									class="px-2 py-0.5 rounded text-[10px] font-medium bg-soft-bg text-text-muted border border-border-subtle"
								>
									{tag}
								</span>
							{/each}
						</div>
					</article>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Bento Section 3: Latest Insights / Blog -->
	{#if data.settings?.showBlog !== false && data.posts.length > 0}
		<section class="space-y-6 border-t border-border-subtle pt-12">
			<div class="flex items-end justify-between gap-4">
				<div class="space-y-1">
					<span class="text-xs font-bold uppercase tracking-wider text-text-muted"
						>{t('blog.title')}</span
					>
					<h2 class="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
						{t('home.latestPostsTitle')}
					</h2>
				</div>
				<a
					href="/blog"
					class="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-text-muted hover:text-primary transition-colors"
				>
					<span>{t('home.viewAllPosts')}</span>
					<ArrowRight size={14} strokeWidth={1.75} />
				</a>
			</div>

			<div class="grid gap-5 md:grid-cols-2">
				{#each data.posts.slice(0, 2) as post}
					<a
						href={`/blog/${post.slug}`}
						class="p-6 rounded-2xl bg-surface border border-border-subtle specular-highlight hover:border-border-strong hover:shadow-md transition-all space-y-3 block group"
					>
						<div class="flex items-center justify-between text-xs text-text-muted">
							<span class="font-semibold text-primary"
								>{post.meta.tags?.[0] ? `#${post.meta.tags[0]}` : 'Article'}</span
							>
							<span class="flex items-center gap-1"
								><Clock size={11} strokeWidth={1.75} />
								{calculateReadingTime(post.content, post.readingMinutes)}</span
							>
						</div>
						<h3
							class="text-lg font-bold text-text-main group-hover:text-primary transition-colors leading-snug"
						>
							{localized(post.meta, 'title') || post.meta.title}
						</h3>
						<p class="text-xs sm:text-sm text-text-body line-clamp-2 leading-relaxed">
							{localized(post, 'excerpt') || localized(post, 'content') || post.content || ''}
						</p>
					</a>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Bento Section 4: Video Practice -->
	{#if data.settings?.showVideos !== false && data.videos && data.videos.length > 0}
		<section class="space-y-6 border-t border-border-subtle pt-12">
			<div class="flex items-end justify-between gap-4">
				<div class="space-y-1">
					<div
						class="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-muted"
					>
						<PlayCircle size={13} strokeWidth={1.75} class="text-primary" />
						<span>{t('videos.title')}</span>
					</div>
					<h2 class="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
						{t('home.latestVideosTitle')}
					</h2>
				</div>
				<a
					href="/videos"
					class="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-text-muted hover:text-primary transition-colors"
				>
					<span>{t('home.viewAllVideos')} ({data.videos.length})</span>
					<ArrowRight size={14} strokeWidth={1.75} />
				</a>
			</div>

			<div class="grid gap-6 md:grid-cols-2">
				{#each data.videos.slice(0, 2) as video}
					<div
						class="p-4 sm:p-5 rounded-3xl bg-surface border border-border-subtle specular-highlight hover:border-border-strong hover:shadow-md transition-all space-y-3.5"
					>
						<VideoEmbed url={video.url} title={video.title} />
						<div class="px-1">
							<h3 class="font-bold text-base text-text-main leading-snug line-clamp-2">
								{video.title}
							</h3>
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/if}
</div>
