<script lang="ts">
	import { X } from 'lucide-svelte';
	import { t } from '$lib/i18n/index.js';
	import { cn } from '$lib/utils/cn.js';
	import type { Snippet } from 'svelte';

	interface Props {
		open?: boolean;
		title?: string;
		description?: string;
		size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
		preventClose?: boolean;
		showCloseButton?: boolean;
		icon?: Snippet;
		children?: Snippet;
		footer?: Snippet;
		class?: string;
		bodyClass?: string;
		onclose?: () => void;
	}

	let {
		open = $bindable(false),
		title = '',
		description = '',
		size = 'md',
		preventClose = false,
		showCloseButton = true,
		icon,
		children,
		footer,
		class: className = '',
		bodyClass = '',
		onclose
	}: Props = $props();

	function handleClose() {
		if (preventClose) return;
		open = false;
		if (onclose) onclose();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && open && !preventClose) {
			handleClose();
		}
	}

	// Body scroll lock effect
	$effect(() => {
		if (typeof document === 'undefined') return;
		if (open) {
			const originalOverflow = document.body.style.overflow;
			document.body.style.overflow = 'hidden';
			return () => {
				document.body.style.overflow = originalOverflow;
			};
		}
	});

	// Size classes for responsive modal
	const sizeClasses: Record<string, string> = {
		sm: 'sm:max-w-sm',
		md: 'sm:max-w-md',
		lg: 'sm:max-w-lg',
		xl: 'sm:max-w-2xl',
		full: 'sm:max-w-4xl'
	};
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div
		role="dialog"
		aria-modal="true"
		class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
	>
		<!-- Light-dismiss Backdrop -->
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
		<div
			class="fixed inset-0 bg-overlay backdrop-blur-xs transition-opacity duration-200 cursor-pointer"
			onclick={handleClose}
			aria-hidden="true"
		></div>

		<!-- Dialog Panel -->
		<div
			class={cn(
				"relative w-full bg-surface border-t sm:border border-border-subtle rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col pb-[env(safe-area-inset-bottom,1.25rem)] duration-200 transition-all",
				sizeClasses[size] || sizeClasses.md,
				className
			)}
		>
			<!-- Mobile Drag Bar Indicator -->
			<div class="sm:hidden pt-2.5 pb-1 flex justify-center shrink-0">
				<div class="w-12 h-1.5 rounded-full bg-border-subtle/80"></div>
			</div>

			<!-- Header -->
			{#if title || icon || showCloseButton}
				<div class="px-6 pt-5 pb-3 pr-14 flex items-start justify-between gap-3 shrink-0">
					<div class="flex items-start gap-3">
						{#if icon}
							<div class="shrink-0 mt-0.5">
								{@render icon()}
							</div>
						{/if}
						<div class="min-w-0 flex-1">
							{#if title}
								<h3 class="text-base sm:text-lg font-bold text-text-main tracking-tight leading-snug truncate">
									{title}
								</h3>
							{/if}
							{#if description}
								<p class="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
									{description}
								</p>
							{/if}
						</div>
					</div>

					{#if showCloseButton}
						<button
							type="button"
							onclick={handleClose}
							disabled={preventClose}
							class="absolute top-3 right-3 sm:top-5 sm:right-5 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-text-muted hover:text-text-main hover:bg-soft-bg active:scale-95 transition-all cursor-pointer disabled:opacity-40 z-20"
							aria-label={t('common.close', { defaultValue: 'Close' })}
						>
							<X size={18} strokeWidth={1.75} />
						</button>
					{/if}
				</div>
			{/if}

			<!-- Body (Scrollable container) -->
			<div class={cn("px-6 py-4 overflow-y-auto overscroll-contain flex-1 text-text-body text-sm space-y-4", bodyClass)}>
				{#if children}
					{@render children()}
				{/if}
			</div>

			<!-- Footer (Sticky bottom action bar) -->
			{#if footer}
				<div class="px-6 py-4 border-t border-border-subtle bg-soft-bg/40 flex items-center justify-end gap-3 shrink-0">
					{@render footer()}
				</div>
			{/if}
		</div>
	</div>
{/if}
