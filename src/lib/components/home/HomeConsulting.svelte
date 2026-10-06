<script lang="ts">
	import {
		ShieldCheck,
		Award,
		Zap,
		Users,
		Check,
		Calendar,
		Clock,
		ArrowRight,
		HelpCircle,
		ChevronDown,
		MessageSquare,
		Send,
		ExternalLink,
		Sparkles,
		Layers,
		BookOpen,
		PlayCircle,
		ArrowUpRight
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
	import ShareButton from '$lib/components/ShareButton.svelte';
	import VideoEmbed from '$lib/components/VideoEmbed.svelte';
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

	let openFaq = $state<number | null>(null);

	function toggleFaq(idx: number) {
		openFaq = openFaq === idx ? null : idx;
	}

	function calculateReadingTime(content?: string, readingMinutes?: number): string {
		if (readingMinutes) return formatReadingTime(readingMinutes);
		if (!content) return formatReadingTime(3);
		const words = content.trim().split(/\s+/).length;
		const minutes = Math.ceil(words / 200);
		return formatReadingTime(Math.max(2, minutes));
	}
</script>

<div class="space-y-24 sm:space-y-36 py-4">
	<!-- Hero Section: Authority & High-Conversion Positioning -->
	<section class="relative pt-12 pb-8 sm:pt-20 sm:pb-12 space-y-8 rounded-3xl">
		<div
			class="absolute -top-16 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 ambient-glow-warm pointer-events-none -z-10"
		></div>

		<!-- Status Badge -->
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
				{t('consulting.heroBadge')}
			</span>
		</div>

		<div class="space-y-6 max-w-3xl">
			<h1
				class="text-3xl sm:text-5xl md:text-6xl font-extrabold text-text-main tracking-tight leading-[1.12] text-balance break-words"
			>
				{getLocale() === 'en' && data.settings?.heroTitle_en
					? data.settings.heroTitle_en
					: data.settings?.heroTitle || t('consulting.heroTitle')}
			</h1>
			<p class="text-base sm:text-xl text-text-body leading-relaxed font-normal text-balance">
				{getLocale() === 'en' && data.settings?.heroBio_en
					? data.settings.heroBio_en
					: data.settings?.heroBio || t('consulting.heroBio')}
			</p>
		</div>

		<!-- Action CTAs -->
		<div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
			{#if isMaster}
				<button
					type="button"
					onclick={() => openFreeSlotModal('consulting_hero')}
					class="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-text-main text-main-bg hover:opacity-90 font-bold text-sm shadow-md transition-all active:scale-98 min-h-[48px] cursor-pointer"
				>
					<Calendar strokeWidth={1.75} size={17} />
					<span>{t('consulting.primaryCta')}</span>
				</button>
			{:else}
				<a
					href={data.settings?.contactUrl || '#services'}
					class="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-text-main text-main-bg hover:opacity-90 font-bold text-sm shadow-md transition-all active:scale-98 min-h-[48px]"
				>
					<Calendar strokeWidth={1.75} size={17} />
					<span>{t('consulting.primaryCta')}</span>
				</a>
			{/if}
			<a
				href="#services"
				class="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-surface border border-border-subtle text-text-main hover:bg-soft-bg font-semibold text-sm transition-all active:scale-98 min-h-[48px]"
			>
				<span>{t('consulting.secondaryCta')}</span>
				<ArrowRight strokeWidth={1.75} size={16} />
			</a>
		</div>

		<!-- Trust proof ticker -->
		<div class="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-border-subtle">
			<div class="space-y-1">
				<div class="text-2xl sm:text-3xl font-extrabold text-text-main">10+</div>
				<div class="text-xs text-text-muted font-medium">{t('consulting.pillar1Title')}</div>
			</div>
			<div class="space-y-1">
				<div class="text-2xl sm:text-3xl font-extrabold text-text-main">500+</div>
				<div class="text-xs text-text-muted font-medium">{t('consulting.statsSessions')}</div>
			</div>
			<div class="space-y-1">
				<div class="text-2xl sm:text-3xl font-extrabold text-primary">$0/mo</div>
				<div class="text-xs text-text-muted font-medium">{t('consulting.statsServerCost')}</div>
			</div>
			<div class="space-y-1">
				<div class="text-2xl sm:text-3xl font-extrabold text-emerald-500">100%</div>
				<div class="text-xs text-text-muted font-medium">{t('consulting.statsPrivacy')}</div>
			</div>
		</div>
	</section>

	<!-- Section 1: Trust Pillars (Uy tín & Nền tảng chuyên môn) -->
	<section class="space-y-10 border-t border-border-subtle pt-14">
		<div class="space-y-2 max-w-2xl">
			<div
				class="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-muted"
			>
				<Award strokeWidth={1.75} size={14} class="text-primary" />
				<span>{t('consulting.coreStrengths')}</span>
			</div>
			<h2 class="text-2xl sm:text-4xl font-extrabold text-text-main tracking-tight">
				{t('consulting.trustPillarTitle')}
			</h2>
			<p class="text-sm sm:text-base text-text-muted">
				{t('consulting.trustPillarDesc')}
			</p>
		</div>

		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
			<div
				class="p-6 rounded-2xl bg-surface border border-border-subtle specular-highlight space-y-3 hover:border-border-strong transition-all"
			>
				<div
					class="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold"
				>
					<Award strokeWidth={1.75} size={20} />
				</div>
				<h3 class="font-bold text-text-main text-lg">{t('consulting.pillar1Title')}</h3>
				<p class="text-xs sm:text-sm text-text-body leading-relaxed">
					{t('consulting.pillar1Desc')}
				</p>
			</div>

			<div
				class="p-6 rounded-2xl bg-surface border border-border-subtle specular-highlight space-y-3 hover:border-border-strong transition-all"
			>
				<div
					class="size-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold"
				>
					<ShieldCheck strokeWidth={1.75} size={20} />
				</div>
				<h3 class="font-bold text-text-main text-lg">{t('consulting.pillar2Title')}</h3>
				<p class="text-xs sm:text-sm text-text-body leading-relaxed">
					{t('consulting.pillar2Desc')}
				</p>
			</div>

			<div
				class="p-6 rounded-2xl bg-surface border border-border-subtle specular-highlight space-y-3 hover:border-border-strong transition-all"
			>
				<div
					class="size-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold"
				>
					<Zap strokeWidth={1.75} size={20} />
				</div>
				<h3 class="font-bold text-text-main text-lg">{t('consulting.pillar3Title')}</h3>
				<p class="text-xs sm:text-sm text-text-body leading-relaxed">
					{t('consulting.pillar3Desc')}
				</p>
			</div>

			<div
				class="p-6 rounded-2xl bg-surface border border-border-subtle specular-highlight space-y-3 hover:border-border-strong transition-all"
			>
				<div
					class="size-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold"
				>
					<Users strokeWidth={1.75} size={20} />
				</div>
				<h3 class="font-bold text-text-main text-lg">{t('consulting.pillar4Title')}</h3>
				<p class="text-xs sm:text-sm text-text-body leading-relaxed">
					{t('consulting.pillar4Desc')}
				</p>
			</div>
		</div>
	</section>

	<!-- Section 2: 3 Service Packages (Các gói dịch vụ) -->
	<section id="services" class="space-y-10 border-t border-border-subtle pt-14 scroll-mt-24">
		<div class="space-y-2 max-w-2xl">
			<div
				class="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-muted"
			>
				<Sparkles strokeWidth={1.75} size={14} class="text-primary" />
				<span>{t('consulting.offerings')}</span>
			</div>
			<h2 class="text-2xl sm:text-4xl font-extrabold text-text-main tracking-tight">
				{t('consulting.servicesTitle')}
			</h2>
			<p class="text-sm sm:text-base text-text-muted">
				{t('consulting.servicesDesc')}
			</p>
		</div>

		<div class="grid gap-6 lg:grid-cols-3 items-stretch">
			<!-- Package 1 -->
			<div
				class="p-7 rounded-3xl bg-surface border border-border-subtle specular-highlight flex flex-col justify-between space-y-6 hover:border-border-strong transition-all"
			>
				<div class="space-y-4">
					<span
						class="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-soft-bg text-text-muted border border-border-subtle"
					>
						{t('consulting.auditBadge')}
					</span>
					<h3 class="text-2xl font-bold text-text-main">{t('consulting.service1Title')}</h3>
					<p class="text-sm text-text-body leading-relaxed">{t('consulting.service1Desc')}</p>

					<div class="pt-4 border-t border-border-subtle space-y-2.5">
						<div class="flex items-center gap-2 text-xs sm:text-sm text-text-body">
							<Check size={15} strokeWidth={2.25} class="text-emerald-500 shrink-0" />
							<span>{t('consulting.service1Feature1')}</span>
						</div>
						<div class="flex items-center gap-2 text-xs sm:text-sm text-text-body">
							<Check size={15} strokeWidth={2.25} class="text-emerald-500 shrink-0" />
							<span>{t('consulting.service1Feature2')}</span>
						</div>
						<div class="flex items-center gap-2 text-xs sm:text-sm text-text-body">
							<Check size={15} strokeWidth={2.25} class="text-emerald-500 shrink-0" />
							<span>{t('consulting.service1Feature3')}</span>
						</div>
					</div>
				</div>

				{#if isMaster}
					<button
						type="button"
						onclick={() => openFreeSlotModal('service_audit')}
						class="w-full py-3 px-4 rounded-xl bg-soft-bg hover:bg-surface border border-border-subtle text-text-main font-bold text-xs sm:text-sm transition-all cursor-pointer text-center"
					>
						{t('consulting.auditBtn')}
					</button>
				{:else}
					<a
						href={data.settings?.contactUrl || '#booking'}
						class="w-full py-3 px-4 rounded-xl bg-soft-bg hover:bg-surface border border-border-subtle text-text-main font-bold text-xs sm:text-sm transition-all text-center block"
					>
						{t('consulting.auditBtn')}
					</a>
				{/if}
			</div>

			<!-- Package 2: Flagship / Highlighted -->
			<div
				class="p-7 rounded-3xl bg-surface border-2 border-primary specular-highlight shadow-lg flex flex-col justify-between space-y-6 relative"
			>
				<div class="absolute -top-3.5 left-1/2 -translate-x-1/2">
					<span
						class="px-3.5 py-1 rounded-full text-xs font-extrabold bg-primary text-white shadow-sm uppercase tracking-wider"
					>
						{t('consulting.popularBadge')}
					</span>
				</div>

				<div class="space-y-4 pt-1">
					<span
						class="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20"
					>
						{t('consulting.comprehensiveBadge')}
					</span>
					<h3 class="text-2xl font-bold text-text-main">{t('consulting.service2Title')}</h3>
					<p class="text-sm text-text-body leading-relaxed">{t('consulting.service2Desc')}</p>

					<div class="pt-4 border-t border-border-subtle space-y-2.5">
						<div class="flex items-center gap-2 text-xs sm:text-sm text-text-body">
							<Check size={15} strokeWidth={2.25} class="text-primary shrink-0" />
							<span>{t('consulting.service2Feature1')}</span>
						</div>
						<div class="flex items-center gap-2 text-xs sm:text-sm text-text-body">
							<Check size={15} strokeWidth={2.25} class="text-primary shrink-0" />
							<span>{t('consulting.service2Feature2')}</span>
						</div>
						<div class="flex items-center gap-2 text-xs sm:text-sm text-text-body">
							<Check size={15} strokeWidth={2.25} class="text-primary shrink-0" />
							<span>{t('consulting.service2Feature3')}</span>
						</div>
					</div>
				</div>

				{#if isMaster}
					<button
						type="button"
						onclick={() => openFreeSlotModal('service_flagship')}
						class="w-full py-3 px-4 rounded-xl bg-text-main text-main-bg hover:opacity-90 font-bold text-xs sm:text-sm transition-all cursor-pointer text-center shadow-sm"
					>
						{t('consulting.comprehensiveBtn')}
					</button>
				{:else}
					<a
						href={data.settings?.contactUrl || '#booking'}
						class="w-full py-3 px-4 rounded-xl bg-text-main text-main-bg hover:opacity-90 font-bold text-xs sm:text-sm transition-all text-center shadow-sm block"
					>
						{t('consulting.comprehensiveBtn')}
					</a>
				{/if}
			</div>

			<!-- Package 3 -->
			<div
				class="p-7 rounded-3xl bg-surface border border-border-subtle specular-highlight flex flex-col justify-between space-y-6 hover:border-border-strong transition-all"
			>
				<div class="space-y-4">
					<span
						class="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-soft-bg text-text-muted border border-border-subtle"
					>
						{t('consulting.retainerBadge')}
					</span>
					<h3 class="text-2xl font-bold text-text-main">{t('consulting.service3Title')}</h3>
					<p class="text-sm text-text-body leading-relaxed">{t('consulting.service3Desc')}</p>

					<div class="pt-4 border-t border-border-subtle space-y-2.5">
						<div class="flex items-center gap-2 text-xs sm:text-sm text-text-body">
							<Check size={15} strokeWidth={2.25} class="text-emerald-500 shrink-0" />
							<span>{t('consulting.service3Feature1')}</span>
						</div>
						<div class="flex items-center gap-2 text-xs sm:text-sm text-text-body">
							<Check size={15} strokeWidth={2.25} class="text-emerald-500 shrink-0" />
							<span>{t('consulting.service3Feature2')}</span>
						</div>
						<div class="flex items-center gap-2 text-xs sm:text-sm text-text-body">
							<Check size={15} strokeWidth={2.25} class="text-emerald-500 shrink-0" />
							<span>{t('consulting.service3Feature3')}</span>
						</div>
					</div>
				</div>

				{#if isMaster}
					<button
						type="button"
						onclick={() => openFreeSlotModal('service_retainer')}
						class="w-full py-3 px-4 rounded-xl bg-soft-bg hover:bg-surface border border-border-subtle text-text-main font-bold text-xs sm:text-sm transition-all cursor-pointer text-center"
					>
						{t('consulting.retainerBtn')}
					</button>
				{:else}
					<a
						href={data.settings?.contactUrl || '#booking'}
						class="w-full py-3 px-4 rounded-xl bg-soft-bg hover:bg-surface border border-border-subtle text-text-main font-bold text-xs sm:text-sm transition-all text-center block"
					>
						{t('consulting.retainerBtn')}
					</a>
				{/if}
			</div>
		</div>
	</section>

	<!-- Section 3: Booking & Lead Capture -->
	<section id="booking" class="scroll-mt-24">
		<div
			class="rounded-3xl bg-surface border border-border-subtle specular-highlight p-6 sm:p-10 lg:p-12"
		>
			<div class="grid gap-8 lg:grid-cols-12">
				<div class="lg:col-span-5 space-y-5">
					<div
						class="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-muted"
					>
						<Calendar strokeWidth={1.75} size={14} class="text-primary" />
						<span>{t('consulting.getInTouch')}</span>
					</div>
					<h2
						class="text-2xl sm:text-4xl font-extrabold text-text-main tracking-tight leading-tight"
					>
						{t('consulting.bookingTitle')}
					</h2>
					<p class="text-sm sm:text-base text-text-body leading-relaxed">
						{t('consulting.bookingDesc')}
					</p>

					<div class="space-y-3 pt-4 border-t border-border-subtle">
						<div class="flex items-center gap-2.5 text-xs sm:text-sm text-text-muted">
							<Clock strokeWidth={1.75} size={16} class="text-primary" />
							<span>{t('consulting.sla24h')}</span>
						</div>
						<div class="flex items-center gap-2.5 text-xs sm:text-sm text-text-muted">
							<ShieldCheck strokeWidth={1.75} size={16} class="text-emerald-500" />
							<span>{t('consulting.directExpert')}</span>
						</div>
					</div>
				</div>

				<div
					class="lg:col-span-7 flex flex-col items-start lg:items-center lg:justify-center p-6 sm:p-8 rounded-2xl bg-soft-bg border border-border-subtle h-full"
				>
					<div class="space-y-4 max-w-md text-left lg:text-center w-full">
						<div class="space-y-2">
							<h3 class="text-xl sm:text-2xl font-bold text-text-main">
								{t('consulting.readyHeading')}
							</h3>
							<p class="text-sm text-text-muted">
								{t('consulting.readyDesc')}
							</p>
						</div>

						<div class="pt-2">
							{#if isMaster}
								<button
									type="button"
									onclick={() => openFreeSlotModal('consulting_direct')}
									class="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-text-main text-main-bg hover:opacity-90 font-bold text-sm shadow-md transition-all active:scale-98 min-h-[56px] w-full sm:w-auto cursor-pointer"
								>
									<Calendar strokeWidth={1.75} size={18} />
									<span>{t('consulting.bookingBtn')}</span>
								</button>
							{:else}
								<a
									href={data.settings?.contactUrl ||
										(data.settings?.contactEmail ? `mailto:${data.settings.contactEmail}` : '#')}
									class="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-text-main text-main-bg hover:opacity-90 font-bold text-sm shadow-md transition-all active:scale-98 min-h-[56px] w-full sm:w-auto"
								>
									<Calendar strokeWidth={1.75} size={18} />
									<span>{t('consulting.bookingBtn')}</span>
								</a>
							{/if}
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Section 4: FAQ Accordion (Câu hỏi thường gặp) -->
	<section class="space-y-8 border-t border-border-subtle pt-14">
		<div class="space-y-2 max-w-2xl">
			<div
				class="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-muted"
			>
				<HelpCircle strokeWidth={1.75} size={14} class="text-primary" />
				<span>FAQ</span>
			</div>
			<h2 class="text-2xl sm:text-4xl font-extrabold text-text-main tracking-tight">
				{t('consulting.faqTitle')}
			</h2>
			<p class="text-sm sm:text-base text-text-muted">
				{t('consulting.faqDesc')}
			</p>
		</div>

		<div class="divide-y divide-border-subtle border-y border-border-subtle">
			<!-- Q1 -->
			<div class="py-5">
				<button
					type="button"
					onclick={() => toggleFaq(1)}
					class="w-full flex items-center justify-between gap-4 text-left font-bold text-base sm:text-lg text-text-main cursor-pointer"
				>
					<span>{t('consulting.faq1Q')}</span>
					<ChevronDown
						strokeWidth={1.75}
						size={18}
						class="text-text-muted transition-transform duration-200 {openFaq === 1
							? 'rotate-180'
							: ''}"
					/>
				</button>
				{#if openFaq === 1}
					<div class="pt-3 text-xs sm:text-sm text-text-body leading-relaxed max-w-3xl">
						{t('consulting.faq1A')}
					</div>
				{/if}
			</div>

			<!-- Q2 -->
			<div class="py-5">
				<button
					type="button"
					onclick={() => toggleFaq(2)}
					class="w-full flex items-center justify-between gap-4 text-left font-bold text-base sm:text-lg text-text-main cursor-pointer"
				>
					<span>{t('consulting.faq2Q')}</span>
					<ChevronDown
						strokeWidth={1.75}
						size={18}
						class="text-text-muted transition-transform duration-200 {openFaq === 2
							? 'rotate-180'
							: ''}"
					/>
				</button>
				{#if openFaq === 2}
					<div class="pt-3 text-xs sm:text-sm text-text-body leading-relaxed max-w-3xl">
						{t('consulting.faq2A')}
					</div>
				{/if}
			</div>

			<!-- Q3 -->
			<div class="py-5">
				<button
					type="button"
					onclick={() => toggleFaq(3)}
					class="w-full flex items-center justify-between gap-4 text-left font-bold text-base sm:text-lg text-text-main cursor-pointer"
				>
					<span>{t('consulting.faq3Q')}</span>
					<ChevronDown
						strokeWidth={1.75}
						size={18}
						class="text-text-muted transition-transform duration-200 {openFaq === 3
							? 'rotate-180'
							: ''}"
					/>
				</button>
				{#if openFaq === 3}
					<div class="pt-3 text-xs sm:text-sm text-text-body leading-relaxed max-w-3xl">
						{t('consulting.faq3A')}
					</div>
				{/if}
			</div>
		</div>
	</section>

	<!-- Optional Section 5: Case Studies & Proven Results (Dự án tiêu biểu) -->
	{#if data.settings?.showProjects !== false && data.projects && data.projects.length > 0}
		<section class="space-y-8 border-t border-border-subtle pt-14">
			<div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
				<div class="space-y-1">
					<div
						class="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-muted"
					>
						<Layers strokeWidth={1.75} size={13} class="text-primary" />
						<span>{t('consulting.trackRecord')}</span>
					</div>
					<h2 class="text-2xl sm:text-4xl font-extrabold text-text-main tracking-tight">
						{t('projects.title')}
					</h2>
				</div>
				<a
					href="/projects"
					class="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-text-muted hover:text-primary transition-colors group"
				>
					<span>{t('home.viewAllProjects')} ({data.projects.length})</span>
					<ArrowRight
						strokeWidth={1.75}
						size={14}
						class="group-hover:translate-x-1 transition-transform"
					/>
				</a>
			</div>

			<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each data.projects.slice(0, 3) as project}
					<article
						class="p-6 rounded-3xl bg-surface border border-border-subtle specular-highlight hover:border-border-strong hover:shadow-md transition-all flex flex-col justify-between space-y-4"
					>
						<div class="space-y-2.5">
							<div class="flex items-start justify-between gap-2">
								<h3
									class="font-bold text-text-main text-lg group-hover:text-primary transition-colors"
								>
									{project.title}
								</h3>
								<a
									href={project.link}
									target="_blank"
									rel="noopener noreferrer"
									class="text-text-muted hover:text-primary transition-colors"
								>
									<ArrowUpRight strokeWidth={1.75} size={16} />
								</a>
							</div>
							<p class="text-xs sm:text-sm text-text-body line-clamp-3 leading-relaxed">
								{localized(project, 'description')}
							</p>
						</div>

						<div class="pt-3 border-t border-border-subtle flex flex-wrap gap-1.5">
							{#each (localizedArray(project, 'tags') || project.tags).slice(0, 3) as tag}
								<span
									class="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-soft-bg text-text-muted border border-border-subtle"
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

	<!-- Optional Section 6: Latest Insights (Góc nhìn & Bài viết) -->
	{#if data.settings?.showBlog !== false && data.posts && data.posts.length > 0}
		<section class="space-y-8 border-t border-border-subtle pt-14">
			<div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
				<div class="space-y-1">
					<div
						class="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-muted"
					>
						<BookOpen strokeWidth={1.75} size={13} class="text-primary" />
						<span>{t('blog.title')}</span>
					</div>
					<h2 class="text-2xl sm:text-4xl font-extrabold text-text-main tracking-tight">
						{t('home.latestPostsTitle')}
					</h2>
				</div>
				<a
					href="/blog"
					class="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-text-muted hover:text-primary transition-colors group"
				>
					<span>{t('home.viewAllPosts')} ({data.posts.length})</span>
					<ArrowRight
						strokeWidth={1.75}
						size={14}
						class="group-hover:translate-x-1 transition-transform"
					/>
				</a>
			</div>

			<div class="grid gap-6 md:grid-cols-2">
				{#each data.posts.slice(0, 2) as post}
					<a
						href={`/blog/${post.slug}`}
						class="p-6 rounded-3xl bg-surface border border-border-subtle specular-highlight hover:border-border-strong hover:shadow-md transition-all space-y-3 block group"
					>
						<div class="flex items-center justify-between text-xs text-text-muted">
							<span class="font-semibold text-primary"
								>{post.meta.tags?.[0] ? `#${post.meta.tags[0]}` : 'Insight'}</span
							>
							<span class="flex items-center gap-1"
								><Clock strokeWidth={1.75} size={11} />
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

	<!-- Optional Section 7: Video Practice & Masterclasses -->
	{#if data.settings?.showVideos !== false && data.videos && data.videos.length > 0}
		<section class="space-y-8 border-t border-border-subtle pt-14">
			<div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
				<div class="space-y-1">
					<div
						class="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-muted"
					>
						<PlayCircle strokeWidth={1.75} size={13} class="text-primary" />
						<span>{t('videos.title')}</span>
					</div>
					<h2 class="text-2xl sm:text-4xl font-extrabold text-text-main tracking-tight">
						{t('home.latestVideosTitle')}
					</h2>
				</div>
				<a
					href="/videos"
					class="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-text-muted hover:text-primary transition-colors group"
				>
					<span>{t('home.viewAllVideos')} ({data.videos.length})</span>
					<ArrowRight
						strokeWidth={1.75}
						size={14}
						class="group-hover:translate-x-1 transition-transform"
					/>
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
