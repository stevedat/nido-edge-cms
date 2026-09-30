<script lang="ts">
	import type { ComponentType } from 'svelte';
	import { ArrowUpRight } from 'lucide-svelte';

	interface Props {
		title: string;
		value: string | number;
		icon: ComponentType;
		subtitle?: string;
		badgeText?: string;
		badgeColor?: 'emerald' | 'amber' | 'indigo' | 'slate';
		href?: string;
	}

	let { 
		title,
		value,
		icon: Icon,
		subtitle,
		badgeText,
		badgeColor = 'slate',
		href
	}: Props = $props();

	const badgeClasses: Record<string, string> = {
		emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
		amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
		indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
		slate: 'bg-soft-bg text-text-muted border-border-subtle'
	};

	const Component = href ? 'a' : 'div';
</script>

<svelte:element 
	this={Component} 
	{href}
	class="group relative flex flex-col justify-between rounded-3xl bg-surface border border-border-subtle p-5 sm:p-6 transition-all duration-200 hover:bg-soft-bg {href ? 'hover:border-border-strong cursor-pointer active:scale-98' : ''}"
>
	<div>
		<!-- Top Row: Icon + Badge -->
		<div class="flex items-center justify-between gap-2 mb-6">
			<div class="size-10 rounded-2xl bg-soft-bg border border-border-subtle flex items-center justify-center text-text-main shrink-0 group-hover:scale-105 transition-transform">
				<Icon size={18} strokeWidth={1.75} />
			</div>

			{#if badgeText}
				<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[13px] font-semibold border {badgeClasses[badgeColor]} shrink-0">
					{badgeText}
				</span>
			{/if}
		</div>

		<!-- Title + Subtitle -->
		<div class="space-y-1 mb-3">
			<h3 class="text-sm sm:text-base font-semibold text-text-main tracking-tight">
				{title}
			</h3>
			{#if subtitle}
				<p class="text-sm text-text-muted font-normal">
					{subtitle}
				</p>
			{/if}
		</div>

		<!-- Big Metric Value -->
		<div class="text-4xl sm:text-5xl font-extrabold text-text-main tracking-tight leading-none">
			{value}
		</div>
	</div>
</svelte:element>