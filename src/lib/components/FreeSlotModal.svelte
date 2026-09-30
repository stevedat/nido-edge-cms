<script lang="ts">
	import { isFreeSlotModalOpen, closeFreeSlotModal, freeSlotModalSource } from '$lib/stores/freeSlot.js';
	import { 
		Loader2, 
		Check,
		Gift,
		Sparkles,
		AlertCircle
	} from 'lucide-svelte';
	import { t } from '$lib/i18n/index.js';
	import Dialog from '$lib/components/ui/Dialog.svelte';

	// Component Props
	let {
		isMaster = true
	}: {
		isMaster?: boolean;
	} = $props();

	// State
	let phone = $state('');
	let email = $state('');
	let name = $state('');
	let field = $state('');
	let note = $state('');
	
	let isSubmitting = $state(false);
	let isSuccess = $state(false);
	let submitError = $state('');
	let websiteTrap = $state(''); // Honeypot for bots

	// Quick Select Options
	const quickFieldOptions = $derived([
		{ label: t('freeSlotModal.fieldOptEnglish') },
		{ label: t('freeSlotModal.fieldOptTech') },
		{ label: t('freeSlotModal.fieldOptOther') }
	]);

	function handleQuickSelectField(selectedLabel: string) {
		field = selectedLabel;
	}

	function handleClose() {
		closeFreeSlotModal();
		setTimeout(() => {
			if (isSuccess) {
				phone = '';
				email = '';
				name = '';
				field = '';
				note = '';
				isSuccess = false;
				submitError = '';
			}
		}, 300);
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		
		if (websiteTrap) {
			console.log("Bot detected. Silently rejecting.");
			isSuccess = true;
			return;
		}

		if (!phone.trim()) {
			submitError = t('freeSlotModal.phoneRequired');
			return;
		}

		isSubmitting = true;
		submitError = '';

		try {
			const res = await fetch('/api/register-free-slot', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					phone,
					email,
					name,
					field,
					note,
					source: $freeSlotModalSource
				})
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || 'Failed to register');
			}

			isSuccess = true;
			
		} catch (err: any) {
			console.error("Free slot registration error:", err);
			submitError = err.message || t('freeSlotModal.submitErrorGeneral');
		} finally {
			isSubmitting = false;
		}
	}

	let modalTitle = $derived(
		isMaster 
			? ($freeSlotModalSource === 'projects_card' ? t('projects.claimSlotProjectBtn') : t('freeSlotModal.defaultTitle'))
			: t('freeSlotModal.contactTitle')
	);
	
	let modalSubtitle = $derived(
		isMaster 
			? t('freeSlotModal.defaultSubtitle') 
			: t('freeSlotModal.contactSubtitle')
	);

	let submitBtnText = $derived(
		isMaster 
			? t('freeSlotModal.submitBtn')
			: t('freeSlotModal.sendRequestBtn')
	);

	let successDesc = $derived(
		isMaster
			? t('freeSlotModal.successDesc')
			: t('freeSlotModal.contactSuccessDesc')
	);
</script>

<Dialog
	bind:open={$isFreeSlotModalOpen}
	title={!isSuccess ? modalTitle : ''}
	description={!isSuccess ? modalSubtitle : ''}
	size="lg"
	preventClose={isSubmitting}
	showCloseButton={true}
	onclose={handleClose}
>
	{#snippet icon()}
		{#if !isSuccess && isMaster}
			<div class="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
				<Gift size={20} strokeWidth={1.75} />
			</div>
		{/if}
	{/snippet}

	{#if !isSuccess}
		<form onsubmit={handleSubmit} class="space-y-6 pt-1">
			{#if submitError}
				<div class="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-start gap-2 animate-in fade-in duration-200">
					<AlertCircle size={16} strokeWidth={1.75} class="mt-0.5 shrink-0" />
					<span>{submitError}</span>
				</div>
			{/if}

			<!-- Honeypot -->
			<div class="hidden" aria-hidden="true">
				<input type="text" name="website_trap" bind:value={websiteTrap} tabindex="-1" autocomplete="off" />
			</div>

			<!-- Phone (Float Label) -->
			<div class="relative pt-4 group">
				<input
					id="reg-phone"
					type="tel"
					required
					placeholder=" "
					bind:value={phone}
					class="peer w-full px-0 py-2 bg-transparent border-0 border-b border-border-subtle focus:border-text-main focus:ring-0 text-text-main text-lg transition-colors placeholder:text-transparent"
				/>
				<label 
					for="reg-phone" 
					class="absolute left-0 top-6 text-text-muted text-base transition-all peer-focus:text-xs peer-focus:top-0 peer-focus:text-text-main peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:top-0 cursor-text flex items-center gap-1"
				>
					{t('freeSlotModal.phoneLabel')} <span class="text-rose-500 font-bold">*</span>
				</label>
			</div>

			<!-- Email (Float Label) -->
			<div class="relative pt-4 group">
				<input
					id="reg-email"
					type="email"
					placeholder=" "
					bind:value={email}
					class="peer w-full px-0 py-2 bg-transparent border-0 border-b border-border-subtle focus:border-text-main focus:ring-0 text-text-main text-lg transition-colors placeholder:text-transparent"
				/>
				<label 
					for="reg-email" 
					class="absolute left-0 top-6 text-text-muted text-base transition-all peer-focus:text-xs peer-focus:top-0 peer-focus:text-text-main peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:top-0 cursor-text flex items-center gap-1"
				>
					{t('freeSlotModal.emailLabel')} 
				</label>
			</div>

			<!-- Name (Float Label) -->
			<div class="relative pt-4 group">
				<input
					id="reg-name"
					type="text"
					placeholder=" "
					bind:value={name}
					class="peer w-full px-0 py-2 bg-transparent border-0 border-b border-border-subtle focus:border-text-main focus:ring-0 text-text-main text-lg transition-colors placeholder:text-transparent"
				/>
				<label 
					for="reg-name" 
					class="absolute left-0 top-6 text-text-muted text-base transition-all peer-focus:text-xs peer-focus:top-0 peer-focus:text-text-main peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:top-0 cursor-text flex items-center gap-1"
				>
					{t('freeSlotModal.nameLabel')}
				</label>
			</div>

			<!-- Field (Float Label with Chips) -->
			<div class="space-y-3 pt-3">
				<div class="relative group">
					<input
						id="reg-field"
						type="text"
						placeholder=" "
						bind:value={field}
						class="peer w-full px-0 py-2 bg-transparent border-0 border-b border-border-subtle focus:border-text-main focus:ring-0 text-text-main text-lg transition-colors placeholder:text-transparent"
					/>
					<label 
						for="reg-field" 
						class="absolute left-0 top-2 text-text-muted text-base transition-all peer-focus:text-xs peer-focus:-top-4 peer-focus:text-text-main peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-4 cursor-text flex items-center gap-1"
					>
						{isMaster ? t('freeSlotModal.fieldLabel') : t('freeSlotModal.tenantFieldLabel')}
					</label>
				</div>
				
				<!-- Quick-Select Chips -->
				<div class="flex flex-wrap gap-2 pt-1">
					{#each quickFieldOptions as opt}
						<button
							type="button"
							onclick={() => handleQuickSelectField(opt.label)}
							class="px-3.5 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 cursor-pointer border {field === opt.label ? 'bg-text-main text-main-bg border-text-main' : 'bg-transparent text-text-muted border-border-subtle hover:border-text-main hover:text-text-main'}"
						>
							{opt.label}
						</button>
					{/each}
				</div>
			</div>

			<!-- Note (Float Label Textarea) -->
			<div class="relative pt-4 group">
				<textarea
					id="reg-note"
					rows="2"
					placeholder=" "
					bind:value={note}
					class="peer w-full px-0 py-2 bg-transparent border-0 border-b border-border-subtle focus:border-text-main focus:ring-0 text-text-main text-base sm:text-lg transition-colors placeholder:text-transparent resize-none"
				></textarea>
				<label 
					for="reg-note" 
					class="absolute left-0 top-6 text-text-muted text-base transition-all peer-focus:text-xs peer-focus:top-0 peer-focus:text-text-main peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:top-0 cursor-text flex items-center gap-1"
				>
					{isMaster ? t('freeSlotModal.noteLabel') : t('freeSlotModal.tenantNoteLabel')}
				</label>
			</div>

			<!-- Submit Button -->
			<div class="pt-4 pb-2">
				<button
					type="submit"
					disabled={isSubmitting}
					class="w-full min-h-[48px] py-3.5 px-6 rounded-2xl bg-text-main text-main-bg hover:opacity-90 disabled:opacity-50 font-semibold text-sm transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
				>
					{#if isSubmitting}
						<Loader2 strokeWidth={1.75} size={18} class="animate-spin" />
						<span>{t('freeSlotModal.submittingBtn')}</span>
					{:else}
						<Sparkles size={18} strokeWidth={1.75} />
						<span>{submitBtnText}</span>
					{/if}
				</button>
			</div>
		</form>
	{:else}
		<!-- Success Screen -->
		<div class="py-8 text-center space-y-5 animate-in zoom-in duration-300">
			<div class="inline-flex items-center justify-center size-16 rounded-full border-2 border-primary text-primary mx-auto mb-2">
				<Check size={32} strokeWidth={2.25} />
			</div>

			<div class="space-y-3 max-w-sm mx-auto">
				<h4 class="text-2xl font-serif text-text-main font-bold">
					{t('freeSlotModal.successTitle')}
				</h4>
				<p class="text-sm text-text-muted leading-relaxed">
					{successDesc}
				</p>
			</div>

			<button
				type="button"
				onclick={handleClose}
				class="mt-6 min-h-[44px] px-8 py-2.5 rounded-xl bg-soft-bg text-text-main text-sm font-semibold hover:bg-surface border border-border-subtle hover:border-border-strong active:scale-95 transition-all cursor-pointer"
			>
				{t('freeSlotModal.closeBtn')}
			</button>
		</div>
	{/if}
</Dialog>
