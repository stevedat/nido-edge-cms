<script lang="ts">
	import { t } from '$lib/i18n/index.js';
	import { 
		PenSquare, 
		Film, 
		PlusSquare, 
		Settings, 
		MessageSquare,
		ArrowRight
	} from 'lucide-svelte';

	let { user } = $props();

	const actions = [
		{
			title: t('admin.quickActions.newBlogTitle', { defaultValue: 'Write new blog post' }),
			description: t('admin.quickActions.newBlogDesc', { defaultValue: 'Draft professional article' }),
			icon: PenSquare,
			href: '/admin/posts/new',
			color: 'text-indigo-600 dark:text-indigo-400',
			bg: 'bg-indigo-50 dark:bg-indigo-950/60',
			border: 'hover:border-indigo-200 dark:hover:border-indigo-800'
		},
		{
			title: t('admin.quickActions.newProjectTitle', { defaultValue: 'Add new project' }),
			description: t('admin.quickActions.newProjectDesc', { defaultValue: 'Update product & showcase' }),
			icon: PlusSquare,
			href: '/admin/projects/new',
			color: 'text-purple-600 dark:text-purple-400',
			bg: 'bg-purple-50 dark:bg-purple-950/60',
			border: 'hover:border-purple-200 dark:hover:border-purple-800'
		},
		{
			title: t('admin.quickActions.newVideoTitle', { defaultValue: 'Upload video' }),
			description: t('admin.quickActions.newVideoDesc', { defaultValue: 'Add tutorial & demo video' }),
			icon: Film,
			href: '/admin/videos/new',
			color: 'text-rose-600 dark:text-rose-400',
			bg: 'bg-rose-50 dark:bg-rose-950/60',
			border: 'hover:border-rose-200 dark:hover:border-rose-800'
		},
		{
			title: t('admin.quickActions.commentsTitle', { defaultValue: 'Moderate comments' }),
			description: t('admin.quickActions.commentsDesc', { defaultValue: 'View reader feedback' }),
			icon: MessageSquare,
			href: '/admin/comments',
			color: 'text-amber-600 dark:text-amber-400',
			bg: 'bg-amber-50 dark:bg-amber-950/60',
			border: 'hover:border-amber-200 dark:hover:border-amber-800'
		}
	];
</script>

<div class="rounded-3xl bg-surface border border-border-subtle p-6 space-y-4 shadow-2xs">
	<div class="pb-2 border-b border-border-subtle">
		<h3 class="text-sm font-bold text-text-main">{t('admin.quickActions.studioActions', { defaultValue: 'Studio Quick Actions' })}</h3>
		<p class="text-xs text-text-muted">{t('admin.quickActions.studioDesc', { defaultValue: 'Quick access to content creation features' })}</p>
	</div>
	
	<div class="grid grid-cols-1 gap-2.5">
		{#each actions as action}
			{@const Icon = action.icon}
			<a 
				href={action.href}
				class="group flex items-center justify-between p-3 rounded-2xl border border-border-subtle {action.border} transition-all duration-200 hover:bg-soft-bg"
			>
				<div class="flex items-center gap-3 min-w-0">
					<div class="size-10 flex-shrink-0 flex items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 {action.bg} {action.color}">
						<Icon class="size-4" strokeWidth={2.2} />
					</div>
					<div class="min-w-0">
						<p class="font-bold text-text-main text-xs leading-snug group-hover:text-primary transition-colors">{action.title}</p>
						<p class="text-[11px] text-text-muted truncate">{action.description}</p>
					</div>
				</div>

				<ArrowRight strokeWidth={1.75} size={13} class="text-text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
			</a>
		{/each}
	</div>
</div>