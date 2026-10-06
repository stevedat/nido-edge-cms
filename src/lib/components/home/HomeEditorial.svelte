<script lang="ts">
	import VideoEmbed from '$lib/components/VideoEmbed.svelte';
	import ShareButton from '$lib/components/ShareButton.svelte';
	import {
		ArrowUpRight,
		ArrowRight,
		Sparkles,
		BookOpen,
		Layers,
		PlayCircle,
		Clock,
		Check,
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

	function calculateReadingTime(content?: string, readingMinutes?: number): string {
		if (readingMinutes) return formatReadingTime(readingMinutes);
		if (!content) return formatReadingTime(3);
		const words = content.trim().split(/\s+/).length;
		const minutes = Math.ceil(words / 200);
		return formatReadingTime(Math.max(2, minutes));
	}

	function cleanExcerpt(content?: string): string {
		if (!content) return '';
		return (
			content
				.replace(/#+\s+/g, '')
				.replace(/(\*\*|__)(.*?)\1/g, '$2')
				.replace(/(\*|_)(.*?)\1/g, '$2')
				.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
				.replace(/<[^>]*>?/gm, '')
				.trim()
				.substring(0, 150) + '...'
		);
	}

	// Projects: first is featured, rest are secondary
	let featuredProject = $derived(data.projects[0] || null);
	let otherProjects = $derived(data.projects.slice(1, 3));
</script>

<svelte:head>
	{#if featuredProject?.thumbnail}
		<link rel="preload" as="image" href={featuredProject.thumbnail} fetchpriority="high" />
	{/if}
</svelte:head>

<div class="space-y-12 sm:space-y-20 py-4">
	<!-- Hero Section: Intentional Editorial Typography with Ambient Warm Glow -->
	<section class="relative pt-8 pb-4 sm:pt-16 sm:pb-8 space-y-8 rounded-3xl">
		<!-- Background Ambient Light -->
		<div
			class="absolute -top-16 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 ambient-glow-warm pointer-events-none -z-10"
		></div>

		<!-- Status Badge -->
		<div
			class="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-surface border border-border-subtle specular-highlight shadow-2xs backdrop-blur-md"
		>
			<span class="relative flex h-2 w-2">
				<span
					class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
				></span>
				<span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
			</span>
			<span class="text-xs font-semibold text-text-body">
				{t('home.statusBadge')} <span class="text-edtech font-bold">EdTech</span> &
				<span class="text-fintech font-bold">FinTech</span>
			</span>
		</div>

		<div class="space-y-6 max-w-3xl">
			<h1
				class="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-text-main tracking-tight leading-[1.08] text-balance break-words"
			>
				{getLocale() === 'en' && data.settings?.heroTitle_en
					? data.settings.heroTitle_en
					: data.settings?.heroTitle || 'Designer & Builder.'}
			</h1>
			<p
				class="text-base sm:text-xl md:text-2xl text-text-body leading-relaxed font-normal text-balance"
			>
				{getLocale() === 'en' && data.settings?.heroBio_en
					? data.settings.heroBio_en
					: data.settings?.heroBio ||
						(getLocale() === 'en'
							? 'Designing digital products and engineering software focused on high utility, instant responsiveness, and craft.'
							: 'Thiết kế sản phẩm và kỹ thuật phần mềm tập trung vào tính ứng dụng cao, tốc độ phản hồi tức thì và sự hoàn thiện đến từng chi tiết.')}
			</p>
		</div>

		<!-- High-contrast Action CTAs -->
		<div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
			{#if data.settings?.showProjects !== false}
				<a
					href="/projects"
					class="inline-flex items-center justify-center gap-2 px-5 py-3.5 sm:py-3 rounded-xl bg-text-main text-main-bg hover:opacity-90 font-semibold text-xs sm:text-sm shadow-sm transition-all active:scale-98 min-h-[44px]"
				>
					<Layers size={16} strokeWidth={1.75} />
					<span>{t('home.exploreProjects')}</span>
				</a>
			{/if}
			{#if data.settings?.showBlog !== false}
				<a
					href="/blog"
					class="inline-flex items-center justify-center gap-2 px-5 py-3.5 sm:py-3 rounded-xl bg-surface border border-border-subtle specular-highlight text-text-main hover:bg-soft-bg font-semibold text-xs sm:text-sm transition-all active:scale-98 min-h-[44px]"
				>
					<BookOpen size={16} strokeWidth={1.75} />
					<span>{t('home.readBlog')}</span>
				</a>
			{/if}
			{#if data.settings?.showProjects === false && data.settings?.showBlog === false}
				<a
					href="/about"
					class="inline-flex items-center justify-center gap-2 px-5 py-3.5 sm:py-3 rounded-xl bg-text-main text-main-bg hover:opacity-90 font-semibold text-xs sm:text-sm shadow-sm transition-all active:scale-98 min-h-[44px]"
				>
					<span>{t('nav.about')}</span>
				</a>
			{/if}
		</div>
	</section>

	<!-- Section 1: Featured Projects (Open Showcase Stage) -->
	{#if data.settings?.showProjects !== false && featuredProject}
		<section class="space-y-8 sm:space-y-10">
			<!-- Section Header -->
			<div
				class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border-subtle pb-6"
			>
				<div class="space-y-2">
					<div
						class="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-text-muted uppercase"
					>
						<span class="size-2 rounded-full bg-primary"></span>
						<span>{t('home.caseStudiesBadge')}</span>
					</div>
					<h2 class="text-2xl sm:text-4xl font-extrabold text-text-main tracking-tight">
						{t('home.featuredProjectsTitle')}
					</h2>
					<p class="text-xs sm:text-sm text-text-muted max-w-xl leading-relaxed">
						{t('home.featuredProjectsDesc')}
					</p>
				</div>
				<a
					class="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-text-muted hover:text-primary transition-colors group shrink-0"
					href="/projects"
				>
					<span>{t('home.viewAllProjects')} ({data.projects.length})</span>
					<ArrowRight
						size={14}
						strokeWidth={1.75}
						class="group-hover:translate-x-1 transition-transform"
					/>
				</a>
			</div>

			<!-- VIP Offer Announcement Pill for Sep & Oct -->
			{#if isMaster}
				<button
					type="button"
					onclick={() => openFreeSlotModal('homepage_pill')}
					class="w-full text-left cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 sm:px-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-700/50 hover:border-indigo-500/50 transition-all shadow-sm shadow-indigo-500/5 active:scale-[0.99]"
				>
					<div class="flex items-center gap-2.5 sm:gap-3">
						<span class="size-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
						<div class="text-xs sm:text-sm text-indigo-950 dark:text-indigo-200">
							<strong class="font-bold text-indigo-600 dark:text-indigo-400"
								>{t('home.vipBanner.badge')}:</strong
							>
							<span class="ml-1 text-text-body">{t('home.vipBanner.desc')}</span>
						</div>
					</div>
					<span
						class="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform shrink-0 self-end sm:self-auto"
					>
						<span>{t('home.vipBanner.ctaBtn')}</span>
						<ArrowRight size={13} strokeWidth={1.75} />
					</span>
				</button>
			{/if}

			<!-- Lead Hero Project Showcase Card -->
			<article
				class="group rounded-3xl bg-surface border border-border-subtle specular-highlight hover:border-primary/40 transition-all duration-300 overflow-hidden flex flex-col lg:flex-row shadow-sm hover:shadow-md"
			>
				<!-- Visual Showcase -->
				{#if featuredProject.thumbnail}
					<a
						href={featuredProject.link}
						target="_blank"
						rel="noopener noreferrer"
						class="w-full lg:w-7/12 aspect-[16/10] lg:aspect-auto overflow-hidden bg-soft-bg relative block"
					>
						<img
							src={featuredProject.thumbnail}
							alt={featuredProject.title}
							class="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-103"
							loading="eager"
							fetchpriority="high"
							decoding="async"
						/>
						<div
							class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity"
						></div>

						<!-- Domain Pill Overlay -->
						<div class="absolute top-4 left-4 z-10">
							<span
								class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md bg-black/65 text-white border border-white/20 shadow-sm"
							>
								{t('home.featuredBadge')}
							</span>
						</div>
					</a>
				{:else}
					<div
						class="w-full lg:w-7/12 aspect-[16/10] bg-gradient-to-br from-soft-bg to-surface p-8 flex flex-col justify-between"
					>
						<span
							class="size-10 rounded-xl bg-text-main text-main-bg text-sm font-bold flex items-center justify-center"
						>
							{featuredProject.title.substring(0, 2).toUpperCase()}
						</span>
						<div class="space-y-1">
							<span class="text-xs font-bold uppercase tracking-wider text-text-muted"
								>{t('common.coreSystem')}</span
							>
							<h3 class="text-2xl font-bold text-text-main">{featuredProject.title}</h3>
						</div>
					</div>
				{/if}

				<!-- Content & Highlights -->
				<div class="flex-1 p-5 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
					<div class="space-y-4">
						<div>
							<div class="flex items-center gap-2 mb-1">
								<span class="text-xs font-bold uppercase tracking-wider text-edtech"
									>{t('home.edtechSolution')}</span
								>
							</div>
							<a
								href={featuredProject.link}
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex items-center gap-2 text-2xl sm:text-3xl font-extrabold text-text-main group-hover:text-primary transition-colors"
							>
								<span>{featuredProject.title}</span>
								<ArrowUpRight
									size={20}
									strokeWidth={1.75}
									class="text-text-muted group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
								/>
							</a>
							{#if localized(featuredProject, 'tagline')}
								<p class="text-xs sm:text-sm font-medium text-text-muted mt-1">
									{localized(featuredProject, 'tagline')}
								</p>
							{/if}
						</div>

						<p class="text-sm sm:text-base text-text-body leading-relaxed font-normal">
							{localized(featuredProject, 'description')}
						</p>

						<!-- Highlights if available -->
						{#if localizedArray(featuredProject, 'highlights').length > 0}
							<div class="space-y-2 pt-2">
								<p class="text-xs font-bold uppercase tracking-wider text-text-muted">
									{t('projects.coreFeatures')}
								</p>
								<ul class="space-y-1.5 text-xs sm:text-sm text-text-body">
									{#each localizedArray(featuredProject, 'highlights').slice(0, 2) as highlight}
										<li class="flex items-start gap-2">
											<Check
												size={14}
												strokeWidth={2.25}
												class="text-emerald-500 shrink-0 mt-0.5"
											/>
											<span>{highlight}</span>
										</li>
									{/each}
								</ul>
							</div>
						{/if}
					</div>

					<div
						class="pt-4 border-t border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3"
					>
						{#if featuredProject.tags && featuredProject.tags.length > 0}
							<div class="flex flex-wrap gap-1.5">
								{#each featuredProject.tags as tag}
									<span
										class="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-soft-bg text-text-muted border border-border-subtle"
									>
										{tag}
									</span>
								{/each}
							</div>
						{/if}

						<div class="flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0">
							<ShareButton
								url="/projects#{featuredProject.id}"
								title="{featuredProject.title} · Edge CMS"
								description={localized(featuredProject, 'description')}
								variant="icon"
							/>
							<a
								href={featuredProject.link}
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-text-main text-main-bg hover:opacity-90 font-semibold text-xs transition-opacity shadow-2xs min-h-[38px]"
							>
								<span>{t('projects.liveDemo')}</span>
								<ExternalLink size={13} strokeWidth={1.75} />
							</a>
						</div>
					</div>
				</div>
			</article>

			<!-- Secondary Project Grid (2 columns) -->
			{#if otherProjects.length > 0}
				<div class="grid gap-6 sm:grid-cols-2">
					{#each otherProjects as project}
						<article
							class="group p-6 sm:p-7 rounded-2xl bg-surface border border-border-subtle specular-highlight hover:border-border-strong hover:shadow-xs transition-all flex flex-col justify-between space-y-4"
						>
							<div class="space-y-3">
								<div class="flex items-start justify-between gap-3">
									<div>
										<h3
											class="text-xl font-bold text-text-main group-hover:text-primary transition-colors"
										>
											{project.title}
										</h3>
										{#if localized(project, 'tagline')}
											<p class="text-xs text-text-muted mt-0.5">{localized(project, 'tagline')}</p>
										{/if}
									</div>
									<div class="flex items-center gap-1.5 shrink-0">
										<ShareButton
											url="/projects#{project.id}"
											title="{project.title} · Edge CMS"
											description={localized(project, 'description')}
											variant="icon"
											class="!size-8 !rounded-lg"
										/>
										<a
											href={project.link}
											target="_blank"
											rel="noopener noreferrer"
											class="size-8 rounded-lg bg-soft-bg border border-border-subtle flex items-center justify-center text-text-muted group-hover:text-primary transition-colors shrink-0"
											aria-label={t('projects.exploreProject', { title: project.title })}
										>
											<ArrowUpRight size={15} strokeWidth={1.75} />
										</a>
									</div>
								</div>

								<p class="text-xs sm:text-sm text-text-body leading-relaxed line-clamp-3">
									{localized(project, 'description')}
								</p>
							</div>

							<div class="pt-3 border-t border-border-subtle flex flex-wrap gap-1.5">
								{#each (localizedArray(project, 'tags') || project.tags).slice(0, 3) as tag}
									<span
										class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-soft-bg text-text-muted border border-border-subtle"
									>
										{tag}
									</span>
								{/each}
							</div>
						</article>
					{/each}
				</div>
			{/if}
		</section>
	{/if}

	<!-- Section 2: Latest Writing (Asymmetric Split Editorial Canvas) -->
	{#if data.settings?.showBlog !== false && data.posts.length > 0}
		<section class="border-t border-border-subtle pt-12 sm:pt-16">
			<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
				<!-- Left Sticky Editorial Column (lg:col-span-4) -->
				<div class="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
					<div
						class="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-text-muted uppercase"
					>
						<span class="size-2 rounded-full bg-edtech"></span>
						<span>{t('home.writingBadge')}</span>
					</div>
					<h2
						class="text-2xl sm:text-4xl font-extrabold text-text-main tracking-tight leading-tight"
					>
						{t('home.latestPostsTitle')}
					</h2>
					<p class="text-xs sm:text-sm text-text-muted leading-relaxed">
						{t('home.latestPostsDesc')}
					</p>
					<div class="pt-2">
						<a
							class="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:underline group"
							href="/blog"
						>
							<span>{t('home.viewAllPosts')} ({data.posts.length})</span>
							<ArrowRight
								size={14}
								strokeWidth={1.75}
								class="group-hover:translate-x-1 transition-transform"
							/>
						</a>
					</div>
				</div>

				<!-- Right Column: Editorial Timeline Stream (lg:col-span-8) -->
				<div
					class="lg:col-span-8 divide-y divide-border-subtle border-t lg:border-t-0 border-border-subtle"
				>
					{#each data.posts.slice(0, 4) as post, idx}
						<a
							href={`/blog/${post.slug}`}
							class="group py-6 first:pt-2 lg:first:pt-0 last:pb-2 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-6 transition-colors block"
						>
							<!-- Left timeline col: Date + Reading time -->
							<div
								class="sm:w-40 shrink-0 flex sm:flex-col items-center sm:items-start gap-2 sm:gap-1 text-xs text-text-muted"
							>
								<time datetime={post.meta.date} class="font-medium text-text-body">
									{formatDate(post.meta.date, { day: 'numeric', month: 'short', year: 'numeric' })}
								</time>
								<span
									class="inline-flex items-center gap-1 text-[11px] text-text-muted font-normal"
								>
									<Clock size={11} strokeWidth={1.75} />
									{calculateReadingTime(post.content, post.readingMinutes)}
								</span>
							</div>

							<!-- Content col -->
							<div class="flex-1 space-y-2">
								<div class="flex items-center gap-2 text-xs font-semibold">
									{#if idx === 0}
										<span
											class="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-wider"
										>
											{t('common.latest')}
										</span>
									{/if}
									{#if post.meta.tags && post.meta.tags.length > 0}
										<span class="text-text-muted font-normal">#{post.meta.tags[0]}</span>
									{/if}
								</div>

								<h3
									class="text-lg sm:text-xl font-bold text-text-main group-hover:text-primary transition-colors leading-snug"
								>
									{localized(post.meta, 'title') || post.meta.title}
								</h3>
								{#if post.excerpt || post.content}
									<p
										class="text-xs sm:text-sm text-text-body font-normal line-clamp-2 leading-relaxed"
									>
										{cleanExcerpt(
											localized(post, 'excerpt') || localized(post, 'content') || post.content
										)}
									</p>
								{/if}
							</div>

							<div
								class="hidden sm:flex items-center self-center text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all pl-2"
							>
								<ArrowRight size={16} strokeWidth={1.75} />
							</div>
						</a>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- Section 3: Visual Video Practice (Studio Cinema Strip) -->
	{#if data.settings?.showVideos !== false && data.videos.length > 0}
		<section
			class="rounded-3xl bg-neutral-900 dark:bg-black/80 border border-neutral-800 dark:border-white/10 p-6 sm:p-10 space-y-8 relative overflow-hidden shadow-xl text-neutral-100"
		>
			<!-- Top Ambient Cinema Glow -->
			<div
				class="absolute -top-24 left-1/2 -translate-x-1/2 w-3/4 h-48 bg-gradient-to-b from-primary/20 to-transparent blur-3xl pointer-events-none -z-0"
			></div>

			<!-- Section Header -->
			<div
				class="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6"
			>
				<div class="space-y-2">
					<div
						class="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-rose-400 uppercase"
					>
						<span class="size-2 rounded-full bg-rose-500 animate-pulse"></span>
						<span>{t('home.labsBadge')}</span>
					</div>
					<h2 class="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
						{t('home.latestVideosTitle')}
					</h2>
					<p class="text-xs sm:text-sm text-neutral-400 max-w-xl leading-relaxed">
						{t('home.latestVideosDesc')}
					</p>
				</div>
				<a
					class="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-300 hover:text-white transition-colors group shrink-0"
					href="/videos"
				>
					<span>{t('home.viewAllVideos')} ({data.videos.length})</span>
					<ArrowRight
						size={14}
						strokeWidth={1.75}
						class="group-hover:translate-x-1 transition-transform"
					/>
				</a>
			</div>

			<!-- Video Cards -->
			<div class="relative z-10 grid gap-6 md:grid-cols-2">
				{#each data.videos.slice(0, 2) as video}
					<div
						class="p-4 sm:p-5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all space-y-3.5 backdrop-blur-xs"
					>
						<div class="rounded-xl overflow-hidden bg-black/40 aspect-[16/9]">
							<VideoEmbed
								url={video.url}
								platform={video.platform.toLowerCase()}
								title={localized(video, 'title') || video.title}
								autoplay={false}
							/>
						</div>
						<div class="flex items-center justify-between gap-3 pt-1">
							<h3 class="text-sm sm:text-base font-bold text-white line-clamp-2 leading-snug">
								{localized(video, 'title') || video.title}
							</h3>
							<div class="flex items-center gap-1.5 shrink-0">
								<span
									class="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-neutral-300 uppercase border border-white/15"
								>
									{video.platform}
								</span>
								<ShareButton
									url={video.url}
									title={localized(video, 'title') || video.title || 'Video · Edge CMS'}
									variant="compact"
									class="!bg-white/10 !text-neutral-200 !border-white/15 hover:!bg-white/20 hover:!text-white"
								/>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/if}
</div>
