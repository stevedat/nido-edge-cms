<script lang="ts">
	import { AlertTriangle, Trash2, Loader2 } from 'lucide-svelte';
	import { t } from '$lib/i18n/index.js';
	import Dialog from '$lib/components/ui/Dialog.svelte';

	interface Props {
		open?: boolean;
		title?: string;
		message?: string;
		confirmText?: string;
		cancelText?: string;
		danger?: boolean;
		loading?: boolean;
		onconfirm?: () => void;
		oncancel?: () => void;
	}

	let {
		open = $bindable(false),
		title = '',
		message = '',
		confirmText = '',
		cancelText = '',
		danger = true,
		loading = false,
		onconfirm,
		oncancel
	}: Props = $props();

	function handleClose() {
		if (loading) return;
		open = false;
		if (oncancel) oncancel();
	}

	function handleConfirm() {
		if (loading) return;
		if (onconfirm) onconfirm();
	}
</script>

<Dialog
	bind:open
	title={title || (danger ? t('admin.dialog.deleteTitle') : t('admin.dialog.confirmTitle'))}
	size="md"
	preventClose={loading}
	showCloseButton={!loading}
	onclose={handleClose}
>
	{#snippet icon()}
		<div
			class="size-11 rounded-2xl flex items-center justify-center shrink-0 {danger
				? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
				: 'bg-primary/10 text-primary'}"
		>
			{#if danger}
				<Trash2 size={20} strokeWidth={1.75} />
			{:else}
				<AlertTriangle size={20} strokeWidth={1.75} />
			{/if}
		</div>
	{/snippet}

	<p class="text-xs sm:text-sm text-text-body leading-relaxed">
		{message || (danger ? t('admin.dialog.deleteWarning') : '')}
	</p>

	{#snippet footer()}
		<div class="flex items-center gap-3 w-full">
			<button
				type="button"
				onclick={handleClose}
				disabled={loading}
				class="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-soft-bg hover:bg-surface border border-border-subtle text-text-main font-bold text-xs sm:text-sm transition-all active:scale-98 cursor-pointer disabled:opacity-50"
			>
				{cancelText || t('admin.common.cancel')}
			</button>
			<button
				type="button"
				onclick={handleConfirm}
				disabled={loading}
				class="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm active:scale-98 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 {danger
					? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
					: 'bg-primary hover:bg-primary/90 text-white'}"
			>
				{#if loading}
					<Loader2 strokeWidth={1.75} size={16} class="animate-spin" />
					<span>{t('admin.common.loading')}</span>
				{:else}
					<span>{confirmText || (danger ? t('admin.common.delete') : t('admin.common.confirm'))}</span>
				{/if}
			</button>
		</div>
	{/snippet}
</Dialog>
