<script lang="ts">
	import { page } from '$app/stores';
	import HomeEditorial from '$lib/components/home/HomeEditorial.svelte';
	import HomeConsulting from '$lib/components/home/HomeConsulting.svelte';
	import HomeBento from '$lib/components/home/HomeBento.svelte';
	import HomeStorytelling from '$lib/components/home/HomeStorytelling.svelte';

	let { data }: {
		data: {
			settings: any;
			posts: { slug: string; meta: { title: string; date: string; tags: string[]; thumbnail: string }, content?: string; excerpt?: string; excerpt_en?: string; readingMinutes?: number }[];
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
		};
	} = $props();

	let layoutParam = $derived($page.url.searchParams.get('layout'));
	let currentLayout = $derived(layoutParam || data.settings?.homeLayout || 'editorial');
</script>

{#if currentLayout === 'one_page_consulting'}
	<HomeConsulting {data} />
{:else if currentLayout === 'bento_portfolio'}
	<HomeBento {data} />
{:else if currentLayout === 'minimal_story'}
	<HomeStorytelling {data} />
{:else}
	<HomeEditorial {data} />
{/if}
