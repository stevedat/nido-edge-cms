<script lang="ts">
	import { ArrowDown, ArrowRight } from 'lucide-svelte';
	import { openFreeSlotModal } from '$lib/stores/freeSlot.js';
	import { t, localized } from '$lib/i18n/index.js';

	let { data }: { data: any } = $props();

	// Smooth scroll to the next section
	function scrollToContent() {
		const element = document.getElementById('story-content');
		if (element) {
			element.scrollIntoView({ behavior: 'smooth' });
		}
	}
</script>

<svelte:head>
	<style>
		.fade-up {
			animation: fadeUp 1s ease-out forwards;
		}
		
		@keyframes fadeUp {
			from { opacity: 0; transform: translateY(20px); }
			to { opacity: 1; transform: translateY(0); }
		}

		.story-section {
			min-height: 80vh;
			display: flex;
			align-items: center;
		}
	</style>
</svelte:head>

<div class="bg-main-bg text-text-main antialiased m-0 p-0 selection:bg-soft-bg">

	<!-- Hero Section -->
	<section class="pt-40 pb-24 flex flex-col items-center justify-center text-center px-4 fade-up">
		<h1 class="font-serif text-5xl md:text-7xl lg:text-8xl text-text-main tracking-tight leading-[1.1] max-w-5xl mb-8">
			{@html localized(data.settings, 'heroTitle').replace(/\s*·\s*/g, '<br/>')}
		</h1>
		<p class="text-lg text-text-muted max-w-2xl leading-relaxed">
			{localized(data.settings, 'heroBio')}
		</p>
		
		<button 
			onclick={scrollToContent}
			class="mt-8 animate-bounce cursor-pointer p-4 rounded-full hover:bg-soft-bg transition-colors active:scale-95"
			aria-label={t('homeStory.startStory')}
		>
			<ArrowDown size={24} strokeWidth={1.75} class="text-text-muted" />
		</button>
	</section>

	<!-- Insights / Posts Section (Sticky Storytelling) -->
	{#if data.settings.showBlog && data.posts && data.posts.length > 0}
	<section id="story-content" class="story-section px-4 max-w-6xl mx-auto py-12 relative">
		<div class="grid grid-cols-1 md:grid-cols-2 gap-20 w-full items-start">
			<!-- Sticky Left Side -->
			<div class="md:sticky md:top-1/3">
				<span class="text-xs font-bold text-text-muted uppercase tracking-[0.2em] mb-4 block">{t('homeStory.insightTag')}</span>
				<h2 class="font-serif text-4xl md:text-5xl text-text-main leading-tight mb-6">
					{localized(data.settings, 'siteDescription') || "Discover the philosophy behind our work."}
				</h2>
				<p class="text-text-muted leading-relaxed text-lg mb-8">
					{localized(data.settings, 'siteDescription_en') || "We believe in software that shapes human behavior for the better. Explore our latest thoughts and insights."}
				</p>
				<a href="/blog" class="inline-flex items-center gap-2 text-sm font-medium text-text-main border-b border-border-strong pb-1 hover:border-text-main hover:text-primary transition-all">
					{t('nav.blog')}
				</a>
			</div>
			
			<!-- Scrolling Right Side (Bento Boxes of Posts) -->
			<div class="grid grid-cols-1 gap-6">
				{#each data.posts.slice(0, 3) as post}
				<a href="/blog/{post.slug}" class="bg-surface p-10 rounded-[2rem] border border-border-subtle shadow-sm flex flex-col justify-center hover:border-border-strong hover:scale-98 active:scale-95 transition-all group cursor-pointer block">
					<h3 class="font-bold text-xl mb-3 text-text-main group-hover:text-primary transition-colors">{localized(post.meta, 'title') || post.meta.title}</h3>
					<p class="text-text-muted text-sm leading-relaxed line-clamp-3">
						{localized(post, 'excerpt') || localized(post, 'content')?.substring(0, 150) || post.content?.substring(0, 150) || ''}...
					</p>
					<div class="mt-6 flex flex-wrap gap-2">
						{#each (post.meta.tags || []).slice(0,2) as tag}
							<span class="text-[10px] font-bold text-text-muted uppercase tracking-wider bg-soft-bg px-2 py-1 rounded-md">{tag}</span>
						{/each}
					</div>
				</a>
				{/each}
			</div>
		</div>
	</section>
	{/if}

	<!-- Projects Section -->
	{#if data.settings.showProjects && data.projects && data.projects.length > 0}
	<section class="story-section px-4 py-16 bg-surface mt-20 rounded-t-[3rem] border-t border-border-subtle">
		<div class="max-w-6xl mx-auto w-full">
			<div class="text-center mb-20">
				<span class="text-xs font-bold text-text-muted uppercase tracking-[0.2em] mb-4 block">{t('homeStory.productTag')}</span>
				<h2 class="font-serif text-5xl md:text-6xl text-text-main leading-tight">
					Connect the dots.
				</h2>
			</div>
			
			<div class="grid grid-cols-1 md:grid-cols-2 gap-10">
				{#each data.projects.slice(0, 4) as project, i}
				<a href={project.link || `/projects/${project.id}`} target={project.link ? '_blank' : '_self'} class="group cursor-pointer {i % 2 !== 0 ? 'md:mt-16' : ''} hover:scale-98 active:scale-95 transition-transform block">
					<div class="w-full aspect-[4/3] rounded-[2rem] overflow-hidden bg-soft-bg mb-6 flex items-center justify-center p-8 relative">
						{#if project.thumbnail}
							<img src={project.thumbnail} alt={localized(project, 'title')} class="w-full h-full object-cover group-hover:scale-105 transition duration-700" loading="lazy" />
						{:else}
							<h3 class="font-serif text-4xl text-text-muted text-center">{localized(project, 'title')}</h3>
						{/if}
						<div class="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 dark:opacity-100 rounded-[2rem] pointer-events-none"></div>
					</div>
					<div class="flex flex-wrap gap-2 mb-3">
						{#each (localized(project, 'tags') || project.tags || []).slice(0,3) as tag}
						<span class="text-[10px] font-bold text-text-muted bg-soft-bg px-3 py-1 rounded-full uppercase tracking-widest">{tag}</span>
						{/each}
					</div>
					<h3 class="font-serif text-2xl text-text-main mb-2 group-hover:text-primary transition-colors">{localized(project, 'title')}</h3>
					<p class="text-text-muted text-sm leading-relaxed line-clamp-2">{localized(project, 'description')}</p>
				</a>
				{/each}
			</div>
			
			<div class="mt-12 text-center">
				<a href="/projects" class="inline-flex items-center gap-2 text-sm font-medium text-text-main border-b border-border-strong pb-1 hover:border-text-main hover:text-primary transition-all">
					{t('homeStory.projectTag')} <ArrowRight size={16} strokeWidth={1.75} />
				</a>
			</div>
		</div>
	</section>
	{/if}

	<!-- Call to action Section -->
	<section class="py-40 bg-surface dark:bg-soft-bg text-center rounded-t-[3rem] border-t border-border-subtle relative z-10">
		<div class="max-w-2xl mx-auto px-4">
			<h2 class="font-serif text-5xl md:text-6xl mb-8 text-text-main">{t('homeStory.readyToStart')}</h2>
			<p class="text-text-muted text-lg mb-12">
				{t('homeStory.ctaMessage')}
			</p>
			
			{#if data.settings.headerCtaAction === 'modal'}
				<button 
					onclick={() => openFreeSlotModal()}
					class="px-8 py-4 rounded-full bg-text-main text-surface font-medium hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-black/5 dark:shadow-none"
				>
					{localized(data.settings, 'headerCtaText') || t('nav.freeSlotCTA')}
				</button>
			{:else}
				<a 
					href={data.settings.headerCtaUrl || '/about#connect'}
					class="inline-block px-8 py-4 rounded-full bg-text-main text-surface font-medium hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-black/5 dark:shadow-none"
				>
					{localized(data.settings, 'headerCtaText') || t('nav.freeSlotCTA')}
				</a>
			{/if}
			
			<div class="mt-12 flex items-center justify-center gap-4 text-sm font-medium text-text-muted">
				{#if data.settings.githubUrl}
					<a href={data.settings.githubUrl} target="_blank" class="hover:text-text-main transition">GitHub</a>
					<span>•</span>
				{/if}
				{#if data.settings.contactEmail}
					<a href="mailto:{data.settings.contactEmail}" class="hover:text-text-main transition">Email</a>
					<span>•</span>
				{/if}
				{#if data.settings.linkedinUrl}
					<a href={data.settings.linkedinUrl} target="_blank" class="hover:text-text-main transition">LinkedIn</a>
				{/if}
			</div>
		</div>
	</section>

</div>
