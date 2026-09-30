<script lang="ts">
	import { enhance } from '$app/forms';
	import { t } from '$lib/i18n/index.js';
	import { 
		Users, 
		Phone, 
		Mail, 
		Calendar, 
		MessageSquare, 
		Download, 
		Search, 
		Clock, 
		Filter, 
		Copy, 
		Check, 
		Trash2, 
		ExternalLink,
		Sparkles,
		Tag,
		UserCheck,
		AlertCircle
	} from 'lucide-svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';

	let { data, form } = $props();

	let searchQuery = $state('');
	let statusFilter = $state<'ALL' | 'NEW' | 'CONTACTED' | 'CONFIRMED' | 'CANCELLED'>('ALL');
	let copiedPhoneId = $state<string | null>(null);
	let updatingLeadId = $state<string | null>(null);
	let showDeleteConfirm = $state(false);
	let targetLeadId = $state('');
	let targetLeadName = $state('');
	let isDeleting = $state(false);
	let deleteFormEl = $state<HTMLFormElement | null>(null);

	function openDeleteConfirm(id: string, name: string) {
		targetLeadId = id;
		targetLeadName = name;
		showDeleteConfirm = true;
	}

	// Stats metrics
	let totalLeads = $derived(data.leads.length);
	let newLeadsCount = $derived(data.leads.filter((l: any) => !l.status || l.status === 'NEW').length);
	let contactedCount = $derived(data.leads.filter((l: any) => l.status === 'CONTACTED').length);
	let confirmedCount = $derived(data.leads.filter((l: any) => l.status === 'CONFIRMED').length);

	// Filtered leads
	let filteredLeads = $derived(
		data.leads.filter((lead: any) => {
			const leadStatus = lead.status || 'NEW';
			if (statusFilter !== 'ALL' && leadStatus !== statusFilter) {
				return false;
			}
			if (searchQuery.trim()) {
				const q = searchQuery.toLowerCase().trim();
				const matchName = lead.name?.toLowerCase().includes(q);
				const matchPhone = lead.phone?.includes(q);
				const matchEmail = lead.email?.toLowerCase().includes(q);
				const matchNote = lead.note?.toLowerCase().includes(q);
				const matchField = lead.field?.toLowerCase().includes(q);
				return matchName || matchPhone || matchEmail || matchNote || matchField;
			}
			return true;
		})
	);

	function copyPhone(leadId: string, phoneStr: string) {
		if (typeof window === 'undefined') return;
		navigator.clipboard.writeText(phoneStr);
		copiedPhoneId = leadId;
		setTimeout(() => {
			copiedPhoneId = null;
		}, 2000);
	}

	function formatDateTime(isoString: string) {
		if (!isoString) return '';
		const d = new Date(isoString);
		return d.toLocaleString('vi-VN', {
			hour: '2-digit',
			minute: '2-digit',
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}

	function exportToCSV() {
		if (!data.leads || data.leads.length === 0) {
			return;
		}

		// UTF-8 BOM for Excel Vietnamese characters display
		const BOM = '\uFEFF';
		const headers = ['ID', 'Created At', 'Name', 'Phone', 'Email', 'Field', 'Note', 'Status', 'Admin Note', 'Source'];
		
		const rows = data.leads.map((l: any) => [
			`"${l.id}"`,
			`"${formatDateTime(l.createdAt)}"`,
			`"${(l.name || '').replace(/"/g, '""')}"`,
			`"${l.phone || ''}"`,
			`"${l.email || ''}"`,
			`"${(l.field || '').replace(/"/g, '""')}"`,
			`"${(l.note || '').replace(/"/g, '""')}"`,
			`"${l.status || 'NEW'}"`,
			`"${(l.adminNote || '').replace(/"/g, '""')}"`,
			`"${l.source || 'website'}"`
		]);

		const csvContent = BOM + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.setAttribute('href', url);
		link.setAttribute('download', `leads_${data.domain}_${new Date().toISOString().slice(0, 10)}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
</script>

<svelte:head>
	<title>{t('admin.leads.title')} | Admin</title>
</svelte:head>

<div class="space-y-8">
	<!-- Page Header -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
				{t('admin.leads.title')}
			</h1>
			<p class="mt-1 text-xs sm:text-sm text-text-muted">
				{t('admin.leads.subtitle')}
			</p>
		</div>

		<!-- Action Buttons -->
		<div class="flex items-center gap-2.5">
			<button
				type="button"
				onclick={exportToCSV}
				disabled={!data.leads || data.leads.length === 0}
				class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface hover:bg-soft-bg border border-border-subtle hover:border-border-strong text-xs font-semibold text-text-main transition-all active:scale-98 shadow-2xs cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
				title={t('admin.leads.exportCsv')}
			>
				<Download strokeWidth={1.75} size={14} class="text-primary" />
				<span>{t('admin.leads.exportCsv')}</span>
			</button>
		</div>
	</div>

	<!-- Form Message Feedback -->
	{#if form?.message}
		<div class="p-4 rounded-xl {form.success ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'} text-xs font-semibold animate-in fade-in">
			{form.message}
		</div>
	{/if}

	<!-- 4 Quick Stats Cards -->
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
		<!-- Total Leads -->
		<div class="p-4 rounded-2xl bg-surface border border-border-subtle space-y-1">
			<span class="text-[11px] font-bold text-text-muted uppercase tracking-wider">{t('admin.leads.totalLeads')}</span>
			<p class="text-2xl font-extrabold text-text-main">{totalLeads}</p>
			<p class="text-[11px] text-text-muted">{t('admin.leads.recordsCount')}</p>
		</div>

		<!-- New Leads (Action needed) -->
		<div class="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
			<div class="flex items-center justify-between">
				<span class="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">{t('admin.leads.statusNew')}</span>
				{#if newLeadsCount > 0}
					<span class="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
				{/if}
			</div>
			<p class="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{newLeadsCount}</p>
			<p class="text-[11px] text-text-muted">{t('admin.leads.contactSoon')}</p>
		</div>

		<!-- In progress -->
		<div class="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-1">
			<span class="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">{t('admin.leads.statusContacted')}</span>
			<p class="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{contactedCount}</p>
			<p class="text-[11px] text-text-muted">{t('admin.leads.inDiscussion')}</p>
		</div>

		<!-- Confirmed -->
		<div class="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-1">
			<span class="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{t('admin.leads.statusConfirmed')}</span>
			<p class="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{confirmedCount}</p>
			<p class="text-[11px] text-text-muted">{t('admin.leads.successfulClient')}</p>
		</div>
	</div>

	<!-- Filter & Search Bar -->
	<div class="p-4 rounded-2xl bg-surface border border-border-subtle flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs">
		<!-- Search input -->
		<div class="relative flex-1">
			<Search strokeWidth={1.75} size={15} class="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
			<input
				type="text"
				bind:value={searchQuery}
				placeholder={t('admin.leads.searchPlaceholder')}
				class="w-full pl-9 pr-4 py-2 rounded-xl bg-soft-bg border border-border-subtle text-text-main text-xs sm:text-sm placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
			/>
		</div>

		<!-- Status Filter Pills -->
		<div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
			<button
				type="button"
				onclick={() => statusFilter = 'ALL'}
				class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer {statusFilter === 'ALL' ? 'bg-primary text-white shadow-2xs' : 'bg-soft-bg text-text-muted hover:text-text-main'}"
			>
				{t('admin.leads.allStatuses')} ({totalLeads})
			</button>
			<button
				type="button"
				onclick={() => statusFilter = 'NEW'}
				class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer {statusFilter === 'NEW' ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-soft-bg text-text-muted hover:text-text-main'}"
			>
				{t('admin.leads.statusNew')} ({newLeadsCount})
			</button>
			<button
				type="button"
				onclick={() => statusFilter = 'CONTACTED'}
				class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer {statusFilter === 'CONTACTED' ? 'bg-amber-600 text-white shadow-2xs' : 'bg-soft-bg text-text-muted hover:text-text-main'}"
			>
				{t('admin.leads.statusContacted')} ({contactedCount})
			</button>
			<button
				type="button"
				onclick={() => statusFilter = 'CONFIRMED'}
				class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer {statusFilter === 'CONFIRMED' ? 'bg-blue-600 text-white shadow-2xs' : 'bg-soft-bg text-text-muted hover:text-text-main'}"
			>
				{t('admin.leads.statusConfirmed')} ({confirmedCount})
			</button>
			<button
				type="button"
				onclick={() => statusFilter = 'CANCELLED'}
				class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer {statusFilter === 'CANCELLED' ? 'bg-slate-700 text-white shadow-2xs' : 'bg-soft-bg text-text-muted hover:text-text-main'}"
			>
				{t('admin.leads.statusCancelled')}
			</button>
		</div>
	</div>

	<!-- Leads List Container -->
	{#if filteredLeads.length > 0}
		<div class="space-y-4">
			{#each filteredLeads as lead (lead.id)}
				{@const currentStatus = lead.status || 'NEW'}
				<article class="rounded-2xl bg-surface border border-border-subtle p-5 sm:p-6 space-y-4 hover:border-border-strong transition-all shadow-2xs">
					<!-- Top Row: Name, Time, Badges, Quick Actions -->
					<div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
						<div class="space-y-1">
							<div class="flex flex-wrap items-center gap-2.5">
								<h3 class="text-base sm:text-lg font-bold text-text-main">
									{lead.name || t('admin.leads.anonymousGuest')}
								</h3>

								<!-- Status Badge -->
								{#if currentStatus === 'NEW'}
									<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
										<span class="size-1.5 rounded-full bg-emerald-500"></span>
										{t('admin.leads.statusNew')}
									</span>
								{:else if currentStatus === 'CONTACTED'}
									<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
										<Clock strokeWidth={1.75} size={11} />
										{t('admin.leads.statusContacted')}
									</span>
								{:else if currentStatus === 'CONFIRMED'}
									<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
										<Check size={11} strokeWidth={2.25} />
										{t('admin.leads.statusConfirmed')}
									</span>
								{:else}
									<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-500/10 text-text-muted border border-border-subtle">
										{t('admin.leads.statusCancelled')}
									</span>
								{/if}

								{#if lead.field}
									<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-soft-bg text-text-muted border border-border-subtle">
										{lead.field}
									</span>
								{/if}
							</div>

							<div class="flex flex-wrap items-center gap-3 text-xs text-text-muted font-medium">
								<span class="inline-flex items-center gap-1">
									<Calendar strokeWidth={1.75} size={12} />
									{formatDateTime(lead.createdAt)}
								</span>
								{#if lead.source}
									<span>&bull;</span>
									<span class="text-[11px]">{lead.source}</span>
								{/if}
							</div>
						</div>

						<!-- Direct Action Buttons -->
						<div class="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
							<!-- Direct Call -->
							<a
								href="tel:{lead.phone}"
								class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 text-xs font-bold transition-all active:scale-95"
								title={t('admin.leads.callNow')}
							>
								<Phone strokeWidth={1.75} size={13} />
								<span>{t('admin.leads.callNow')}</span>
							</a>

							<!-- Zalo Chat -->
							<a
								href="https://zalo.me/{lead.phone.replace(/[^0-9]/g, '')}"
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 text-xs font-bold transition-all active:scale-95"
								title={t('admin.leads.zalo')}
							>
								<MessageSquare strokeWidth={1.75} size={13} />
								<span>{t('admin.leads.zalo')}</span>
							</a>

							<!-- Copy Phone -->
							<button
								type="button"
								onclick={() => copyPhone(lead.id, lead.phone)}
								class="p-2 rounded-xl bg-soft-bg hover:bg-surface border border-border-subtle text-text-muted hover:text-text-main text-xs transition-all cursor-pointer"
								title={t('admin.leads.copied')}
							>
								{#if copiedPhoneId === lead.id}
									<Check strokeWidth={2.25} size={14} class="text-emerald-500" />
								{:else}
									<Copy strokeWidth={1.75} size={14} />
								{/if}
							</button>

							<!-- Delete Lead -->
							<button
								type="button"
								onclick={() => openDeleteConfirm(lead.id, lead.name || lead.phone)}
								class="p-2 rounded-xl bg-soft-bg hover:bg-red-500/10 text-text-muted hover:text-red-500 border border-border-subtle transition-all cursor-pointer"
								title={t('admin.common.delete')}
							>
								<Trash2 strokeWidth={1.75} size={14} />
							</button>
						</div>
					</div>

					<!-- Details Grid: Contact & Inquiries -->
					<div class="grid gap-4 sm:grid-cols-2 text-xs">
						<!-- Contact info -->
						<div class="space-y-1.5 p-3 rounded-xl bg-soft-bg/50 border border-border-subtle">
							<span class="text-[10px] font-bold text-text-muted uppercase tracking-wider">{t('admin.leads.contactInfo')}</span>
							<p class="font-bold text-text-main flex items-center gap-1.5">
								<Phone strokeWidth={1.75} size={12} class="text-emerald-500" />
								<span>{lead.phone}</span>
							</p>
							{#if lead.email}
								<p class="text-text-muted flex items-center gap-1.5">
									<Mail strokeWidth={1.75} size={12} class="text-primary" />
									<a href="mailto:{lead.email}" class="hover:underline text-text-body">{lead.email}</a>
								</p>
							{/if}
						</div>

						<!-- Customer Note/Requirement -->
						<div class="space-y-1.5 p-3 rounded-xl bg-soft-bg/50 border border-border-subtle">
							<span class="text-[10px] font-bold text-text-muted uppercase tracking-wider">{t('admin.leads.customerRequest')}</span>
							<p class="text-text-body leading-relaxed">
								{lead.note || t('admin.leads.noNoteProvided')}
							</p>
						</div>
					</div>

					<!-- Inline Mini-CRM Management Form -->
					<form
						method="POST"
						action="?/updateStatus"
						use:enhance={() => {
							updatingLeadId = lead.id;
							return async ({ update }) => {
								await update({ reset: false });
								updatingLeadId = null;
							};
						}}
						class="pt-3 border-t border-border-subtle flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs"
					>
						<input type="hidden" name="id" value={lead.id} />

						<!-- Status selector -->
						<div class="flex items-center gap-2">
							<span class="font-medium text-text-muted whitespace-nowrap">{t('admin.leads.statusLabel')}</span>
							<select
								name="status"
								value={currentStatus}
								class="px-2.5 py-1.5 rounded-lg bg-surface border border-border-subtle text-text-main font-semibold text-xs focus:border-primary focus:outline-none transition-colors cursor-pointer"
							>
								<option value="NEW">🟢 {t('admin.leads.statusNew')}</option>
								<option value="CONTACTED">🟡 {t('admin.leads.statusContacted')}</option>
								<option value="CONFIRMED">🔵 {t('admin.leads.statusConfirmed')}</option>
								<option value="CANCELLED">⚪ {t('admin.leads.statusCancelled')}</option>
							</select>
						</div>

						<!-- Admin private note & Save Button -->
						<div class="flex-1 flex items-center gap-2">
							<input
								type="text"
								name="adminNote"
								value={lead.adminNote || ''}
								placeholder={t('admin.leads.adminNotePlaceholder')}
								class="flex-1 px-3 py-1.5 rounded-lg bg-surface border border-border-subtle text-text-main text-xs placeholder:text-text-muted focus:border-primary focus:outline-none transition-colors"
							/>
							<button
								type="submit"
								disabled={updatingLeadId === lead.id}
								class="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold text-xs transition-all shadow-2xs disabled:opacity-50 cursor-pointer shrink-0"
							>
								{updatingLeadId === lead.id ? t('admin.leads.saving') : t('admin.leads.saveNote')}
							</button>
						</div>
					</form>
				</article>
			{/each}
		</div>
	{:else}
		<!-- Empty State -->
		<div class="p-12 rounded-3xl bg-surface border border-border-subtle text-center space-y-4">
			<div class="size-14 rounded-2xl bg-soft-bg text-text-muted mx-auto flex items-center justify-center">
				<Users strokeWidth={1.75} size={28} />
			</div>
			<div class="space-y-1">
				<h3 class="text-base font-bold text-text-main">
					{searchQuery.trim() || statusFilter !== 'ALL' ? t('admin.leads.noMatchTitle') : t('admin.leads.emptyTitle')}
				</h3>
				<p class="text-xs text-text-muted max-w-sm mx-auto">
					{searchQuery.trim() || statusFilter !== 'ALL' 
						? t('admin.leads.noMatchDesc') 
						: t('admin.leads.emptyDesc')}
				</p>
			</div>
			{#if searchQuery.trim() || statusFilter !== 'ALL'}
				<button
					type="button"
					onclick={() => { searchQuery = ''; statusFilter = 'ALL'; }}
					class="px-4 py-2 rounded-xl bg-soft-bg text-xs font-semibold text-text-main hover:bg-surface border border-border-subtle transition-colors cursor-pointer"
				>
					{t('admin.leads.clearFilter')}
				</button>
			{/if}
		</div>
	{/if}
</div>

<ConfirmDialog
	bind:open={showDeleteConfirm}
	title={t('admin.dialog.deleteTitle')}
	message={targetLeadName ? t('admin.leads.deleteConfirmWithName', { name: targetLeadName, defaultValue: `Are you sure you want to delete lead "${targetLeadName}"? This action cannot be undone.` }) : t('admin.dialog.deleteLeadConfirm')}
	loading={isDeleting}
	onconfirm={() => {
		deleteFormEl?.requestSubmit();
	}}
/>

<form
	bind:this={deleteFormEl}
	method="POST"
	action="?/delete"
	use:enhance={() => {
		isDeleting = true;
		return async ({ update }) => {
			await update();
			isDeleting = false;
			showDeleteConfirm = false;
		};
	}}
	class="hidden"
>
	<input type="hidden" name="id" value={targetLeadId} />
</form>
