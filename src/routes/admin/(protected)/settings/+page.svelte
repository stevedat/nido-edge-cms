<script lang="ts">
	import { enhance } from '$app/forms';
	import { t } from '$lib/i18n/index.js';
	import { Palette, LayoutTemplate, Check, Mail, Phone, Link, Github, Linkedin, Facebook, Youtube, Share2, ShieldCheck, KeyRound, Eye, EyeOff, Lock, Compass, MousePointerClick } from 'lucide-svelte';

	let { data, form } = $props();
	let isSubmitting = $state(false);
	let isPasswordSubmitting = $state(false);
	let showCurrentPassword = $state(false);
	let showNewPassword = $state(false);
	let showConfirmPassword = $state(false);

	let selectedTheme = $state(data.settings?.themePreset || 'apple');
	let selectedLayout = $state(data.settings?.homeLayout || 'editorial');

	const themes = [
		{
			id: 'apple',
			name: 'Apple Minimalist',
			desc: t('admin.settings.themeDescApple'),
			bgLight: '#f8fafc',
			bgDark: '#09090b',
			accent: '#4f46e5',
			badge: t('admin.settings.themeBadgeApple')
		},
		{
			id: 'academic',
			name: 'Editorial & Academic',
			desc: t('admin.settings.themeDescAcademic'),
			bgLight: '#fbf9f5',
			bgDark: '#151311',
			accent: '#b45309',
			badge: t('admin.settings.themeBadgeAcademic')
		},
		{
			id: 'executive',
			name: 'Executive & Finance',
			desc: t('admin.settings.themeDescExecutive'),
			bgLight: '#f6f8fb',
			bgDark: '#0a0e17',
			accent: '#2563eb',
			badge: t('admin.settings.themeBadgeExecutive')
		},
		{
			id: 'wellness',
			name: 'Wellness & Medical',
			desc: t('admin.settings.themeDescWellness'),
			bgLight: '#f7faf8',
			bgDark: '#0c1410',
			accent: '#0d9488',
			badge: t('admin.settings.themeBadgeWellness')
		}
	];

	const layouts = [
		{
			id: 'editorial',
			name: 'Classic Editorial',
			desc: t('admin.settings.layoutDescEditorial'),
			badge: t('admin.settings.layoutBadgeEditorial')
		},
		{
			id: 'one_page_consulting',
			name: 'One-Page Consulting',
			desc: t('admin.settings.layoutDescOnePage'),
			badge: t('admin.settings.layoutBadgeOnePage')
		},
		{
			id: 'bento_portfolio',
			name: 'Bento Grid Portfolio',
			desc: t('admin.settings.layoutDescBento'),
			badge: t('admin.settings.layoutBadgeBento')
		}
	];
</script>

<svelte:head>
	<title>{t('admin.settings.title')} | Admin</title>
</svelte:head>

<div class="mb-8">
	<h1 class="text-3xl font-bold text-text-main">{t('admin.settings.title')}</h1>
	<p class="mt-2 text-text-muted">{t('admin.settings.subtitle')}</p>
</div>

{#if form?.message}
	<div class="mb-6 rounded-xl {form.success ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'} p-4 text-sm font-medium">
		{t(form.message)}
	</div>
{/if}

<form
	method="POST"
	action="?/saveSettings"
	use:enhance={() => {
		isSubmitting = true;
		return async ({ update }) => {
			await update({ reset: false });
			isSubmitting = false;
		};
	}}
	class="rounded-2xl border border-border-subtle bg-surface p-6 sm:p-8 shadow-xs space-y-8"
>
	<!-- Section: Theme Preset Selection -->
	<div class="space-y-4 border-b border-border-subtle pb-8">
		<div class="flex items-center gap-2">
			<Palette strokeWidth={1.75} class="size-5 text-primary" />
			<h2 class="text-lg font-bold text-text-main">{t('admin.settings.themePreset')}</h2>
		</div>
		<p class="text-sm text-text-muted">
			{t('admin.settings.themePresetSubtitle')}
		</p>

		<!-- Hidden input for form submission -->
		<input type="hidden" name="themePreset" value={selectedTheme} />

		<div class="grid gap-4 sm:grid-cols-2">
			{#each themes as theme}
				<button
					type="button"
					onclick={() => selectedTheme = theme.id}
					class="text-left p-4 rounded-xl border-2 transition-all relative cursor-pointer flex flex-col justify-between {selectedTheme === theme.id ? 'border-primary bg-primary/5 shadow-xs' : 'border-border-subtle hover:border-border-strong bg-soft-bg/30'}"
				>
					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<span class="font-bold text-text-main text-sm sm:text-base">{theme.name}</span>
								<span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-soft-bg text-text-muted border border-border-subtle">
									{theme.badge}
								</span>
							</div>
							{#if selectedTheme === theme.id}
								<span class="size-5 rounded-full bg-primary text-white flex items-center justify-center shadow-xs">
									<Check size={13} strokeWidth={3} />
								</span>
							{/if}
						</div>
						<p class="text-xs text-text-muted leading-relaxed">
							{theme.desc}
						</p>
					</div>

					<!-- Swatch preview -->
					<div class="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between">
						<div class="flex items-center gap-1.5">
							<span class="text-[11px] text-text-muted font-medium">{t('admin.settings.palette')}</span>
							<div class="flex items-center gap-1">
								<span class="size-4 rounded-full border border-border-subtle shadow-2xs" style="background-color: {theme.bgLight}" title="{t('admin.settings.bgLight')}"></span>
								<span class="size-4 rounded-full border border-border-subtle shadow-2xs" style="background-color: {theme.bgDark}" title="{t('admin.settings.bgDark')}"></span>
								<span class="size-4 rounded-full shadow-2xs" style="background-color: {theme.accent}" title="{t('admin.settings.accentColor')}"></span>
							</div>
						</div>
						<span class="text-[10px] font-mono uppercase {selectedTheme === theme.id ? 'text-primary font-bold' : 'text-text-muted'}">
							{selectedTheme === theme.id ? t('admin.settings.activeTheme') : t('admin.settings.selectTheme')}
						</span>
					</div>
				</button>
			{/each}
		</div>
	</div>

	<!-- Section: Home Layout Selection -->
	<div class="space-y-4 border-b border-border-subtle pb-8">
		<div class="flex items-center gap-2">
			<LayoutTemplate strokeWidth={1.75} class="size-5 text-primary" />
			<h2 class="text-lg font-bold text-text-main">{t('admin.settings.homeLayout')}</h2>
		</div>
		<p class="text-sm text-text-muted">
			{t('admin.settings.homeLayoutSubtitle')}
		</p>

		<!-- Hidden input for form submission -->
		<input type="hidden" name="homeLayout" value={selectedLayout} />

		<div class="grid gap-4 sm:grid-cols-3">
			{#each layouts as layout}
				<button
					type="button"
					onclick={() => selectedLayout = layout.id}
					class="text-left p-4 rounded-xl border-2 transition-all relative cursor-pointer flex flex-col justify-between {selectedLayout === layout.id ? 'border-primary bg-primary/5 shadow-xs' : 'border-border-subtle hover:border-border-strong bg-soft-bg/30'}"
				>
					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-soft-bg text-text-muted border border-border-subtle">
								{layout.badge}
							</span>
							{#if selectedLayout === layout.id}
								<span class="size-5 rounded-full bg-primary text-white flex items-center justify-center shadow-xs">
									<Check size={13} strokeWidth={3} />
								</span>
							{/if}
						</div>
						<h3 class="font-bold text-text-main text-sm sm:text-base">{layout.name}</h3>
						<p class="text-xs text-text-muted leading-relaxed">
							{layout.desc}
						</p>
					</div>

					<div class="mt-4 pt-3 border-t border-border-subtle flex items-center justify-end">
						<span class="text-[10px] font-mono uppercase {selectedLayout === layout.id ? 'text-primary font-bold' : 'text-text-muted'}">
							{selectedLayout === layout.id ? t('admin.settings.activeLayout') : t('admin.settings.selectLayout')}
						</span>
					</div>
				</button>
			{/each}
		</div>
	</div>

	<div class="grid gap-6 md:grid-cols-2">
		<!-- Header & SEO -->
		<div class="space-y-6 md:col-span-2 border-b border-border-subtle pb-6">
			<h2 class="text-lg font-bold text-text-main">Header & SEO</h2>
			
			<div>
				<label for="siteName" class="block text-sm font-medium text-text-body mb-1.5">{t('admin.settings.headerLogo')}</label>
				<input
					type="text"
					name="siteName"
					value={data.settings?.siteName ?? ''}
					placeholder="{t('admin.settings.placeholderEdgeCms')}"
					class="w-full rounded-xl border border-border-subtle bg-surface px-4 py-2.5 text-text-main placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-colors"
				/>
			</div>

			<div>
				<label for="siteTitle" class="block text-sm font-medium text-text-body mb-1.5">{t('admin.settings.siteTitle')}</label>
				<input
					type="text"
					name="siteTitle"
					value={data.settings?.siteTitle ?? ''}
					placeholder="{t('admin.settings.placeholderEdgeCmsPlatform')}"
					class="w-full rounded-xl border border-border-subtle bg-surface px-4 py-2.5 text-text-main placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-colors"
				/>
			</div>

			<div>
				<label for="siteDescription" class="block text-sm font-medium text-text-body mb-1.5">{t('admin.settings.siteDescription')}</label>
				<textarea
					name="siteDescription"
					rows="2"
					placeholder="{t('admin.settings.placeholderSeoDesc')}"
					class="w-full rounded-xl border border-border-subtle bg-surface px-4 py-2.5 text-text-main placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-colors"
				>{data.settings?.siteDescription ?? ''}</textarea>
			</div>
		</div>

		<!-- Hero Section -->
		<div class="space-y-6 md:col-span-2 border-b border-border-subtle pb-6">
			<h2 class="text-lg font-bold text-text-main">{t('admin.settings.heroSection')}</h2>
			
			<div>
				<label for="heroTitle" class="block text-sm font-medium text-text-body mb-1.5">{t('admin.settings.heroTitle')}</label>
				<input
					type="text"
					name="heroTitle"
					value={data.settings?.heroTitle ?? ''}
					placeholder="{t('admin.settings.placeholderHeroTitle')}"
					class="w-full rounded-xl border border-border-subtle bg-surface px-4 py-2.5 text-text-main placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-colors"
				/>
			</div>

			<div>
				<label for="heroBio" class="block text-sm font-medium text-text-body mb-1.5">{t('admin.settings.heroBio')}</label>
				<textarea
					name="heroBio"
					rows="3"
					placeholder="{t('admin.settings.placeholderHeroBio')}"
					class="w-full rounded-xl border border-border-subtle bg-surface px-4 py-2.5 text-text-main placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-colors"
				>{data.settings?.heroBio ?? ''}</textarea>
			</div>
		</div>

		<!-- Module Visibility -->
		<div class="space-y-6 md:col-span-2 border-b border-border-subtle pb-6">
			<h2 class="text-lg font-bold text-text-main">{t('admin.settings.modules')}</h2>
			<p class="text-sm text-text-muted mb-4">{t('admin.settings.modulesSubtitle')}</p>
			
			<div class="grid gap-4 md:grid-cols-3">
				<label class="flex items-center gap-3 p-4 border border-border-subtle rounded-xl cursor-pointer hover:bg-soft-bg bg-surface transition-colors">
					<input type="checkbox" name="showBlog" checked={data.settings?.showBlog !== false} class="w-5 h-5 rounded border-border-strong text-primary focus:ring-primary cursor-pointer" />
					<div class="font-medium text-text-main">{t('admin.settings.moduleBlog')}</div>
				</label>
				
				<label class="flex items-center gap-3 p-4 border border-border-subtle rounded-xl cursor-pointer hover:bg-soft-bg bg-surface transition-colors">
					<input type="checkbox" name="showVideos" checked={data.settings?.showVideos !== false} class="w-5 h-5 rounded border-border-strong text-primary focus:ring-primary cursor-pointer" />
					<div class="font-medium text-text-main">Video</div>
				</label>

				<label class="flex items-center gap-3 p-4 border border-border-subtle rounded-xl cursor-pointer hover:bg-soft-bg bg-surface transition-colors">
					<input type="checkbox" name="showProjects" checked={data.settings?.showProjects !== false} class="w-5 h-5 rounded border-border-strong text-primary focus:ring-primary cursor-pointer" />
					<div class="font-medium text-text-main">{t('admin.settings.moduleProjects')}</div>
				</label>
			</div>
		</div>

		<!-- Section: Navigation Labels & Header CTA -->
		<div class="space-y-6 md:col-span-2 border-b border-border-subtle pb-6">
			<div class="flex items-center gap-2">
				<Compass strokeWidth={1.75} class="size-5 text-primary" />
				<h2 class="text-lg font-bold text-text-main">{t('admin.settings.navCtaHeader')}</h2>
			</div>
			<p class="text-sm text-text-muted">
				{t('admin.settings.navCtaDesc')}
			</p>

			<!-- Combine Blog & Videos Toggle -->
			<div class="p-4 rounded-xl border border-border-subtle bg-soft-bg/30 space-y-2">
				<label class="flex items-start sm:items-center gap-3 cursor-pointer">
					<input
						type="checkbox"
						name="combineBlogAndVideos"
						checked={data.settings?.combineBlogAndVideos === true}
						class="w-5 h-5 mt-0.5 sm:mt-0 rounded border-border-strong text-primary focus:ring-primary cursor-pointer"
					/>
					<div>
						<span class="font-bold text-sm text-text-main">{t('admin.settings.combineKnowledgeBtn')}</span>
						<p class="text-xs text-text-muted mt-0.5">
							{t('admin.settings.combineKnowledgeDesc')}
						</p>
					</div>
				</label>
			</div>

			<!-- Dynamic Navigation Labels -->
			<div class="space-y-3">
				<h3 class="text-sm font-semibold text-text-main">{t('admin.settings.navLabelsTitle')}</h3>
				<div class="grid gap-4 sm:grid-cols-2">
					<div>
						<label for="navProjectsLabel" class="block text-xs font-medium text-text-body mb-1">{t('admin.settings.navProjectsVi')}</label>
						<input
							type="text"
							id="navProjectsLabel"
							name="navProjectsLabel"
							value={data.settings?.navProjectsLabel ?? ''}
							placeholder="{t('admin.settings.navProjectsViPlaceholder')}"
							class="w-full rounded-xl border border-border-subtle bg-surface px-3.5 py-2 text-text-main placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-colors"
						/>
					</div>
					<div>
						<label for="navProjectsLabel_en" class="block text-xs font-medium text-text-body mb-1">{t('admin.settings.navProjectsEn')}</label>
						<input
							type="text"
							id="navProjectsLabel_en"
							name="navProjectsLabel_en"
							value={data.settings?.navProjectsLabel_en ?? ''}
							placeholder="Default: Projects (or Courses, Services...)"
							class="w-full rounded-xl border border-border-subtle bg-surface px-3.5 py-2 text-text-main placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-colors"
						/>
					</div>

					<div>
						<label for="navBlogLabel" class="block text-xs font-medium text-text-body mb-1">{t('admin.settings.navBlogVi')}</label>
						<input
							type="text"
							id="navBlogLabel"
							name="navBlogLabel"
							value={data.settings?.navBlogLabel ?? ''}
							placeholder="{t('admin.settings.navBlogViPlaceholder')}"
							class="w-full rounded-xl border border-border-subtle bg-surface px-3.5 py-2 text-text-main placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-colors"
						/>
					</div>
					<div>
						<label for="navBlogLabel_en" class="block text-xs font-medium text-text-body mb-1">{t('admin.settings.navBlogEn')}</label>
						<input
							type="text"
							id="navBlogLabel_en"
							name="navBlogLabel_en"
							value={data.settings?.navBlogLabel_en ?? ''}
							placeholder="Default: Blog (or Insights, Knowledge...)"
							class="w-full rounded-xl border border-border-subtle bg-surface px-3.5 py-2 text-text-main placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-colors"
						/>
					</div>

					<div>
						<label for="navVideosLabel" class="block text-xs font-medium text-text-body mb-1">{t('admin.settings.navVideosVi')}</label>
						<input
							type="text"
							id="navVideosLabel"
							name="navVideosLabel"
							value={data.settings?.navVideosLabel ?? ''}
							placeholder="{t('admin.settings.navVideosViPlaceholder')}"
							class="w-full rounded-xl border border-border-subtle bg-surface px-3.5 py-2 text-text-main placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-colors"
						/>
					</div>
					<div>
						<label for="navVideosLabel_en" class="block text-xs font-medium text-text-body mb-1">{t('admin.settings.navVideosEn')}</label>
						<input
							type="text"
							id="navVideosLabel_en"
							name="navVideosLabel_en"
							value={data.settings?.navVideosLabel_en ?? ''}
							placeholder="Default: Videos (or Tutorials...)"
							class="w-full rounded-xl border border-border-subtle bg-surface px-3.5 py-2 text-text-main placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-colors"
						/>
					</div>

					<div>
						<label for="navAboutLabel" class="block text-xs font-medium text-text-body mb-1">{t('admin.settings.navAboutVi')}</label>
						<input
							type="text"
							id="navAboutLabel"
							name="navAboutLabel"
							value={data.settings?.navAboutLabel ?? ''}
							placeholder="{t('admin.settings.navAboutViPlaceholder')}"
							class="w-full rounded-xl border border-border-subtle bg-surface px-3.5 py-2 text-text-main placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-colors"
						/>
					</div>
					<div>
						<label for="navAboutLabel_en" class="block text-xs font-medium text-text-body mb-1">{t('admin.settings.navAboutEn')}</label>
						<input
							type="text"
							id="navAboutLabel_en"
							name="navAboutLabel_en"
							value={data.settings?.navAboutLabel_en ?? ''}
							placeholder="Default: About (or About Us, About Dr. Tam...)"
							class="w-full rounded-xl border border-border-subtle bg-surface px-3.5 py-2 text-text-main placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-colors"
						/>
					</div>
				</div>
			</div>

			<!-- Header CTA Button Settings -->
			<div class="space-y-3 pt-2">
				<div class="flex items-center gap-2">
					<MousePointerClick strokeWidth={1.75} class="size-4 text-primary" />
					<h3 class="text-sm font-semibold text-text-main">{t('admin.settings.ctaTitle')}</h3>
				</div>
				<div class="grid gap-4 sm:grid-cols-3">
					<div>
						<label for="headerCtaText" class="block text-xs font-medium text-text-body mb-1">{t('admin.settings.ctaLabelVi')}</label>
						<input
							type="text"
							id="headerCtaText"
							name="headerCtaText"
							value={data.settings?.headerCtaText ?? ''}
							placeholder="{t('admin.settings.ctaLabelViPlaceholder')}"
							class="w-full rounded-xl border border-border-subtle bg-surface px-3.5 py-2 text-text-main placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-colors"
						/>
					</div>
					<div>
						<label for="headerCtaText_en" class="block text-xs font-medium text-text-body mb-1">{t('admin.settings.ctaLabelEn')}</label>
						<input
							type="text"
							id="headerCtaText_en"
							name="headerCtaText_en"
							value={data.settings?.headerCtaText_en ?? ''}
							placeholder="{t('admin.settings.ctaLabelEnPlaceholder')}"
							class="w-full rounded-xl border border-border-subtle bg-surface px-3.5 py-2 text-text-main placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-colors"
						/>
					</div>
					<div>
						<label for="headerCtaAction" class="block text-xs font-medium text-text-body mb-1">{t('admin.settings.ctaActionType')}</label>
						<select
							id="headerCtaAction"
							name="headerCtaAction"
							class="w-full rounded-xl border border-border-subtle bg-surface px-3.5 py-2 text-text-main focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-colors"
						>
							<option value="modal" selected={data.settings?.headerCtaAction !== 'link'}>{t('admin.settings.ctaActionModal')}</option>
							<option value="link" selected={data.settings?.headerCtaAction === 'link'}>{t('admin.settings.ctaActionLink')}</option>
						</select>
					</div>
					<div class="sm:col-span-3">
						<label for="headerCtaUrl" class="block text-xs font-medium text-text-body mb-1">{t('admin.settings.ctaUrl')}</label>
						<input
							type="text"
							id="headerCtaUrl"
							name="headerCtaUrl"
							value={data.settings?.headerCtaUrl ?? ''}
							placeholder="{t('admin.settings.ctaUrlPlaceholder')}"
							class="w-full rounded-xl border border-border-subtle bg-surface px-3.5 py-2 text-text-main placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-colors"
						/>
					</div>
				</div>
			</div>
		</div>

		<!-- Section: Contact & Social Info -->
		<div class="space-y-6 md:col-span-2 border-b border-border-subtle pb-6">
			<div class="flex items-center gap-2">
				<Share2 strokeWidth={1.75} class="size-5 text-primary" />
				<h2 class="text-lg font-bold text-text-main">{t('admin.settings.contactSocial')}</h2>
			</div>
			<p class="text-sm text-text-muted">
				{t('admin.settings.contactSocialSubtitle')}
			</p>

			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<label for="contactEmail" class="block text-sm font-medium text-text-body mb-1.5">
						<span class="flex items-center gap-1.5">
							<Mail strokeWidth={1.75} class="size-4 text-text-muted" />
							{t('admin.settings.primaryEmail')}
						</span>
					</label>
					<input
						type="email"
						id="contactEmail"
						name="contactEmail"
						value={data.settings?.contactEmail ?? ''}
						placeholder="{t('admin.settings.placeholderEmail')}"
						class="w-full rounded-xl border border-border-subtle bg-surface px-4 py-2.5 text-text-main placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-colors"
					/>
				</div>

				<div>
					<label for="phone" class="block text-sm font-medium text-text-body mb-1.5">
						<span class="flex items-center gap-1.5">
							<Phone strokeWidth={1.75} class="size-4 text-text-muted" />
							{t('admin.settings.phoneHotline')}
						</span>
					</label>
					<input
						type="tel"
						id="phone"
						name="phone"
						value={data.settings?.phone ?? ''}
						placeholder="{t('admin.settings.placeholderPhone')}"
						class="w-full rounded-xl border border-border-subtle bg-surface px-4 py-2.5 text-text-main placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-colors"
					/>
				</div>

				<div>
					<label for="contactUrl" class="block text-sm font-medium text-text-body mb-1.5">
						<span class="flex items-center gap-1.5">
							<Link strokeWidth={1.75} class="size-4 text-text-muted" />
							{t('admin.settings.contactBookingUrl')}
						</span>
					</label>
					<input
						type="text"
						id="contactUrl"
						name="contactUrl"
						value={data.settings?.contactUrl ?? ''}
						placeholder="{t('admin.settings.placeholderContactUrl')}"
						class="w-full rounded-xl border border-border-subtle bg-surface px-4 py-2.5 text-text-main placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-colors"
					/>
				</div>

				<div>
					<label for="githubUrl" class="block text-sm font-medium text-text-body mb-1.5">
						<span class="flex items-center gap-1.5">
							<Github strokeWidth={1.75} class="size-4 text-text-muted" />
							GitHub URL
						</span>
					</label>
					<input
						type="url"
						id="githubUrl"
						name="githubUrl"
						value={data.settings?.githubUrl ?? ''}
						placeholder="{t('admin.settings.placeholderGithub')}"
						class="w-full rounded-xl border border-border-subtle bg-surface px-4 py-2.5 text-text-main placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-colors"
					/>
				</div>

				<div>
					<label for="linkedinUrl" class="block text-sm font-medium text-text-body mb-1.5">
						<span class="flex items-center gap-1.5">
							<Linkedin strokeWidth={1.75} class="size-4 text-text-muted" />
							LinkedIn URL
						</span>
					</label>
					<input
						type="url"
						id="linkedinUrl"
						name="linkedinUrl"
						value={data.settings?.linkedinUrl ?? ''}
						placeholder="{t('admin.settings.placeholderLinkedin')}"
						class="w-full rounded-xl border border-border-subtle bg-surface px-4 py-2.5 text-text-main placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-colors"
					/>
				</div>

				<div>
					<label for="facebookUrl" class="block text-sm font-medium text-text-body mb-1.5">
						<span class="flex items-center gap-1.5">
							<Facebook strokeWidth={1.75} class="size-4 text-text-muted" />
							Facebook URL
						</span>
					</label>
					<input
						type="url"
						id="facebookUrl"
						name="facebookUrl"
						value={data.settings?.facebookUrl ?? ''}
						placeholder="{t('admin.settings.placeholderFacebook')}"
						class="w-full rounded-xl border border-border-subtle bg-surface px-4 py-2.5 text-text-main placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-colors"
					/>
				</div>

				<div class="sm:col-span-2">
					<label for="youtubeUrl" class="block text-sm font-medium text-text-body mb-1.5">
						<span class="flex items-center gap-1.5">
							<Youtube strokeWidth={1.75} class="size-4 text-text-muted" />
							YouTube Channel URL
						</span>
					</label>
					<input
						type="url"
						id="youtubeUrl"
						name="youtubeUrl"
						value={data.settings?.youtubeUrl ?? ''}
						placeholder="{t('admin.settings.placeholderYoutube')}"
						class="w-full rounded-xl border border-border-subtle bg-surface px-4 py-2.5 text-text-main placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-colors"
					/>
				</div>
			</div>
		</div>

		<!-- Footer -->
		<div class="space-y-6 md:col-span-2">
			<h2 class="text-lg font-bold text-text-main">Footer</h2>
			
			<div>
				<label for="footerCopyright" class="block text-sm font-medium text-text-body mb-1.5">{t('admin.settings.copyright')}</label>
				<div class="flex items-center gap-2 text-sm text-text-muted">
					<span>© {new Date().getFullYear()}</span>
					<input
						type="text"
						name="footerCopyright"
						value={data.settings?.footerCopyright ?? ''}
						placeholder="{t('admin.settings.placeholderFooter')}"
						class="flex-1 rounded-xl border border-border-subtle bg-surface px-4 py-2.5 text-text-main placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-colors"
					/>
					<span>. All rights reserved.</span>
				</div>
			</div>
		</div>
	</div>

	<div class="mt-8 flex justify-end gap-3 pt-6 border-t border-border-subtle">
		<button
			type="submit"
			disabled={isSubmitting}
			class="inline-flex justify-center rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-xs hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 transition-all cursor-pointer"
		>
			{isSubmitting ? t('admin.settings.savingSettings') : t('admin.settings.saveSettings')}
		</button>
	</div>
</form>

<!-- Section: {t('admin.settings.securityTitle')} (Tenant Password Management) -->
<form
	method="POST"
	action="?/updatePassword"
	use:enhance={() => {
		isPasswordSubmitting = true;
		return async ({ update }) => {
			await update({ reset: false });
			isPasswordSubmitting = false;
		};
	}}
	class="rounded-2xl border border-border-subtle bg-surface p-6 sm:p-8 shadow-xs space-y-6 mt-8"
>
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-6">
		<div class="space-y-1">
			<div class="flex items-center gap-2">
				<ShieldCheck strokeWidth={1.75} class="size-5 text-primary" />
				<h2 class="text-lg font-bold text-text-main">{t('admin.settings.securityTitle')}</h2>
			</div>
			<p class="text-sm text-text-muted">
				{t('admin.settings.securityDesc', { siteName: data.settings?.siteName || 'Tenant' })}
			</p>
		</div>
		<div class="shrink-0">
			{#if data.hasCustomPassword}
				<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
					<Check size={13} strokeWidth={3} />
					<span>{t('admin.settings.securityCustomActive')}</span>
				</span>
			{:else}
				<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
					<Lock strokeWidth={1.75} size={13} />
					<span>{t('admin.settings.securityDefaultActive')}</span>
				</span>
			{/if}
		</div>
	</div>

	{#if form?.passwordMessage}
		<div class="rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-4 text-sm font-medium">
			{t(form.passwordMessage)}
		</div>
	{/if}

	{#if form?.passwordError}
		<div class="rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 text-sm font-medium">
			{t(form.passwordError)}
		</div>
	{/if}

	<div class="grid gap-6 sm:grid-cols-3">
		<!-- Current Password -->
		<div>
			<label for="currentPassword" class="block text-sm font-medium text-text-body mb-1.5">
				{t('admin.settings.currentPassword')}
			</label>
			<div class="relative">
				<input
					type={showCurrentPassword ? 'text' : 'password'}
					id="currentPassword"
					name="currentPassword"
					required
					placeholder="••••••••"
					class="w-full rounded-xl border border-border-subtle bg-surface px-4 py-2.5 pr-10 text-text-main placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-colors"
				/>
				<button
					type="button"
					onclick={() => showCurrentPassword = !showCurrentPassword}
					class="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted hover:text-text-main transition-colors cursor-pointer"
					aria-label={showCurrentPassword ? t('admin.settings.hidePassword') : t('admin.settings.showPassword')}
				>
					{#if showCurrentPassword}
						<EyeOff strokeWidth={1.75} size={16} />
					{:else}
						<Eye strokeWidth={1.75} size={16} />
					{/if}
				</button>
			</div>
		</div>

		<!-- New Password -->
		<div>
			<label for="newPassword" class="block text-sm font-medium text-text-body mb-1.5">
				{t('admin.settings.newPassword')}
			</label>
			<div class="relative">
				<input
					type={showNewPassword ? 'text' : 'password'}
					id="newPassword"
					name="newPassword"
					required
					minlength="6"
					placeholder="••••••••"
					class="w-full rounded-xl border border-border-subtle bg-surface px-4 py-2.5 pr-10 text-text-main placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-colors"
				/>
				<button
					type="button"
					onclick={() => showNewPassword = !showNewPassword}
					class="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted hover:text-text-main transition-colors cursor-pointer"
					aria-label={showNewPassword ? t('admin.settings.hidePassword') : t('admin.settings.showPassword')}
				>
					{#if showNewPassword}
						<EyeOff strokeWidth={1.75} size={16} />
					{:else}
						<Eye strokeWidth={1.75} size={16} />
					{/if}
				</button>
			</div>
		</div>

		<!-- Confirm New Password -->
		<div>
			<label for="confirmPassword" class="block text-sm font-medium text-text-body mb-1.5">
				{t('admin.settings.confirmPassword')}
			</label>
			<div class="relative">
				<input
					type={showConfirmPassword ? 'text' : 'password'}
					id="confirmPassword"
					name="confirmPassword"
					required
					minlength="6"
					placeholder="••••••••"
					class="w-full rounded-xl border border-border-subtle bg-surface px-4 py-2.5 pr-10 text-text-main placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-colors"
				/>
				<button
					type="button"
					onclick={() => showConfirmPassword = !showConfirmPassword}
					class="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted hover:text-text-main transition-colors cursor-pointer"
					aria-label={showConfirmPassword ? t('admin.settings.hidePassword') : t('admin.settings.showPassword')}
				>
					{#if showConfirmPassword}
						<EyeOff strokeWidth={1.75} size={16} />
					{:else}
						<Eye strokeWidth={1.75} size={16} />
					{/if}
				</button>
			</div>
		</div>
	</div>

	<div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pt-4 border-t border-border-subtle">
		<p class="text-xs text-text-muted">
			{t('admin.settings.masterAdminHint')}
		</p>
		<button
			type="submit"
			disabled={isPasswordSubmitting}
			class="inline-flex items-center gap-2 justify-center rounded-xl bg-text-main text-main-bg px-6 py-2.5 text-sm font-bold shadow-xs hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 transition-all cursor-pointer shrink-0"
		>
			<KeyRound strokeWidth={1.75} size={15} />
			<span>{isPasswordSubmitting ? t('admin.settings.updating') : t('admin.settings.changePassword')}</span>
		</button>
	</div>
</form>
