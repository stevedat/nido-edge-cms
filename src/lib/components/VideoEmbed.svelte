<script lang="ts">
	interface Props {
		url?: string;
		platform?: string;
		title?: string;
		width?: string | number;
		height?: string | number;
		autoplay?: boolean;
		controls?: boolean;
	}

	let { 
		url = '',
		platform = '',
		title = 'Video',
		width = '100%',
		height = '315',
		autoplay = false,
		controls = true
	}: Props = $props();

	/**
	 * Extract video ID from various platform URLs
	 */
	function getVideoId(url: string, platform: string): string | null {
		if (!url) return null;

		switch (platform.toLowerCase()) {
			case 'youtube': {
				// Support various YouTube URL formats
				const patterns = [
					/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
					/youtube\.com\/v\/([^&\n?#]+)/,
					/youtube\.com\/shorts\/([^&\n?#]+)/
				];
				
				for (const pattern of patterns) {
					const match = url.match(pattern);
					if (match) return match[1];
				}
				return null;
			}
			
			case 'vimeo': {
				// Support Vimeo URLs
				const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
				return match ? match[1] : null;
			}
			
			case 'tiktok': {
				// TikTok video ID extraction
				const match = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
				return match ? match[1] : null;
			}
			
			case 'facebook': {
				// Facebook video ID extraction
				const match = url.match(/facebook\.com\/.*\/videos\/(\d+)/);
				return match ? match[1] : null;
			}
			
			case 'instagram': {
				// Instagram video/reel ID
				const match = url.match(/instagram\.com\/(?:p|reel)\/([^/?]+)/);
				return match ? match[1] : null;
			}
			
			default:
				return null;
		}
	}

	/**
	 * Generate embed URL based on platform and video ID
	 */
	function getEmbedUrl(platform: string, videoId: string | null, forceAutoplay: boolean = false): string | null {
		if (!videoId) return null;

		const autoplayParam = (autoplay || forceAutoplay) ? '1' : '0';
		const controlsParam = controls ? '1' : '0';

		switch (platform.toLowerCase()) {
			case 'youtube':
				return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplayParam}&controls=${controlsParam}&rel=0`;
			
			case 'vimeo':
				return `https://player.vimeo.com/video/${videoId}?autoplay=${autoplayParam}&controls=${controlsParam}`;
			
			case 'tiktok':
				return `https://www.tiktok.com/embed/v2/${videoId}`;
			
			case 'facebook':
				return `https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/video.php?v=${videoId}&show_text=false&width=${width}&height=${height}`;
			
			case 'instagram':
				return `https://www.instagram.com/p/${videoId}/embed/`;
			
			default:
				return null;
		}
	}

	/**
	 * Get thumbnail URL for video preview
	 */
	function getThumbnailUrl(platform: string, videoId: string | null): string | null {
		if (!videoId) return null;

		switch (platform.toLowerCase()) {
			case 'youtube':
				return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
			
			case 'vimeo':
				return `https://vumbnail.com/${videoId}.jpg`;
			
			default:
				return null;
		}
	}

	// Derived values using Svelte 5 runes
	const videoId = $derived(getVideoId(url, platform));
	// We pass true to getEmbedUrl if we want to autoplay after facade click
	let isLoaded = $state(false);
	
	const embedUrl = $derived(getEmbedUrl(platform, videoId, isLoaded));
	const thumbnailUrl = $derived(getThumbnailUrl(platform, videoId));
	const isValidVideo = $derived(!!embedUrl);

	// Responsive aspect ratio classes
	const aspectRatioClass = 'aspect-video'; // 16:9 ratio
	
	function handlePlayClick() {
		isLoaded = true;
	}

	import { t } from '$lib/i18n/index.js';
</script>

{#if isValidVideo}
	<div class="video-embed-container group">
		<div class="relative {aspectRatioClass} bg-surface border border-border-subtle rounded-xl overflow-hidden shadow-sm dark:shadow-none transition-shadow hover:shadow-soft">
			{#if !isLoaded}
				<!-- Video Facade / Thumbnail -->
				<button 
					class="absolute inset-0 w-full h-full cursor-pointer focus:outline-none"
					onclick={handlePlayClick}
					aria-label={t('videos.playAria', { title: title || 'Video' })}
				>
					{#if thumbnailUrl}
						<img 
							src={thumbnailUrl} 
							alt={title} 
							class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
							loading="lazy"
						/>
					{:else}
						<div class="absolute inset-0 w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 transition-transform duration-500 group-hover:scale-105"></div>
					{/if}
					
					<!-- Play Button Overlay -->
					<div class="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
						<div class="w-16 h-16 rounded-full bg-surface/90 border border-border-subtle shadow-md backdrop-blur-md flex items-center justify-center transform transition-transform group-hover:scale-110 active:scale-95">
							<svg class="w-8 h-8 text-primary ml-1" fill="currentColor" viewBox="0 0 20 20">
								<path d="M4 4l12 6-12 6z"></path>
							</svg>
						</div>
					</div>
				</button>
			{:else}
				<!-- Actual Iframe loaded after click -->
				<iframe
					src={embedUrl}
					{title}
					class="absolute inset-0 w-full h-full"
					frameborder="0"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
					allowfullscreen
					loading="lazy"
				></iframe>
			{/if}
		</div>
		
		<!-- Video Info -->
		<div class="mt-3 flex items-center justify-between text-sm text-text-muted">
			<div class="flex items-center gap-2">
				<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-soft-bg border border-border-subtle text-text-body">
					{platform}
				</span>
				{#if title}
					<span class="font-semibold text-text-main">{title}</span>
				{/if}
			</div>
			<a 
				href={url} 
				target="_blank" 
				rel="noopener noreferrer"
				class="text-primary hover:text-primary-light transition-colors font-semibold"
			>
				{t('videos.viewOriginal')}
			</a>
		</div>
	</div>
{:else}
	<!-- Fallback for unsupported or invalid URLs -->
	<div class="video-embed-fallback">
		<div class="relative {aspectRatioClass} bg-surface border border-border-subtle rounded-xl overflow-hidden shadow-sm dark:shadow-none flex items-center justify-center">
			<div class="text-center p-6">
				<div class="text-4xl mb-3">🎥</div>
				<p class="text-text-main font-semibold mb-3">{t('videos.cannotEmbed')}</p>
				<a 
					href={url} 
					target="_blank" 
					rel="noopener noreferrer"
					class="inline-flex items-center px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors shadow-sm dark:shadow-none font-semibold text-sm"
				>
					{t('videos.watchVideo')}
				</a>
			</div>
		</div>
		
		<div class="mt-3 text-sm text-text-muted">
			<p>Platform: {platform} | URL: {url}</p>
			<p class="text-xs mt-1">{t('videos.supportedPlatforms')}</p>
		</div>
	</div>
{/if}

<style>
	.video-embed-container {
		max-width: 100%;
	}
	
	/* Ensure responsive behavior */
	.aspect-video {
		aspect-ratio: 16 / 9;
	}
	
	/* Custom scrollbar for better UX */
	.video-embed-container::-webkit-scrollbar {
		display: none;
	}
	
	/* Focus styles for accessibility */
	iframe:focus {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}
</style>