<script lang="ts">
	import { toast } from '$lib/stores/toast.js';
	import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-svelte';
	import { flip } from 'svelte/animate';
	import { fly, fade } from 'svelte/transition';

	const icons = {
		success: CheckCircle2,
		error: AlertCircle,
		info: Info,
		warning: AlertTriangle
	};

	const styles = {
		success: 'bg-surface/95 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-emerald-500/5',
		error: 'bg-surface/95 border-red-500/30 text-red-600 dark:text-red-400 shadow-red-500/5',
		info: 'bg-surface/95 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 shadow-indigo-500/5',
		warning: 'bg-surface/95 border-amber-500/30 text-amber-600 dark:text-amber-400 shadow-amber-500/5'
	};

	const iconColors = {
		success: 'text-emerald-500',
		error: 'text-red-500',
		info: 'text-indigo-500',
		warning: 'text-amber-500'
	};
</script>

<div 
	aria-live="polite" 
	aria-atomic="true"
	class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
>
	{#each $toast as item (item.id)}
		{@const Icon = icons[item.type] || Info}
		<div
			animate:flip={{ duration: 200 }}
			in:fly={{ y: 20, duration: 250 }}
			out:fade={{ duration: 150 }}
			class="pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-2xl border backdrop-blur-md shadow-xl {styles[item.type]}"
			role="status"
		>
			<div class="flex items-center gap-3 min-w-0">
				<Icon class="size-5 shrink-0 {iconColors[item.type]}" />
				<p class="text-xs sm:text-sm font-medium text-text-main leading-snug break-words">
					{item.message}
				</p>
			</div>

			<button
				type="button"
				onclick={() => toast.remove(item.id)}
				class="min-w-[44px] min-h-[44px] -my-2 -mr-2 flex items-center justify-center rounded-xl text-text-muted hover:text-text-main hover:bg-soft-bg/80 active:scale-95 transition-all cursor-pointer shrink-0"
				aria-label="Đóng thông báo"
			>
				<X strokeWidth={1.75} class="size-4" />
			</button>
		</div>
	{/each}
</div>
