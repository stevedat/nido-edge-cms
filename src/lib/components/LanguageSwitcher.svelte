<script lang="ts">
	import { getLocale, setLocale, type Locale } from '$lib/i18n/index.js';
	import { Languages } from 'lucide-svelte';

	let current = $derived(getLocale());

	function toggleLanguage() {
		const next: Locale = current === 'vi' ? 'en' : 'vi';
		setLocale(next);
	}
</script>

<div class="inline-flex items-center p-0.5 rounded-full bg-soft-bg border border-border-subtle shadow-2xs">
	<button
		type="button"
		onclick={() => setLocale('vi')}
		class="min-h-[36px] sm:min-h-[28px] min-w-[36px] sm:min-w-[28px] px-2.5 sm:px-2 py-1 rounded-full text-xs sm:text-[11px] font-bold flex items-center justify-center transition-all active:scale-95 cursor-pointer {current === 'vi'
			? 'bg-surface text-text-main shadow-xs border border-border-subtle/80'
			: 'text-text-muted hover:text-text-main'}"
		aria-label={current === 'vi' ? 'Đang dùng Tiếng Việt' : 'Chuyển sang Tiếng Việt'}
		aria-pressed={current === 'vi'}
	>
		VI
	</button>
	<button
		type="button"
		onclick={() => setLocale('en')}
		class="min-h-[36px] sm:min-h-[28px] min-w-[36px] sm:min-w-[28px] px-2.5 sm:px-2 py-1 rounded-full text-xs sm:text-[11px] font-bold flex items-center justify-center transition-all active:scale-95 cursor-pointer {current === 'en'
			? 'bg-surface text-text-main shadow-xs border border-border-subtle/80'
			: 'text-text-muted hover:text-text-main'}"
		aria-label={current === 'en' ? 'English currently active' : 'Switch to English'}
		aria-pressed={current === 'en'}
	>
		EN
	</button>
</div>
