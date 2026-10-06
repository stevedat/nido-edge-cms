<script>
    import { Wand2, Key, Play, Terminal, ArrowRight, LayoutTemplate } from 'lucide-svelte';
    import { t } from '$lib/i18n/index';
</script>

<svelte:head>
    <title>{t('onboarding.title') || 'Khởi tạo Cỗ Máy | Nido Edge CMS'}</title>
</svelte:head>

<div class="min-h-screen bg-main-bg text-text-main font-sans selection:bg-primary/30">
    <div class="max-w-4xl mx-auto px-6 py-20 space-y-12">
        <!-- Hero Section -->
        <header class="text-center space-y-6">
            <div class="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
                <Wand2 size={32} strokeWidth={1.75} class="text-primary" />
            </div>
            <h1 class="text-4xl sm:text-5xl font-bold tracking-tight">{t('onboarding.title')}</h1>
            <p class="text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
                {t('onboarding.description')}
            </p>
        </header>

        <!-- Demo Prompts (Gợi ý Mẫu) -->
        <section class="space-y-6">
            <div class="flex items-center gap-2 px-2">
                <LayoutTemplate size={20} strokeWidth={1.75} class="text-primary" />
                <h2 class="text-xl font-semibold">{t('onboarding.demoPrompts')}</h2>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Prompt 1 -->
                <div class="bg-surface border border-border-subtle p-5 rounded-2xl hover:border-primary/50 transition-all group">
                    <h3 class="font-medium mb-2 text-primary group-hover:underline">{t('onboarding.prompt1Title')}</h3>
                    <p class="text-sm text-text-muted">
                        {t('onboarding.prompt1Desc')}
                    </p>
                </div>
                <!-- Prompt 2 -->
                <div class="bg-surface border border-border-subtle p-5 rounded-2xl hover:border-primary/50 transition-all group">
                    <h3 class="font-medium mb-2 text-primary group-hover:underline">{t('onboarding.prompt2Title')}</h3>
                    <p class="text-sm text-text-muted">
                        {t('onboarding.prompt2Desc')}
                    </p>
                </div>
                <!-- Prompt 3 -->
                <div class="bg-surface border border-border-subtle p-5 rounded-2xl hover:border-primary/50 transition-all group">
                    <h3 class="font-medium mb-2 text-primary group-hover:underline">{t('onboarding.prompt3Title')}</h3>
                    <p class="text-sm text-text-muted">
                        {t('onboarding.prompt3Desc')}
                    </p>
                </div>
                <!-- Prompt 4 -->
                <div class="bg-surface border border-border-subtle p-5 rounded-2xl hover:border-primary/50 transition-all group">
                    <h3 class="font-medium mb-2 text-primary group-hover:underline">{t('onboarding.prompt4Title')}</h3>
                    <p class="text-sm text-text-muted">
                        {t('onboarding.prompt4Desc')}
                    </p>
                </div>
            </div>
        </section>

        <!-- Onboarding & Call to Action -->
        <section class="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-8 rounded-3xl text-center space-y-6">
            <h2 class="text-2xl font-bold">{t('onboarding.startBuilding')}</h2>
            <div class="text-left max-w-lg mx-auto space-y-4 text-text-muted">
                <div class="flex items-start gap-3">
                    <div class="w-6 h-6 rounded-full bg-surface border border-border-strong flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
                    <p>{@html t('onboarding.step1')}</p>
                </div>
                <div class="flex items-start gap-3">
                    <div class="w-6 h-6 rounded-full bg-surface border border-border-strong flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                    <p>{t('onboarding.step2')} <code class="bg-surface px-2 py-1 rounded text-primary font-mono text-sm">ADMIN_PASSWORD</code></p>
                </div>
                <div class="flex items-start gap-3">
                    <div class="w-6 h-6 rounded-full bg-surface border border-border-strong flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
                    <p>{t('onboarding.step3')}</p>
                </div>
            </div>
            
            <div class="pt-4">
                <a href="/admin/builder" class="inline-flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-full font-medium hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-xl">
                    {t('onboarding.goToBuilder')}
                    <ArrowRight size={18} strokeWidth={1.75} />
                </a>
            </div>
        </section>

        <!-- Footer Note -->
        <p class="text-center text-sm text-text-muted">
            {t('onboarding.footerNote')}
        </p>
    </div>
</div>
