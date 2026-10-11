<script>
	import { t } from '$lib/i18n/index';
	import { Sparkles, Key, Wand2, Loader2, Play, Code, Copy, Check } from 'lucide-svelte';
	import { onMount } from 'svelte';

	let prompt = $state('');
	let apiKey = $state('');
	let provider = $state('gemini'); // gemini | claude | openai

	let mode = $state('auto'); // auto | manual
	let manualPayload = $state('');
	let systemPrompt = $state('');
	let copied = $state(false);

	let isGenerating = $state(false);
	let result = $state(null);
	let error = $state('');

	onMount(async () => {
		try {
			const res = await fetch('/api/v1/builder/generate');
			if (res.ok) {
				const data = await res.json();
				systemPrompt = data.systemPrompt;
			}
		} catch (e) {}
	});

	async function copyPrompt() {
		const reqLabel = t('builder.promptRequirementLabel');
		const reqFallback = t('builder.promptRequirementFallback');
		const fullPrompt = `${systemPrompt}\n\n${reqLabel}\n${prompt || reqFallback}`;
		await navigator.clipboard.writeText(fullPrompt);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	async function handleGenerate() {
		if (mode === 'auto' && (!prompt || !apiKey)) {
			error = t('builder.missingAutoFields');
			return;
		}
		if (mode === 'manual' && !manualPayload) {
			error = t('builder.missingManualPayload');
			return;
		}

		isGenerating = true;
		error = '';
		result = null;

		try {
			const res = await fetch('/api/v1/builder/generate', {
				method: 'POST',
				body: JSON.stringify({ mode, prompt, apiKey, provider, manualPayload }),
				headers: { 'Content-Type': 'application/json' }
			});

			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.message || t('builder.generateError'));
			}

			result = data;
		} catch (/** @type {any} */ err) {
			error = err.message;
		} finally {
			isGenerating = false;
		}
	}
</script>

<div class="max-w-4xl mx-auto space-y-6 pb-20">
	<!-- Header -->
	<header class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-2xl font-bold text-text-main flex items-center gap-2">
				<Sparkles size={24} strokeWidth={1.75} class="text-primary" />
				{t('builder.title')}
			</h1>
			<p class="text-text-muted mt-1">
				{t('builder.description')}
			</p>
		</div>
	</header>

	<!-- Tabs -->
	<div class="flex gap-2 p-1 bg-surface border border-border-subtle rounded-xl w-fit">
		<button
			onclick={() => (mode = 'auto')}
			class="px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-medium transition-all active:scale-95 {mode ===
			'auto'
				? 'bg-primary text-white shadow-sm'
				: 'text-text-muted hover:text-text-main hover:bg-soft-bg'}"
		>
			{t('builder.autoTab')}
		</button>
		<button
			onclick={() => (mode = 'manual')}
			class="px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-medium transition-all active:scale-95 {mode ===
			'manual'
				? 'bg-primary text-white shadow-sm'
				: 'text-text-muted hover:text-text-main hover:bg-soft-bg'}"
		>
			{t('builder.manualTab')}
		</button>
	</div>

	<!-- Builder Form -->
	<div class="bg-surface border border-border-subtle rounded-3xl p-6 lg:p-8 space-y-6">
		{#if mode === 'auto'}
			<!-- Auto Mode -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div class="space-y-2">
					<label class="block text-sm font-medium text-text-muted" for="provider">
						{t('builder.provider')}
					</label>
					<select
						id="provider"
						bind:value={provider}
						class="w-full bg-main-bg border border-border-subtle rounded-xl px-4 min-h-[44px] text-text-main focus:border-primary focus:outline-none transition-all"
					>
						<option value="gemini">{t('builder.geminiOption')}</option>
						<option value="claude">{t('builder.claudeOption')}</option>
						<option value="openai">{t('builder.openaiOption')}</option>
					</select>
				</div>

				<div class="space-y-2">
					<label
						class="block text-sm font-medium text-text-muted flex items-center gap-1"
						for="apiKey"
					>
						<Key size={14} strokeWidth={1.75} />
						{t('builder.api_key')}
					</label>
					<input
						id="apiKey"
						type="password"
						bind:value={apiKey}
						placeholder={t('builder.apiKeyPlaceholder')}
						class="w-full bg-main-bg border border-border-subtle rounded-xl px-4 min-h-[44px] text-text-main focus:border-primary focus:outline-none transition-all"
					/>
				</div>
			</div>
		{/if}

		{#if mode === 'manual'}
			<!-- Manual Mode Info -->
			<div class="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl space-y-3">
				<h3 class="text-indigo-400 font-medium text-sm">{t('builder.manualGuideTitle')}</h3>
				<ol class="text-text-muted text-sm list-decimal pl-4 space-y-1">
					<li>{t('builder.manualStep1')}</li>
					<li>{t('builder.manualStep2')} <strong>{t('builder.manualStep2Btn')}</strong>.</li>
					<li>{t('builder.manualStep3')}</li>
					<li>{t('builder.manualStep4')} <strong>{t('builder.manualStep4Target')}</strong>.</li>
				</ol>
			</div>
		{/if}

		<!-- Prompt -->
		<div class="space-y-2">
			<label class="block text-sm font-medium text-text-muted flex items-center gap-1" for="prompt">
				<Wand2 size={14} strokeWidth={1.75} />
				{t('builder.prompt')}
			</label>
			<textarea
				id="prompt"
				bind:value={prompt}
				placeholder={t('builder.promptPlaceholder')}
				rows="3"
				class="w-full bg-main-bg border border-border-subtle rounded-xl p-4 text-text-main focus:border-primary focus:outline-none transition-all resize-none"
			></textarea>

			{#if mode === 'manual'}
				<div class="flex justify-end pt-1">
					<button
						onclick={copyPrompt}
						class="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-soft-bg text-text-main hover:bg-border-subtle transition-all active:scale-95 min-h-[36px]"
					>
						{#if copied}
							<Check strokeWidth={2.25} size={14} class="text-green-500" />
							{t('builder.copiedPrompt')}
						{:else}
							<Copy strokeWidth={1.75} size={14} /> {t('builder.copyPromptBtn')}
						{/if}
					</button>
				</div>
			{/if}
		</div>

		{#if mode === 'manual'}
			<div class="space-y-2 pt-4 border-t border-border-subtle">
				<label
					class="block text-sm font-medium text-text-muted flex items-center gap-1"
					for="manualPayload"
				>
					<Code size={14} strokeWidth={1.75} />
					{t('builder.manualJsonLabel')}
				</label>
				<textarea
					id="manualPayload"
					bind:value={manualPayload}
					placeholder={t('builder.manualJsonPlaceholder')}
					rows="6"
					class="w-full bg-main-bg border border-border-subtle rounded-xl p-4 text-text-main font-mono text-xs focus:border-primary focus:outline-none transition-all resize-none"
				></textarea>
			</div>
		{/if}

		<!-- Actions -->
		<div class="flex items-center justify-end pt-4 border-t border-border-subtle">
			<button
				onclick={handleGenerate}
				disabled={isGenerating ||
					(mode === 'auto' && (!prompt || !apiKey)) ||
					(mode === 'manual' && !manualPayload)}
				class="flex items-center gap-2 bg-primary text-white font-medium px-6 py-2.5 rounded-full hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 min-h-[44px]"
			>
				{#if isGenerating}
					<Loader2 size={18} strokeWidth={1.75} class="animate-spin" />
					{mode === 'manual' ? t('builder.generatingManual') : t('builder.generatingAuto')}
				{:else}
					<Play size={18} strokeWidth={1.75} />
					{mode === 'manual' ? t('builder.updateWebBtn') : t('builder.generateAutoBtn')}
				{/if}
			</button>
		</div>
	</div>

	<!-- Error Message -->
	{#if error}
		<div
			class="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex items-start gap-3"
		>
			<p class="text-sm">{error}</p>
		</div>
	{/if}

	<!-- Success Message -->
	{#if result}
		<div class="bg-green-500/10 border border-green-500/20 p-6 rounded-3xl space-y-4">
			<h3 class="text-green-400 font-medium flex items-center gap-2">
				<Check size={18} strokeWidth={2.25} />
				{t('builder.successTitle')}
			</h3>
			<ul class="text-text-muted space-y-2 text-sm list-disc pl-5">
				<li>{t('builder.successItem1')}</li>
				<li>{t('builder.successItem2')}</li>
			</ul>
			<div class="flex gap-4 pt-2">
				<a href="/" target="_blank" class="text-primary hover:underline text-sm font-medium"
					>{t('builder.viewWebsite')}</a
				>
			</div>
		</div>
	{/if}
</div>
