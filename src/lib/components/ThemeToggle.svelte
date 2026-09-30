<script>
    import { onMount } from 'svelte';
    import { Moon, Sun } from 'lucide-svelte';
    import { t } from '$lib/i18n/index.js';
    import { isDarkTheme, initTheme, toggleTheme } from '$lib/stores/theme.js';

    onMount(() => {
        initTheme();
    });
</script>

<button
    onclick={toggleTheme}
    type="button"
    class="min-w-[44px] min-h-[44px] flex items-center justify-center p-2.5 rounded-xl text-text-muted hover:text-text-main hover:bg-soft-bg transition-all active:scale-95 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
    aria-label={t('theme.ariaLabel')}
    title={$isDarkTheme ? t('theme.switchToLight') : t('theme.switchToDark')}
>
    {#if $isDarkTheme}
        <Sun size={20} strokeWidth={1.75} />
    {:else}
        <Moon size={20} strokeWidth={1.75} />
    {/if}
</button>
