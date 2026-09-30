<script lang="ts">
	import { t } from '$lib/i18n/index.js';

	interface User {
		name?: string;
		username?: string;
		avatar?: string;
	}

	interface Activity {
		action: string;
		resource: string;
		createdAt: string | Date;
		user?: User;
	}

	interface Props {
		activities?: Activity[];
	}

	let { activities = [] }: Props = $props();

	function getActionIcon(action: string): string {
		switch (action) {
			case 'CREATE': return '➕';
			case 'UPDATE': return '✏️';
			case 'DELETE': return '🗑️';
			case 'LOGIN': return '🔐';
			case 'LOGOUT': return '🚪';
			case 'UPLOAD': return '📤';
			default: return '📝';
		}
	}

	function getActionColor(action: string): string {
		switch (action) {
			case 'CREATE': return 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400';
			case 'UPDATE': return 'text-blue-600 bg-blue-500/10 dark:text-blue-400';
			case 'DELETE': return 'text-red-600 bg-red-500/10 dark:text-red-400';
			case 'LOGIN': return 'text-purple-600 bg-purple-500/10 dark:text-purple-400';
			case 'LOGOUT': return 'text-text-muted bg-soft-bg';
			case 'UPLOAD': return 'text-amber-600 bg-amber-500/10 dark:text-amber-400';
			default: return 'text-text-body bg-soft-bg';
		}
	}

	function formatAction(action: string, resource: string): string {
		const actionText = t(`admin.activity.${action}`) || action.toLowerCase();
		const resourceText = t(`admin.activity.${resource}`) || resource;
		return `${actionText} ${resourceText}`;
	}

	function formatTime(date: string | Date): string {
		const now = new Date();
		const diff = now.getTime() - new Date(date).getTime();
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(diff / 3600000);
		const days = Math.floor(diff / 86400000);

		if (minutes < 1) return t('common.justNow');
		if (minutes < 60) return t('common.minutesAgo', { m: minutes });
		if (hours < 24) return t('common.hoursAgo', { h: hours });
		return t('common.daysAgo', { d: days });
	}
</script>

<div class="rounded-3xl bg-surface border border-border-subtle p-6 shadow-sm">
	<div class="mb-6 flex items-center justify-between">
		<h3 class="text-lg font-bold text-text-main">{t('admin.dashboard.recentActivity')}</h3>
		<span class="text-xs font-semibold text-text-muted">Log</span>
	</div>

	{#if activities.length > 0}
		<div class="space-y-4">
			{#each activities as activity}
				<div class="flex items-start gap-3">
					<div class="flex size-8 items-center justify-center rounded-full {getActionColor(activity.action)}">
						<span class="text-xs">{getActionIcon(activity.action)}</span>
					</div>
					
					<div class="flex-1 min-w-0">
						<div class="flex items-center gap-2">
							{#if activity.user}
								<span class="font-bold text-text-main text-xs sm:text-sm">
									{activity.user.name || activity.user.username}
								</span>
							{:else}
								<span class="font-bold text-text-main text-xs sm:text-sm">System</span>
							{/if}
							<span class="text-xs sm:text-sm text-text-body">
								{formatAction(activity.action, activity.resource)}
							</span>
						</div>
						
						<p class="text-[11px] text-text-muted mt-0.5">
							{formatTime(activity.createdAt)}
						</p>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="text-center py-8 space-y-2">
			<div class="text-3xl">📝</div>
			<p class="text-xs text-text-muted">{t('admin.dashboard.noActivity')}</p>
		</div>
	{/if}
</div>