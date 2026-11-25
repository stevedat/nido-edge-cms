<script lang="ts">
	import { getLocale, setLocale, t } from '$lib/i18n/index.js';

	let current = $derived(getLocale());
</script>

<div
	class="inline-flex items-center p-0.5 rounded-full bg-soft-bg border border-border-subtle shadow-2xs"
>
	<button
		type="button"
		onclick={() => setLocale('vi')}
		class="min-h-[36px] sm:min-h-[28px] min-w-[36px] sm:min-w-[28px] px-2.5 sm:px-2 py-1 rounded-full text-xs sm:text-[11px] font-bold flex items-center justify-center transition-all active:scale-95 cursor-pointer {current ===
		'vi'
			? 'bg-surface text-text-main shadow-xs border border-border-subtle/80'
			: 'text-text-muted hover:text-text-main'}"
		aria-label={current === 'vi' ? t('nav.viActive') : t('nav.switchToVi')}
		aria-pressed={current === 'vi'}
	>
		VI
	</button>
	<button
		type="button"
		onclick={() => setLocale('en')}
		class="min-h-[36px] sm:min-h-[28px] min-w-[36px] sm:min-w-[28px] px-2.5 sm:px-2 py-1 rounded-full text-xs sm:text-[11px] font-bold flex items-center justify-center transition-all active:scale-95 cursor-pointer {current ===
		'en'
			? 'bg-surface text-text-main shadow-xs border border-border-subtle/80'
			: 'text-text-muted hover:text-text-main'}"
		aria-label={current === 'en' ? t('nav.enActive') : t('nav.switchToEn')}
		aria-pressed={current === 'en'}
	>
		EN
	</button>
</div>
