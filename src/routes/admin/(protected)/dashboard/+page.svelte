<script lang="ts">
	import { t } from '$lib/i18n/index.js';
	import StatsCard from '$lib/components/admin/StatsCard.svelte';
	import QuickActions from '$lib/components/admin/QuickActions.svelte';
	import { 
		FileText, 
		Video, 
		Briefcase, 
		Gift,
		Phone,
		Mail,
		ExternalLink,
		ArrowRight,
		ArrowUpRight,
		Edit3,
		Eye,
		MessageSquare,
		Globe,
		ShieldCheck,
		Loader2,
		Copy,
		Check,
		Calendar,
		User
	} from 'lucide-svelte';

	interface Lead {
		id: string;
		phone: string;
		email?: string;
		name?: string;
		field?: string;
		note?: string;
		source?: string;
		createdAt: string;
	}

	interface Post {
		id: string;
		title: string;
		slug: string;
		status: string;
		createdAt: string;
		tagCount: number;
		viewCount: number;
	}

	interface CommentItem {
		id: string;
		name: string;
		email?: string;
		content: string;
		postSlug?: string;
		createdAt: string;
		isAuthor?: boolean;
	}

	let { data }: {
		data: {
			user: any;
			siteUrl: string;
			stats: {
				posts: number;
				publishedPosts: number;
				draftPosts: number;
				videos: number;
				projects: number;
				leads: number;
				comments: number;
			};
			recentLeads: Lead[];
			recentPosts: Post[];
			recentComments: CommentItem[];
		};
	} = $props();

	let copiedPhoneId = $state<string | null>(null);
	let isPublishing = $state(false);
	let publishFeedback = $state<string | null>(null);

	// Format numbers
	function formatNumber(num: number) {
		return new Intl.NumberFormat('vi-VN').format(num);
	}

	// Format friendly relative time
	function formatRelativeTime(dateStr: string) {
		if (!dateStr) return '';
		const diff = Date.now() - new Date(dateStr).getTime();
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(diff / 3600000);
		const days = Math.floor(diff / 86400000);

		if (minutes < 1) return t('common.justNow');
		if (minutes < 60) return t('common.minutesAgo', { m: minutes });
		if (hours < 24) return t('common.hoursAgo', { h: hours });
		if (days === 1) return t('common.yesterday');
		if (days < 30) return t('common.daysAgo', { d: days });
		return new Date(dateStr).toLocaleDateString('vi-VN');
	}

	// Copy phone helper
	async function copyPhone(id: string, phone: string) {
		if (typeof window === 'undefined') return;
		try {
			await navigator.clipboard.writeText(phone);
			copiedPhoneId = id;
			setTimeout(() => {
				if (copiedPhoneId === id) copiedPhoneId = null;
			}, 2000);
		} catch (_) {}
	}

	// Handle quick publish
	async function handlePublish() {
		if (isPublishing) return;
		isPublishing = true;
		publishFeedback = null;
		try {
			const res = await fetch('/admin/publish', { method: 'POST' });
			const result = await res.json();
			if (result.success) {
				publishFeedback = result.message || t('admin.dashboard.publishSuccess', { defaultValue: 'Published successfully! Vercel is deploying to Edge.' });
			} else {
				publishFeedback = result.error || t('admin.dashboard.publishError', { defaultValue: 'Error publishing, please try again.' });
			}
		} catch {
			publishFeedback = t('admin.dashboard.publishConnectError', { defaultValue: 'Cannot connect to the publishing server.' });
		} finally {
			isPublishing = false;
			setTimeout(() => {
				publishFeedback = null;
			}, 6000);
		}
	}

	// Dynamic greeting
	function getGreeting() {
		const hour = new Date().getHours();
		if (hour < 12) return t('admin.dashboard.morning');
		if (hour < 18) return t('admin.dashboard.afternoon');
		return t('admin.dashboard.evening');
	}
</script>

<svelte:head>
	<title>{t('admin.dashboard.metaTitle')}</title>
</svelte:head>

<div class="p-4 sm:p-6 lg:p-8 max-w-[1560px] mx-auto space-y-6 sm:space-y-8">
	<!-- Top Command Header -->
	<header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
		<div class="space-y-2">
			<div class="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
				<span class="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
				<span>{t('admin.dashboard.systemStatusLive')}</span>
			</div>
			<h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-main tracking-tight">
				{getGreeting()}, {data.user?.name || 'Admin'}
			</h1>
			<p class="text-sm sm:text-base text-text-muted font-normal max-w-2xl">
				{t('admin.dashboard.overviewSubtitle')}
			</p>
		</div>

		<!-- Production Domain & Live Actions -->
		<div class="flex flex-wrap items-center gap-2.5 shrink-0">
			<!-- Production Domain Pill -->
			<a
				href={data.siteUrl || "/"}
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-surface border border-border-subtle hover:border-border-strong text-text-main text-xs font-semibold transition-all shadow-2xs group"
				title={t('admin.dashboard.openLiveSite', { defaultValue: 'Open official website' })}
			>
				<span class="size-2 rounded-full bg-emerald-500 shrink-0"></span>
				<span>{new URL(data.siteUrl || "http://localhost:5173").hostname}</span>
				<ExternalLink strokeWidth={1.75} size={13} class="text-text-muted group-hover:text-text-main transition-colors" />
			</a>

			<!-- Quick Publish Button -->
			<button
				type="button"
				onclick={handlePublish}
				disabled={isPublishing}
				class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-60 text-white text-xs font-bold transition-all shadow-sm active:scale-98 cursor-pointer"
			>
				{#if isPublishing}
					<Loader2 strokeWidth={1.75} size={14} class="animate-spin" />
					<span>{t('admin.nav.publishing')}</span>
				{:else}
					<Globe strokeWidth={1.75} size={14} />
					<span>{t('admin.nav.publishSite')}</span>
				{/if}
			</button>
		</div>
	</header>

	<!-- Feedback Notification if any -->
	{#if publishFeedback}
		<div class="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200">
			<div class="flex items-center gap-2">
				<Check size={16} strokeWidth={2.25} class="text-indigo-600 dark:text-indigo-400 shrink-0" />
				<span>{publishFeedback}</span>
			</div>
			<button type="button" onclick={() => publishFeedback = null} class="text-indigo-600 dark:text-indigo-400 hover:underline text-[11px] cursor-pointer">
				{t('common.close', { defaultValue: 'Close' })}
			</button>
		</div>
	{/if}

	<!-- 4 Key Operational Metrics -->
	<section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
		<!-- 1. Leads / Free Slot Registrations -->
		<StatsCard
			title={t('admin.nav.leads')}
			value={data.stats.leads}
			icon={Gift}
			subtitle={`${t('admin.dashboard.leadsReceived', { count: data.stats.leads })}`}
			badgeText="Mini CRM"
			badgeColor={data.stats.leads > 0 ? 'emerald' : 'slate'}
			href="/admin/leads"
		/>

		<!-- 2. Blog Posts -->
		<StatsCard
			title={t('admin.nav.posts')}
			value={formatNumber(data.stats.posts)}
			icon={FileText}
			subtitle={data.stats.draftPosts > 0 ? t('admin.dashboard.draftPostsNeedReview', { count: data.stats.draftPosts, defaultValue: `${data.stats.draftPosts} drafts need review` }) : t('admin.dashboard.allPublishedPosts', { defaultValue: 'All posts are published' })}
			badgeText={t('admin.dashboard.publishedCount', { count: data.stats.publishedPosts, defaultValue: `${data.stats.publishedPosts} Published` })}
			badgeColor="indigo"
			href="/admin/posts"
		/>

		<!-- 3. Projects & Ecosystem -->
		<StatsCard
			title={t('admin.nav.projects')}
			value={formatNumber(data.stats.projects)}
			icon={Briefcase}
			subtitle="EdTech, FinTech & Edge"
			badgeText="Edge Native"
			badgeColor="slate"
			href="/admin/projects"
		/>

		<!-- 4. Community Feedback -->
		<StatsCard
			title={t('admin.nav.comments')}
			value={formatNumber(data.stats.comments)}
			icon={MessageSquare}
			subtitle={t('admin.dashboard.recentCommentsTitle')}
			badgeText={t('admin.dashboard.readers', { defaultValue: 'Readers' })}
			badgeColor={data.stats.comments > 0 ? 'amber' : 'slate'}
			href="/admin/comments"
		/>
	</section>

	<!-- Main Canvas: Two Columns -->
	<div class="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 items-start">
		<!-- Left Main Column (8/12 width on widescreen) -->
		<div class="xl:col-span-8 space-y-6 sm:space-y-8">
			<!-- Section 1: Leads Intake (Hồ sơ đăng ký suất $0) -->
			<section class="rounded-3xl bg-surface border border-border-subtle p-5 sm:p-7 space-y-5 shadow-2xs">
				<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle">
					<div class="space-y-0.5">
						<div class="flex items-center gap-2">
							<div class="size-7 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
								<Gift strokeWidth={1.75} size={15} />
							</div>
							<h2 class="text-base sm:text-lg font-bold text-text-main tracking-tight">
								{t('admin.dashboard.recentLeadsTitle')}
							</h2>
						</div>
						<p class="text-xs text-text-muted">
							{t('admin.dashboard.leadsSubtitle')}
						</p>
					</div>

					<div class="flex items-center gap-2 self-start sm:self-auto">
						<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
							{t('admin.dashboard.leadsReceivedCount', { count: data.stats.leads, defaultValue: `${data.stats.leads} profiles received` })}
						</span>
						<a
							href="/admin/leads"
							class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-soft-bg hover:bg-surface border border-border-subtle text-primary transition-colors shrink-0"
						>
							{t('admin.dashboard.viewAll')}
						</a>
					</div>
				</div>

				{#if data.recentLeads && data.recentLeads.length > 0}
					<div class="space-y-3.5">
						{#each data.recentLeads as lead (lead.id)}
							<article class="p-4 sm:p-5 rounded-2xl bg-soft-bg/60 border border-border-subtle hover:border-border-strong transition-all space-y-3">
								<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
									<div class="space-y-1 min-w-0">
										<div class="flex flex-wrap items-center gap-2">
											<h3 class="text-sm sm:text-base font-bold text-text-main">
												{lead.name || t('admin.leads.anonymousGuest')}
											</h3>
											{#if lead.field}
												<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
													{lead.field}
												</span>
											{/if}
										</div>

										<div class="flex flex-wrap items-center gap-2.5 text-xs text-text-muted font-medium">
											<span class="inline-flex items-center gap-1">
												<Calendar strokeWidth={1.75} size={12} />
												{formatRelativeTime(lead.createdAt)}
											</span>
											{#if lead.source}
												<span>&bull;</span>
												<span class="text-[11px] text-text-muted">{lead.source}</span>
											{/if}
										</div>
									</div>

									<!-- Contact Actions -->
									<div class="flex items-center gap-1.5 shrink-0">
										<!-- Copy Phone Button -->
										<button
											type="button"
											onclick={() => copyPhone(lead.id, lead.phone)}
											class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-border-subtle hover:border-border-strong text-xs font-semibold text-text-main transition-colors cursor-pointer shadow-2xs"
											title={t('admin.leads.copied')}
										>
											{#if copiedPhoneId === lead.id}
												<Check strokeWidth={2.25} size={13} class="text-emerald-500" />
												<span class="text-emerald-600 dark:text-emerald-400 font-bold">{t('admin.leads.copied')}</span>
											{:else}
												<Copy strokeWidth={1.75} size={13} class="text-text-muted" />
												<span>{lead.phone}</span>
											{/if}
										</button>

										<!-- Direct Call Link -->
										<a
											href="tel:{lead.phone}"
											class="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
											title={t('admin.leads.callNow')}
										>
											<Phone strokeWidth={1.75} size={14} />
										</a>

										<!-- Zalo Link -->
										<a
											href="https://zalo.me/{lead.phone.replace(/[^0-9]/g, '')}"
											target="_blank"
											rel="noopener noreferrer"
											class="px-2.5 py-1.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 text-xs font-bold transition-colors"
											title={t('admin.leads.zalo')}
										>
											Zalo
										</a>
									</div>
								</div>

								{#if lead.note}
									<div class="p-3 rounded-xl bg-surface border border-border-subtle text-xs text-text-main leading-relaxed">
										<span class="font-bold text-text-muted block text-[11px] mb-0.5">{t('admin.leads.customerRequest')}:</span>
										{lead.note}
									</div>
								{/if}

								{#if lead.email}
									<div class="flex items-center gap-1.5 text-xs text-text-muted">
										<Mail strokeWidth={1.75} size={12} />
										<a href="mailto:{lead.email}" class="hover:underline">{lead.email}</a>
									</div>
								{/if}
							</article>
						{/each}
					</div>
				{:else}
					<div class="py-12 text-center rounded-2xl border border-dashed border-border-subtle space-y-2">
						<div class="size-12 rounded-2xl bg-soft-bg flex items-center justify-center text-text-muted mx-auto">
							<Gift strokeWidth={1.75} size={20} />
						</div>
						<p class="text-sm font-bold text-text-main">{t('admin.dashboard.noNewLeads')}</p>
						<p class="text-xs text-text-muted max-w-sm mx-auto">
							{t('admin.dashboard.noNewLeadsDesc')}
						</p>
					</div>
				{/if}
			</section>

			<!-- Section 2: Recent Blog Posts (Quản lý bài viết) -->
			<section class="rounded-3xl bg-surface border border-border-subtle p-5 sm:p-7 space-y-5 shadow-2xs">
				<div class="flex items-center justify-between pb-4 border-b border-border-subtle">
					<div class="space-y-0.5">
						<h2 class="text-base sm:text-lg font-bold text-text-main tracking-tight flex items-center gap-2">
							<FileText strokeWidth={1.75} size={17} class="text-primary" />
							<span>{t('admin.dashboard.recentPostsTitle')}</span>
						</h2>
						<p class="text-xs text-text-muted">
							{t('admin.dashboard.recentPostsDesc')}
						</p>
					</div>

					<a
						href="/admin/posts"
						class="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold text-text-muted hover:text-primary bg-soft-bg hover:bg-surface border border-border-subtle transition-colors"
					>
						{t('admin.dashboard.viewAllCount', { count: data.stats.posts })}
					</a>
				</div>

				{#if data.recentPosts && data.recentPosts.length > 0}
					<div class="divide-y divide-border-subtle">
						{#each data.recentPosts as post}
							<div class="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
								<div class="space-y-1 min-w-0 flex-1 pr-3">
									<div class="flex items-center gap-2.5">
										<h3 class="text-sm sm:text-base font-bold text-text-main group-hover:text-primary transition-colors truncate">
											{post.title}
										</h3>
										<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold shrink-0 {post.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'}">
											{post.status === 'PUBLISHED' ? t('admin.dashboard.published') : t('admin.dashboard.draft')}
										</span>
									</div>

									<div class="flex items-center gap-2.5 text-xs text-text-muted font-medium">
										<span>/{post.slug}</span>
										<span>&bull;</span>
										<span>{formatRelativeTime(post.createdAt)}</span>
										{#if post.tagCount > 0}
											<span>&bull;</span>
											<span>{t('admin.dashboard.tagCount', { count: post.tagCount, defaultValue: `${post.tagCount} tags` })}</span>
										{/if}
									</div>
								</div>

								<!-- Action Buttons -->
								<div class="flex items-center gap-1.5 shrink-0">
									<a
										href="/admin/posts/{post.slug}"
										class="p-2 rounded-xl bg-soft-bg hover:bg-primary/10 text-text-muted hover:text-primary border border-border-subtle transition-colors"
										title={t('admin.dashboard.editContent', { defaultValue: 'Edit content' })}
									>
										<Edit3 strokeWidth={1.75} size={15} />
									</a>
									<a
										href="/blog/{post.slug}"
										target="_blank"
										rel="noopener noreferrer"
										class="p-2 rounded-xl bg-soft-bg hover:bg-surface text-text-muted hover:text-text-main border border-border-subtle transition-colors"
										title={t('admin.dashboard.viewOnWeb', { defaultValue: 'View on website' })}
									>
										<Eye strokeWidth={1.75} size={15} />
									</a>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="py-10 text-center rounded-2xl border border-dashed border-border-subtle space-y-3">
						<p class="text-sm font-semibold text-text-main">{t('admin.dashboard.noPosts')}</p>
						<a
							href="/admin/posts/new"
							class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-sm"
						>
							<Edit3 strokeWidth={1.75} size={13} />
							<span>{t('admin.dashboard.createFirstPost')}</span>
						</a>
					</div>
				{/if}
			</section>
		</div>

		<!-- Right Side Column (4/12 width on widescreen) -->
		<div class="xl:col-span-4 space-y-6 sm:space-y-8">
			<!-- Component 1: Quick Actions Studio -->
			<QuickActions user={data.user} />

			<!-- Component 2: Recent Comments Feed -->
			<section class="rounded-3xl bg-surface border border-border-subtle p-6 space-y-4 shadow-2xs">
				<div class="flex items-center justify-between pb-3 border-b border-border-subtle">
					<h3 class="text-sm font-bold text-text-main flex items-center gap-2">
						<MessageSquare strokeWidth={1.75} size={15} class="text-amber-500" />
						<span>{t('admin.dashboard.recentCommentsTitle')}</span>
					</h3>
					<a href="/admin/comments" class="text-xs text-text-muted hover:text-text-main font-medium">
						{t('admin.dashboard.viewAll')}
					</a>
				</div>

				{#if data.recentComments && data.recentComments.length > 0}
					<div class="space-y-3">
						{#each data.recentComments as comment}
							<div class="p-3 rounded-2xl bg-soft-bg border border-border-subtle space-y-1.5 text-xs">
								<div class="flex items-center justify-between gap-2">
									<span class="font-bold text-text-main truncate">{comment.name}</span>
									<span class="text-[10px] text-text-muted shrink-0">{formatRelativeTime(comment.createdAt)}</span>
								</div>
								<p class="text-text-body line-clamp-2 leading-relaxed">
									{comment.content}
								</p>
								{#if comment.postSlug}
									<a href="/blog/{comment.postSlug}" target="_blank" class="inline-block text-[11px] text-primary hover:underline">
										/{comment.postSlug}
									</a>
								{/if}
							</div>
						{/each}
					</div>
				{:else}
					<div class="py-8 text-center text-xs text-text-muted">
						{t('admin.dashboard.noRecentComments')}
					</div>
				{/if}
			</section>

			<!-- Component 3: Production Infrastructure Card -->
			<section class="rounded-3xl bg-surface border border-border-subtle p-6 space-y-4 shadow-2xs">
				<div class="flex items-center justify-between pb-3 border-b border-border-subtle">
					<h3 class="text-sm font-bold text-text-main flex items-center gap-2">
						<ShieldCheck strokeWidth={1.75} size={15} class="text-emerald-500" />
						<span>{t('admin.dashboard.infraTitle')}</span>
					</h3>
					<span class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
						<span class="size-1.5 rounded-full bg-emerald-500"></span>
						{t('admin.dashboard.edgeLive')}
					</span>
				</div>

				<div class="space-y-3 text-sm">
					<div class="p-3 rounded-2xl bg-soft-bg border border-border-subtle space-y-1">
						<span class="text-xs font-medium text-text-muted">{t('admin.dashboard.primaryDomain')}</span>
						<p class="font-bold text-text-main flex items-center justify-between">
							<span>{new URL(data.siteUrl || "http://localhost:5173").hostname}</span>
							<span class="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{t('admin.dashboard.httpsActive')}</span>
						</p>
					</div>

					<div class="p-3 rounded-2xl bg-soft-bg border border-border-subtle space-y-1">
						<span class="text-xs font-medium text-text-muted">{t('admin.dashboard.serverlessInfra')}</span>
						<p class="font-bold text-text-main flex items-center justify-between">
							<span>Vercel Edge Network</span>
							<span class="text-xs text-text-muted">{t('admin.dashboard.freeHosting')}</span>
						</p>
					</div>

					<div class="p-3 rounded-2xl bg-soft-bg border border-border-subtle space-y-1">
						<span class="text-xs font-medium text-text-muted">{t('admin.dashboard.contentRepo')}</span>
						<p class="font-bold text-text-main flex items-center justify-between">
							<span>GitHub Sync</span>
							<span class="text-xs text-primary font-bold">GitHub Sync</span>
						</p>
					</div>
				</div>

				<div class="pt-2">
					<a
						href="/admin/settings"
						class="w-full flex items-center justify-center py-2.5 px-3 rounded-xl bg-soft-bg hover:bg-surface border border-border-subtle text-text-main text-sm font-semibold transition-colors"
					>
						{t('admin.dashboard.systemSettings')}
					</a>
				</div>
			</section>
		</div>
	</div>
</div>
