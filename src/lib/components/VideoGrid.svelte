<script lang="ts">
	import VideoEmbed from './VideoEmbed.svelte';
	import ShareButton from './ShareButton.svelte';
	import { Clapperboard } from 'lucide-svelte';
	import { t, localized } from '$lib/i18n/index.js';

	interface Video {
		id?: string;
		title?: string;
		title_en?: string;
		url: string;
		platform: string;
	}

	interface Props {
		videos?: Video[];
		columns?: number | 'auto';
		showTitle?: boolean;
		showPlatform?: boolean;
		autoplay?: boolean;
	}

	let { 
		videos = [],
		columns = 'auto',
		showTitle = true,
		showPlatform = true,
		autoplay = false
	}: Props = $props();

	function getGridClass(cols: number | 'auto'): string {
		switch (cols) {
			case 1: return 'grid-cols-1';
			case 2: return 'grid-cols-1 md:grid-cols-2';
			case 3: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
			case 4: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
			default: return 'grid-cols-1 md:grid-cols-2';
		}
	}

	const gridClass = $derived(getGridClass(columns));
</script>

{#if videos.length > 0}
	<div class="video-grid w-full">
		<div class="grid {gridClass} gap-6 sm:gap-8">
			{#each videos as video}
				<div class="video-card p-4 sm:p-5 rounded-2xl bg-surface border border-border-subtle hover:border-border-subtle/80 hover:shadow-sm transition-all space-y-3.5">
					<!-- Video Embed Facade -->
					<div class="rounded-xl overflow-hidden bg-soft-bg">
						<VideoEmbed 
							url={video.url} 
							platform={video.platform}
							title={localized(video, 'title') || video.title}
							{autoplay}
						/>
					</div>
					
					<!-- Video Info -->
					{#if showTitle || showPlatform}
						<div class="space-y-1.5 pt-0.5">
							{#if showTitle && (localized(video, 'title') || video.title)}
								<h3 class="font-bold text-base sm:text-lg text-text-main line-clamp-2 leading-snug">
									{localized(video, 'title') || video.title}
								</h3>
							{/if}
							
							{#if showPlatform}
								<div class="flex items-center justify-between gap-2 pt-1 text-xs text-text-muted">
									<span class="inline-flex items-center px-2 py-0.5 rounded-md font-semibold bg-soft-bg text-text-muted border border-border-subtle uppercase tracking-wider text-[10px]">
										{video.platform}
									</span>

									<ShareButton
										url={video.url}
										title={localized(video, 'title') || video.title || 'Video · Edge CMS'}
										variant="compact"
									/>
								</div>
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
{:else}
	<div class="empty-state text-center py-16 bg-surface rounded-2xl border border-dashed border-border-subtle space-y-3">
		<div class="size-12 rounded-full bg-soft-bg mx-auto flex items-center justify-center text-text-muted">
			<Clapperboard size={22} strokeWidth={1.5} />
		</div>
		<h3 class="text-base font-bold text-text-main">{t('videos.emptyTitle')}</h3>
		<p class="text-xs text-text-muted max-w-sm mx-auto">{t('videos.emptyDesc')}</p>
	</div>
{/if}