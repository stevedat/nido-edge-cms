<script lang="ts">
	import { enhance } from '$app/forms';
	import { 
		Globe, Plus, ExternalLink, Layers, FileText, Briefcase, Video, Users, 
		LayoutTemplate, Palette, Sliders, KeyRound, Copy, Check, 
		Eye, EyeOff, ShieldCheck, Lock, RotateCcw, Info
	} from 'lucide-svelte';
	import { t } from '$lib/i18n/index.js';
	import Dialog from '$lib/components/ui/Dialog.svelte';

	let { data, form } = $props();
	let isSubmitting = $state(false);
	let newDomainInput = $state('');
	let selectedLayout = $state('editorial');
	let selectedTheme = $state('apple');
	let showCreatePassword = $state(false);
	let createPasswordInput = $state('');
	let copied = $state(false);
	let resetModalDomain = $state<string | null>(null);
	let isResetting = $state(false);

	const layouts = [
		{ id: 'editorial', label: 'Classic Editorial', desc: t('admin.tenants.layout.editorial.desc', { defaultValue: 'Article & Project Timeline' }) },
		{ id: 'one_page_consulting', label: 'One-Page Consulting', desc: t('admin.tenants.layout.onePageConsulting.desc', { defaultValue: 'Service Landing Page & Pricing' }) },
		{ id: 'bento_portfolio', label: 'Bento Portfolio', desc: t('admin.tenants.layout.bentoPortfolio.desc', { defaultValue: 'Bento Grid & Visual Stats' }) }
	];

	const themes = [
		{ id: 'apple', label: 'Apple Minimalist', color: '#4f46e5' },
		{ id: 'academic', label: 'Editorial & Academic', color: '#b45309' },
		{ id: 'executive', label: 'Executive & Finance', color: '#2563eb' },
		{ id: 'wellness', label: 'Wellness & Medical', color: '#0d9488' }
	];

	async function copyToClipboard(text: string) {
		try {
			await navigator.clipboard.writeText(text);
			copied = true;
			setTimeout(() => { copied = false; }, 2500);
		} catch (err) {
			console.error('Failed to copy', err);
		}
	}
</script>

<svelte:head>
	<title>{t('admin.tenants.title', { defaultValue: 'Tenant Management | Admin' })}</title>
</svelte:head>

<div class="mb-8 space-y-2">
	<div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase">
		<Globe strokeWidth={1.75} size={14} />
		<span>Multi-Tenant Architecture</span>
	</div>
	<h1 class="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">{t('admin.tenants.heading', { defaultValue: 'Tenant Management' })}</h1>
	<p class="text-xs sm:text-sm text-text-muted">{t('admin.tenants.description', { defaultValue: 'Manage independent digital spaces and configure separate domain modules on Edge CMS.' })}</p>
</div>

<!-- Thẻ Educational Banner giải thích cơ chế -->
<div class="mb-8 p-6 rounded-3xl bg-soft-bg border border-border-subtle shadow-sm space-y-4">
	<div class="flex items-center gap-3 mb-2">
		<div class="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
			<Info strokeWidth={1.75} size={20} />
		</div>
		<div>
			<h2 class="text-sm font-extrabold text-text-main">{t('admin.tenants.banner.title', { defaultValue: 'How Tenants Work' })}</h2>
			<p class="text-xs text-text-muted">{t('admin.tenants.banner.subtitle', { defaultValue: 'How the system isolates digital spaces' })}</p>
		</div>
	</div>
	<div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
		<div class="p-4 rounded-2xl bg-surface border border-border-subtle hover:border-border-strong transition-colors space-y-2">
			<Layers strokeWidth={1.75} size={18} class="text-indigo-500" />
			<h3 class="font-bold text-text-main text-xs">{t('admin.tenants.banner.point1.title', { defaultValue: '1. Data Isolation (Silo)' })}</h3>
			<p class="text-xs text-text-muted">{t('admin.tenants.banner.point1.desc', { defaultValue: 'Each tenant is like a separate apartment. Data (articles, configurations) is stored in its own directory, without any overlap.' })}</p>
		</div>
		<div class="p-4 rounded-2xl bg-surface border border-border-subtle hover:border-border-strong transition-colors space-y-2">
			<Palette strokeWidth={1.75} size={18} class="text-emerald-500" />
			<h3 class="font-bold text-text-main text-xs">{t('admin.tenants.banner.point2.title', { defaultValue: '2. Interface Sovereignty' })}</h3>
			<p class="text-xs text-text-muted">{t('admin.tenants.banner.point2.desc', { defaultValue: 'Clients can choose their Theme (colors) and Layout independently of the Master website, retaining their own brand identity.' })}</p>
		</div>
		<div class="p-4 rounded-2xl bg-surface border border-border-subtle hover:border-border-strong transition-colors space-y-2">
			<Lock strokeWidth={1.75} size={18} class="text-rose-500" />
			<h3 class="font-bold text-text-main text-xs">{t('admin.tenants.banner.point3.title', { defaultValue: '3. Account Security' })}</h3>
			<p class="text-xs text-text-muted">{t('admin.tenants.banner.point3.desc', { defaultValue: 'A tenant admin account only manages that specific tenant. Only you (Master Admin) have the right to create and delete spaces.' })}</p>
		</div>
	</div>
</div>


<!-- Banner thông báo kết quả {t('admin.tenants.createBtn', { defaultValue: 'Create New Tenant' })} có Mật khẩu bàn giao -->
{#if form?.success && form.initialPassword}
	<div class="mb-8 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6 space-y-4 shadow-sm">
		<div class="flex items-start justify-between gap-4">
			<div class="flex items-center gap-3">
				<div class="size-10 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
					<ShieldCheck strokeWidth={1.75} size={22} />
				</div>
				<div>
					<h3 class="font-extrabold text-emerald-700 dark:text-emerald-300 text-base">{t('admin.tenants.createSuccess', { defaultValue: 'Tenant Created Successfully & Handover Info' })}</h3>
					<p class="text-xs text-emerald-600/90 dark:text-emerald-400/90">{t('admin.tenants.createSuccessDesc', { defaultValue: 'Copy this information to send to the client/partner who owns the digital space.' })}</p>
				</div>
			</div>
			<button
				type="button"
				onclick={() => copyToClipboard(t('admin.tenants.handoverText', { domain: form.newDomain, password: form.initialPassword, defaultValue: `Website Handover Info (${form.newDomain}):\n- Homepage: https://${form.newDomain}\n- Admin link: https://${form.newDomain}/admin/login\n- Username: admin\n- Password: ${form.initialPassword}` }))}
				class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
			>
				{#if copied}
					<Check strokeWidth={2.25} size={14} />
					<span>{t('admin.tenants.copied', { defaultValue: 'Copied!' })}</span>
				{:else}
					<Copy strokeWidth={1.75} size={14} />
					<span>{t('admin.tenants.copyHandover', { defaultValue: 'Copy Handover Info' })}</span>
				{/if}
			</button>
		</div>

		<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 pt-2 border-t border-emerald-500/20 text-xs">
			<div class="rounded-xl bg-surface/80 p-3 border border-border-subtle space-y-1">
				<span class="text-[11px] text-text-muted font-medium">{t('admin.tenants.domain', { defaultValue: 'Domain' })}</span>
				<p class="font-bold text-text-main truncate">{form.newDomain}</p>
			</div>
			<div class="rounded-xl bg-surface/80 p-3 border border-border-subtle space-y-1">
				<span class="text-[11px] text-text-muted font-medium">{t('admin.tenants.loginLink', { defaultValue: 'Login Link' })}</span>
				<a href="/admin/login" target="_blank" class="font-bold text-primary flex items-center gap-1 hover:underline truncate">
					<span>/admin/login</span>
					<ExternalLink strokeWidth={1.75} size={12} />
				</a>
			</div>
			<div class="rounded-xl bg-surface/80 p-3 border border-border-subtle space-y-1">
				<span class="text-[11px] text-text-muted font-medium">{t('admin.tenants.account', { defaultValue: 'Account' })}</span>
				<p class="font-mono font-bold text-text-main">admin</p>
			</div>
			<div class="rounded-xl bg-surface/80 p-3 border border-border-subtle space-y-1">
				<div class="flex items-center justify-between">
					<span class="text-[11px] text-text-muted font-medium">{t('admin.tenants.password', { defaultValue: 'Password' })}</span>
					<button 
						type="button" 
						onclick={() => copyToClipboard(form.initialPassword)}
						class="text-[10px] text-primary hover:underline font-bold cursor-pointer"
					>
						Copy
					</button>
				</div>
				<p class="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm tracking-wide select-all">{form.initialPassword}</p>
			</div>
		</div>
	</div>
{:else if form?.resetSuccess}
	<div class="mb-8 rounded-3xl border border-primary/30 bg-primary/10 p-6 space-y-3 shadow-sm">
		<div class="flex items-start justify-between gap-4">
			<div class="flex items-center gap-3">
				<div class="size-10 rounded-2xl bg-primary/20 text-primary flex items-center justify-center font-bold">
					<KeyRound strokeWidth={1.75} size={20} />
				</div>
				<div>
					<h3 class="font-extrabold text-primary text-base">{t('admin.tenants.resetSuccess', { defaultValue: 'Password Reset for' })} {form.resetDomain}</h3>
					<p class="text-xs text-text-muted">{t('admin.tenants.resetSuccessDesc', { defaultValue: 'The new password has been updated and is ready for handover.' })}</p>
				</div>
			</div>
			<button
				type="button"
				onclick={() => copyToClipboard(form.resetPassword)}
				class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:opacity-90 text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
			>
				{#if copied}
					<Check strokeWidth={2.25} size={14} />
					<span>{t('admin.tenants.copiedShort', { defaultValue: 'Copied!' })}</span>
				{:else}
					<Copy strokeWidth={1.75} size={14} />
					<span>{t('admin.tenants.copyPassword', { defaultValue: 'Copy Password' })}</span>
				{/if}
			</button>
		</div>
		<div class="flex items-center gap-3 text-xs">
			<span class="text-text-muted">{t('admin.tenants.newPasswordLabel', { defaultValue: 'New Password:' })}</span>
			<code class="font-mono font-bold text-sm bg-surface px-3 py-1 rounded-lg border border-border-subtle text-text-main select-all">{form.resetPassword}</code>
		</div>
	</div>
{:else if form?.message}
	<div class="mb-6 rounded-2xl {form.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'} border p-4 text-xs sm:text-sm font-semibold flex items-center justify-between gap-3">
		<span>{form.message}</span>
		{#if form.success && form.newDomain}
			<a
				href="/?tenant={form.newDomain}"
				target="_blank"
				class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary text-white text-xs font-bold hover:opacity-90 transition-all shrink-0"
			>
				<span>{t('admin.tenants.viewNow', { defaultValue: 'View Now' })}</span>
				<ExternalLink strokeWidth={1.75} size={13} />
			</a>
		{/if}
	</div>
{/if}

<div class="grid gap-8 lg:grid-cols-3">
	<!-- Form Tạo Tenant Mới -->
	<div class="lg:col-span-1">
		<form
			method="POST"
			action="?/createTenant"
			use:enhance={() => {
				isSubmitting = true;
				return async ({ update, result }) => {
					await update({ reset: true });
					isSubmitting = false;
					if (result.type === 'success') {
						newDomainInput = '';
						createPasswordInput = '';
					}
				};
			}}
			class="rounded-3xl border border-border-subtle bg-surface p-6 shadow-xs space-y-5 sticky top-24"
		>
			<div class="space-y-1">
				<h2 class="text-lg font-bold text-text-main">{t('admin.tenants.createNew', { defaultValue: 'Create New Tenant' })}</h2>
				<p class="text-xs text-text-muted">{t('admin.tenants.createNewDesc', { defaultValue: 'Automatically initialize independent storage directory and sample data.' })}</p>
			</div>

			<div class="space-y-4">
				<!-- Tên miền -->
				<div>
					<label for="domain" class="block text-xs font-bold text-text-main mb-1.5">{t('admin.tenants.domainLabel', { defaultValue: 'Domain or Identifier *' })}</label>
					<input 
						id="domain"
						type="text"
						name="domain"
						bind:value={newDomainInput}
						placeholder={t('admin.tenants.domainPlaceholder', { defaultValue: 'Example: mybrand.com or client1' })}
						required
						class="w-full rounded-xl bg-soft-bg border border-border-subtle px-3.5 py-2.5 text-text-main placeholder:text-text-muted focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm transition-colors"
					/>
				</div>

				<!-- Mật khẩu Quản trị Ban đầu -->
				<div>
					<div class="flex items-center justify-between mb-1.5">
						<div class="flex items-center gap-1.5">
							<KeyRound strokeWidth={1.75} size={13} class="text-primary" />
							<label for="adminPassword" class="text-xs font-bold text-text-main">{t('admin.tenants.adminPasswordLabel', { defaultValue: 'Admin Password' })}</label>
						</div>
						<span class="text-[10px] text-text-muted">{t('admin.tenants.optional', { defaultValue: 'Optional' })}</span>
					</div>
					<div class="relative">
						<input 
							id="adminPassword"
							type={showCreatePassword ? 'text' : 'password'}
							name="adminPassword"
							bind:value={createPasswordInput}
							placeholder={t('admin.tenants.adminPasswordPlaceholder', { defaultValue: 'Leave blank to auto-generate (10 chars)' })}
							class="w-full rounded-xl bg-soft-bg border border-border-subtle px-3.5 py-2.5 pr-10 text-text-main placeholder:text-text-muted focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm transition-colors"
						/>
						<button
							type="button"
							onclick={() => showCreatePassword = !showCreatePassword}
							class="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted hover:text-text-main transition-colors cursor-pointer"
							aria-label={showCreatePassword ? t('admin.tenants.hidePassword', { defaultValue: 'Hide Password' }) : t('admin.tenants.showPassword', { defaultValue: 'Show Password' })}
						>
							{#if showCreatePassword}
								<EyeOff strokeWidth={1.75} size={15} />
							{:else}
								<Eye strokeWidth={1.75} size={15} />
							{/if}
						</button>
					</div>
					<p class="text-[10px] text-text-muted mt-1">
						{t('admin.tenants.passwordDesc', { defaultValue: 'Clients can change this password after handover via the Settings page.' })}
					</p>
				</div>

				<!-- Lựa chọn Kiến trúc Trang chủ (Home Layout) -->
				<div>
					<div class="flex items-center gap-1.5 mb-1.5">
						<LayoutTemplate strokeWidth={1.75} size={13} class="text-primary" />
						<label for="homeLayout" class="text-xs font-bold text-text-main">{t('admin.tenants.homeLayoutLabel', { defaultValue: 'Home Architecture (Layout)' })}</label>
					</div>
					<input type="hidden" name="homeLayout" value={selectedLayout} />
					<div class="space-y-1.5">
						{#each layouts as l}
							<button
								type="button"
								onclick={() => selectedLayout = l.id}
								class="w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex flex-col gap-0.5 {selectedLayout === l.id ? 'border-primary bg-primary/5 text-text-main font-semibold shadow-2xs' : 'border-border-subtle bg-soft-bg/30 text-text-muted hover:border-border-strong'}"
							>
								<div class="flex items-center justify-between">
									<span class="text-xs font-bold">{l.label}</span>
									{#if selectedLayout === l.id}
										<div class="size-1.5 rounded-full bg-primary"></div>
									{/if}
								</div>
								<span class="text-[10px] text-text-muted">{l.desc}</span>
							</button>
						{/each}
					</div>
				</div>

				<!-- Lựa chọn Phong cách Màu (Theme Preset) -->
				<div>
					<div class="flex items-center gap-1.5 mb-1.5">
						<Palette strokeWidth={1.75} size={13} class="text-primary" />
						<label for="themePreset" class="text-xs font-bold text-text-main">{t('admin.tenants.theme', { defaultValue: 'Theme' })}</label>
					</div>
					<input type="hidden" name="themePreset" value={selectedTheme} />
					<div class="grid grid-cols-2 gap-1.5">
						{#each themes as t}
							<button
								type="button"
								onclick={() => selectedTheme = t.id}
								class="p-2 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center gap-2 {selectedTheme === t.id ? 'border-primary bg-primary/5 text-text-main font-semibold' : 'border-border-subtle bg-soft-bg/30 text-text-muted hover:border-border-strong'}"
							>
								<span class="size-3 rounded-full shrink-0 shadow-2xs" style="background-color: {t.color}"></span>
								<span class="text-[11px] truncate">{t.label.split(' ')[0]}</span>
							</button>
						{/each}
					</div>
				</div>

				<!-- Lựa chọn Hiển thị Phân hệ (Module Visibility) -->
				<div>
					<div class="flex items-center gap-1.5 mb-1.5">
						<Sliders strokeWidth={1.75} size={13} class="text-primary" />
						<span class="text-xs font-bold text-text-main">{t('admin.tenants.modulesLabel', { defaultValue: 'Module Visibility' })}</span>
					</div>
					<div class="grid grid-cols-3 gap-1.5">
						<label class="p-2 rounded-xl border border-border-subtle bg-soft-bg/30 flex items-center gap-1.5 cursor-pointer text-xs hover:border-border-strong transition-colors">
							<input type="checkbox" name="showBlog" value="true" checked class="rounded border-border-strong text-primary size-3.5" />
							<span class="text-[11px] font-medium text-text-main">{t('admin.tenants.moduleBlog', { defaultValue: 'Blog' })}</span>
						</label>
						<label class="p-2 rounded-xl border border-border-subtle bg-soft-bg/30 flex items-center gap-1.5 cursor-pointer text-xs hover:border-border-strong transition-colors">
							<input type="checkbox" name="showProjects" value="true" checked class="rounded border-border-strong text-primary size-3.5" />
							<span class="text-[11px] font-medium text-text-main">{t('admin.tenants.moduleProjects', { defaultValue: 'Projects' })}</span>
						</label>
						<label class="p-2 rounded-xl border border-border-subtle bg-soft-bg/30 flex items-center gap-1.5 cursor-pointer text-xs hover:border-border-strong transition-colors">
							<input type="checkbox" name="showVideos" value="true" checked class="rounded border-border-strong text-primary size-3.5" />
							<span class="text-[11px] font-medium text-text-main">{t('admin.tenants.moduleVideos', { defaultValue: 'Video' })}</span>
						</label>
					</div>
				</div>

				<div class="pt-2">
					<button
						type="submit"
						disabled={isSubmitting || !newDomainInput.trim()}
						class="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:opacity-90 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
					>
						<Plus strokeWidth={1.75} size={16} />
						<span>{isSubmitting ? t('admin.tenants.initializing', { defaultValue: 'Initializing...' }) : t('admin.tenants.initializeBtn', { defaultValue: 'Initialize Tenant' })}</span>
					</button>
				</div>
			</div>
		</form>
	</div>

	<!-- Danh sách các Tenant hiện có -->
	<div class="lg:col-span-2 space-y-4">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<Layers strokeWidth={1.75} size={18} class="text-primary" />
				<h2 class="text-lg font-bold text-text-main">{t('admin.tenants.activeList', { defaultValue: 'Active Tenants List' })} ({data?.tenants?.length || 0})</h2>
			</div>
		</div>

		<div class="space-y-3">
			{#if data?.tenants && data.tenants.length > 0}
				{#each data.tenants as tenant}
					<div class="rounded-2xl border border-border-subtle bg-surface p-5 shadow-2xs hover:border-border-strong transition-all">
						<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
							<div class="space-y-1">
								<div class="flex items-center gap-2 flex-wrap">
									<h3 class="font-bold text-text-main text-base">{tenant.domain}</h3>
									{#if tenant.isDefault}
										<span class="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
											<Check size={11} strokeWidth={2.25} />
											<span>{t('admin.tenants.defaultRoot', { defaultValue: 'Default (Root)' })}</span>
										</span>
									{:else}
										<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-soft-bg text-text-muted border border-border-subtle">
											{t('admin.tenants.independentTenant', { defaultValue: 'Independent Tenant' })}
										</span>
									{/if}

									<!-- Password badge -->
									{#if tenant.hasCustomPassword}
										<span class="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" title={t('admin.tenants.hasCustomPasswordTitle', { defaultValue: 'Has custom admin password' })}>
											<KeyRound strokeWidth={1.75} size={10} />
											<span>{t('admin.tenants.hasCustomPassword', { defaultValue: 'Custom Password' })}</span>
										</span>
									{:else}
										<span class="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" title={t('admin.tenants.usesMasterPasswordTitle', { defaultValue: 'No custom password, uses Master Admin password' })}>
											<Lock strokeWidth={1.75} size={10} />
											<span>{t('admin.tenants.usesMasterPassword', { defaultValue: 'Uses Master PW' })}</span>
										</span>
									{/if}

									<span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold">
										{tenant.themePreset}
									</span>
									<span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-soft-bg text-text-muted border border-border-subtle font-semibold">
										{tenant.homeLayout}
									</span>
								</div>
								{#if tenant.siteTitle}
									<p class="text-xs text-text-muted truncate max-w-md">{tenant.siteTitle}</p>
								{/if}
							</div>

							<!-- Action Buttons -->
							<div class="flex items-center gap-2 shrink-0">
								{#if !tenant.isDefault}
									<button
										type="button"
										onclick={() => resetModalDomain = tenant.domain}
										class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-soft-bg hover:bg-surface border border-border-subtle text-text-main text-xs font-semibold transition-all shadow-2xs cursor-pointer"
										title={t('admin.tenants.resetPasswordTitle', { defaultValue: 'Reset password for this tenant' })}
									>
										<KeyRound strokeWidth={1.75} size={13} class="text-text-muted" />
										<span>{t('admin.tenants.resetPasswordShort', { defaultValue: 'Reset PW' })}</span>
									</button>
								{/if}
								<a
									href={tenant.isDefault ? '/' : `/?tenant=${tenant.domain}`}
									target="_blank"
									class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-soft-bg hover:bg-surface border border-border-subtle text-text-main text-xs font-semibold transition-all shadow-2xs"
								>
									<span>{t('admin.tenants.viewGuest', { defaultValue: 'View Guest' })}</span>
									<ExternalLink strokeWidth={1.75} size={13} class="text-text-muted" />
								</a>
							</div>
						</div>

						<!-- Mini Stats Row -->
						<div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-border-subtle text-xs text-text-muted">
							<div class="flex items-center gap-1.5">
								<FileText strokeWidth={1.75} size={13} class="text-text-muted" />
								<span><strong>{tenant.postsCount}</strong> {t('admin.tenants.postsCount', { defaultValue: 'posts' })}</span>
							</div>
							<div class="flex items-center gap-1.5">
								<Briefcase strokeWidth={1.75} size={13} class="text-text-muted" />
								<span><strong>{tenant.projectsCount}</strong> {t('admin.tenants.projectsCount', { defaultValue: 'projects' })}</span>
							</div>
							<div class="flex items-center gap-1.5">
								<Video strokeWidth={1.75} size={13} class="text-text-muted" />
								<span><strong>{tenant.videosCount}</strong> {t('admin.tenants.videosCount', { defaultValue: 'videos' })}</span>
							</div>
							<div class="flex items-center gap-1.5">
								<Users strokeWidth={1.75} size={13} class="text-text-muted" />
								<span><strong>{tenant.leadsCount}</strong> {t('admin.tenants.leadsCount', { defaultValue: 'leads' })}</span>
							</div>
						</div>
					</div>
				{/each}
			{:else}
				<div class="rounded-2xl border border-dashed border-border-subtle p-8 text-center text-text-muted text-xs">
					{t('admin.tenants.noTenants', { defaultValue: 'No tenants other than default.' })}
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Modal Đặt lại Mật khẩu cho Tenant -->
<Dialog
	open={!!resetModalDomain}
	title={t('admin.dialog.resetPasswordTitle')}
	description={resetModalDomain || ''}
	size="md"
	preventClose={isResetting}
	showCloseButton={!isResetting}
	onclose={() => { if (!isResetting) resetModalDomain = null; }}
>
	{#snippet icon()}
		<div class="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
			<KeyRound strokeWidth={1.75} size={20} />
		</div>
	{/snippet}

	<p class="text-xs text-text-muted leading-relaxed">
		{t('admin.dialog.resetPasswordDesc')}
	</p>

	<form
		method="POST"
		action="?/resetPassword"
		use:enhance={() => {
			isResetting = true;
			return async ({ update }) => {
				await update();
				isResetting = false;
				resetModalDomain = null;
			};
		}}
		class="space-y-4"
	>
		<input type="hidden" name="domain" value={resetModalDomain} />
		
		<div class="space-y-1.5">
			<label for="modalNewPassword" class="block text-xs font-bold text-text-main">
				{t('admin.dialog.newPasswordLabel')}
			</label>
			<input
				id="modalNewPassword"
				type="text"
				name="newPassword"
				placeholder={t('admin.dialog.newPasswordPlaceholder')}
				class="w-full rounded-xl bg-soft-bg border border-border-subtle px-4 py-2.5 text-text-main placeholder:text-text-muted focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 text-base sm:text-sm"
			/>
		</div>

		<div class="flex items-center justify-end gap-3 pt-2">
			<button
				type="button"
				onclick={() => resetModalDomain = null}
				disabled={isResetting}
				class="flex-1 sm:flex-none min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold text-text-muted hover:bg-soft-bg border border-border-subtle transition-all active:scale-98 cursor-pointer disabled:opacity-50"
			>
				{t('admin.common.cancel')}
			</button>
			<button
				type="submit"
				disabled={isResetting}
				class="flex-1 sm:flex-none min-h-[44px] px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 transition-all active:scale-98 disabled:opacity-50 cursor-pointer shadow-xs"
			>
				{isResetting ? t('admin.dialog.resettingBtn') : t('admin.dialog.confirmResetBtn')}
			</button>
		</div>
	</form>
</Dialog>
