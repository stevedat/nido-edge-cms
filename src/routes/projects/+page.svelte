<script lang="ts">
	import { t, localized } from '$lib/i18n/index.js';
	import { ArrowDown, ExternalLink } from 'lucide-svelte';

	let { data }: {
		data: {
			settings: any;
			projects: { 
				id: string; 
				title: string; 
				tagline?: string; 
				description: string; 
				link: string; 
				tags: string[]; 
				thumbnail?: string; 
			}[];
		};
	} = $props();

	// Function to group projects by matching tags (case-insensitive)
	function getCollection(tagKeyword: string) {
		return data.projects.filter(p => 
			(p.tags || []).some(t => t.toLowerCase().includes(tagKeyword.toLowerCase()))
		);
	}

	let fintechProjects = $derived(getCollection('FinTech'));
	let edtechProjects = $derived(getCollection('EdTech').filter(p => !fintechProjects.includes(p)));
	let otherProjects = $derived(data.projects.filter(p => !fintechProjects.includes(p) && !edtechProjects.includes(p)));

	function scrollToGallery() {
		const element = document.getElementById('gallery');
		if (element) {
			element.scrollIntoView({ behavior: 'smooth' });
		}
	}
</script>

<svelte:head>
	<title>{localized(data.settings, 'authorName')} - {t('nav.projects')}</title>
	<meta name="description" content="Projects Portfolio" />
</svelte:head>

<div class="bg-main-bg text-text-main antialiased m-0 p-0 selection:bg-soft-bg min-h-screen">

	<!-- Hero Section -->
	<section class="pt-32 pb-16 flex flex-col items-center justify-center text-center px-4">
		<h1 class="font-serif text-6xl md:text-8xl text-text-main tracking-tight leading-[1.1] mb-6">
			{t('projectGallery.heroTitle')}
		</h1>
		<p class="text-xl text-text-muted">
			{t('projectGallery.heroDesc')}
		</p>
		<button 
			onclick={scrollToGallery}
			class="mt-16 animate-bounce cursor-pointer p-4 rounded-full hover:bg-soft-bg transition-colors active:scale-95"
			aria-label="Scroll down"
		>
			<ArrowDown size={24} strokeWidth={1.75} class="text-text-muted" />
		</button>
	</section>

	<div id="gallery" class="pb-32 space-y-40">
		
		<!-- FinTech Collection -->
		{#if fintechProjects.length > 0}
		<section class="max-w-7xl mx-auto px-4">
			<h2 class="font-serif text-4xl md:text-5xl text-text-main mb-16 text-center border-b border-border-strong pb-8">
				{t('projectGallery.colFintech')}
			</h2>
			<div class="space-y-32">
				{#each fintechProjects as project}
					<div class="group relative">
						<a href={project.link || `#`} target="_blank" class="block w-full aspect-[16/9] md:aspect-[21/9] rounded-[2rem] overflow-hidden bg-soft-bg relative hover:scale-[1.01] active:scale-[0.99] transition-transform duration-500 cursor-pointer shadow-sm">
							{#if project.thumbnail}
								<img src={project.thumbnail} alt={localized(project, 'title')} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" loading="lazy" />
							{:else}
								<div class="w-full h-full flex items-center justify-center">
									<h3 class="font-serif text-4xl text-text-muted">{localized(project, 'title')}</h3>
								</div>
							{/if}
							<div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
						</a>
						<div class="mt-8 max-w-3xl mx-auto text-center">
							<h3 class="font-serif text-3xl text-text-main mb-3">{localized(project, 'title')}</h3>
							<p class="text-text-muted text-lg leading-relaxed mb-6">{localized(project, 'description')}</p>
							{#if project.link}
								<a href={project.link} target="_blank" class="inline-flex items-center gap-2 text-sm font-medium text-text-main border-b border-border-strong pb-1 hover:border-text-main hover:text-primary transition-all">
									{t('projectGallery.visitProject')} <ExternalLink size={14} strokeWidth={1.75} />
								</a>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</section>
		{/if}

		<!-- EdTech Collection -->
		{#if edtechProjects.length > 0}
		<section class="max-w-7xl mx-auto px-4">
			<h2 class="font-serif text-4xl md:text-5xl text-text-main mb-16 text-center border-b border-border-strong pb-8">
				{t('projectGallery.colEdtech')}
			</h2>
			<div class="space-y-32">
				{#each edtechProjects as project}
					<div class="group relative">
						<a href={project.link || `#`} target="_blank" class="block w-full aspect-[16/9] md:aspect-[21/9] rounded-[2rem] overflow-hidden bg-soft-bg relative hover:scale-[1.01] active:scale-[0.99] transition-transform duration-500 cursor-pointer shadow-sm">
							{#if project.thumbnail}
								<img src={project.thumbnail} alt={localized(project, 'title')} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" loading="lazy" />
							{:else}
								<div class="w-full h-full flex items-center justify-center">
									<h3 class="font-serif text-4xl text-text-muted">{localized(project, 'title')}</h3>
								</div>
							{/if}
							<div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
						</a>
						<div class="mt-8 max-w-3xl mx-auto text-center">
							<h3 class="font-serif text-3xl text-text-main mb-3">{localized(project, 'title')}</h3>
							<p class="text-text-muted text-lg leading-relaxed mb-6">{localized(project, 'description')}</p>
							{#if project.link}
								<a href={project.link} target="_blank" class="inline-flex items-center gap-2 text-sm font-medium text-text-main border-b border-border-strong pb-1 hover:border-text-main hover:text-primary transition-all">
									{t('projectGallery.visitProject')} <ExternalLink size={14} strokeWidth={1.75} />
								</a>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</section>
		{/if}

		<!-- Digital Ventures Collection -->
		{#if otherProjects.length > 0}
		<section class="max-w-7xl mx-auto px-4">
			<h2 class="font-serif text-4xl md:text-5xl text-text-main mb-16 text-center border-b border-border-strong pb-8">
				{t('projectGallery.colOthers')}
			</h2>
			<div class="space-y-32">
				{#each otherProjects as project}
					<div class="group relative">
						<a href={project.link || `#`} target="_blank" class="block w-full aspect-[16/9] md:aspect-[21/9] rounded-[2rem] overflow-hidden bg-soft-bg relative hover:scale-[1.01] active:scale-[0.99] transition-transform duration-500 cursor-pointer shadow-sm">
							{#if project.thumbnail}
								<img src={project.thumbnail} alt={localized(project, 'title')} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" loading="lazy" />
							{:else}
								<div class="w-full h-full flex items-center justify-center">
									<h3 class="font-serif text-4xl text-text-muted">{localized(project, 'title')}</h3>
								</div>
							{/if}
							<div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
						</a>
						<div class="mt-8 max-w-3xl mx-auto text-center">
							<h3 class="font-serif text-3xl text-text-main mb-3">{localized(project, 'title')}</h3>
							<p class="text-text-muted text-lg leading-relaxed mb-6">{localized(project, 'description')}</p>
							{#if project.link}
								<a href={project.link} target="_blank" class="inline-flex items-center gap-2 text-sm font-medium text-text-main border-b border-border-strong pb-1 hover:border-text-main hover:text-primary transition-all">
									{t('projectGallery.visitProject')} <ExternalLink size={14} strokeWidth={1.75} />
								</a>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</section>
		{/if}

	</div>
</div>
