<script lang="ts">
	import { 
		MessageSquare, 
		Send, 
		Check, 
		AlertCircle, 
		Clock, 
		CornerDownRight, 
		Sparkles, 
		X, 
		UserCheck,
		ShieldCheck
	} from 'lucide-svelte';
	import { t, getLocale } from '$lib/i18n/index.js';

	interface CommentItem {
		id: string;
		name: string;
		email?: string;
		content: string;
		createdAt: string;
		parentId?: string;
		replyToName?: string;
		isAuthor?: boolean;
	}

	interface AntiSpamChallenge {
		challenge: string;
		token: string;
		salt: string;
		difficulty: string;
		timestamp: number;
	}

	let { 
		comments = [], 
		slug,
		isAdmin = false,
		adminName = 'Admin',
		antiSpamChallenge = null
	}: { 
		comments?: CommentItem[]; 
		slug: string;
		isAdmin?: boolean;
		adminName?: string;
		antiSpamChallenge?: AntiSpamChallenge | null;
	} = $props();

	// Main comment state using Svelte 5 Runes
	let commentList = $state<CommentItem[]>([...comments]);
	let name = $state(isAdmin ? adminName : '');
	let email = $state('');
	let content = $state('');
	let isSubmitting = $state(false);
	let errorMessage = $state('');
	let successMessage = $state('');

	// Anti-bot state & honeypots
	let currentChallenge = $state<AntiSpamChallenge | null>(antiSpamChallenge);
	let honeypotWebsite = $state('');
	let honeypotPhone = $state('');

	// Inline reply state
	let replyingToId = $state<string | null>(null);
	let replyingToName = $state<string | null>(null);
	let replyName = $state(isAdmin ? adminName : '');
	let replyEmail = $state('');
	let replyContent = $state('');
	let replyHoneypotWebsite = $state('');
	let replyHoneypotPhone = $state('');
	let isSubmittingReply = $state(false);
	let replyError = $state('');

	// Root comments (no parentId)
	let rootComments = $derived(
		commentList.filter(c => !c.parentId)
	);

	function getReplies(parentId: string) {
		return commentList
			.filter(c => c.parentId === parentId)
			.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
	}

	// Pastel colors for avatar initials
	const avatarColors = [
		'bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200/60 dark:border-blue-700/60',
		'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-700/60',
		'bg-amber-50 text-amber-600 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200/60 dark:border-amber-700/60',
		'bg-purple-50 text-purple-600 dark:bg-purple-950/70 dark:text-purple-300 border-purple-200/60 dark:border-purple-700/60',
		'bg-rose-50 text-rose-600 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200/60 dark:border-rose-700/60',
		'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/70 dark:text-cyan-300 border-cyan-200/60 dark:border-cyan-700/60',
	];

	function getAvatarColor(userName: string, isAuthor?: boolean): string {
		if (isAuthor) {
			return 'bg-primary/10 text-primary border-primary/30 dark:bg-primary/20 dark:text-primary-light';
		}
		let hash = 0;
		for (let i = 0; i < userName.length; i++) {
			hash = userName.charCodeAt(i) + ((hash << 5) - hash);
		}
		const index = Math.abs(hash) % avatarColors.length;
		return avatarColors[index];
	}

	function getInitials(userName: string): string {
		const parts = userName.trim().split(/\s+/);
		if (parts.length >= 2) {
			return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
		}
		return (userName.slice(0, 2) || 'U').toUpperCase();
	}

	function formatCommentTime(dateString: string): string {
		try {
			const date = new Date(dateString);
			const now = new Date();
			const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

			if (diffSeconds < 60) return t('comments.justNow');
			if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} ${t('comments.minutesAgo')}`;
			if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} ${t('comments.hoursAgo')}`;
			if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)} ${t('comments.daysAgo')}`;

			const localeCode = getLocale() === 'vi' ? 'vi-VN' : 'en-US';
			return date.toLocaleDateString(localeCode, {
				day: 'numeric',
				month: 'numeric',
				year: 'numeric'
			});
		} catch {
			return t('comments.justNow');
		}
	}

	function startReply(targetId: string, targetName: string) {
		replyingToId = targetId;
		replyingToName = targetName;
		replyContent = '';
		replyError = '';
		replyHoneypotWebsite = '';
		replyHoneypotPhone = '';
		if (isAdmin && !replyName) replyName = adminName;
	}

	function cancelReply() {
		replyingToId = null;
		replyingToName = null;
		replyContent = '';
		replyError = '';
	}

	/**
	 * Solve zero-friction Proof-of-Work challenge in browser
	 * Runs in ~10-25ms, completely imperceptible to human users
	 */
	async function solvePoW(challengeStr: string): Promise<number> {
		if (typeof window === 'undefined' || !window.crypto?.subtle) {
			return 0;
		}

		const encoder = new TextEncoder();
		let nonce = 0;
		while (true) {
			const data = encoder.encode(challengeStr + nonce);
			const hashBuffer = await crypto.subtle.digest('SHA-256', data);
			const hashArray = new Uint8Array(hashBuffer);

			// Check if first 3 hex chars are '000' (byte 0 is 0, byte 1 < 16)
			if (hashArray[0] === 0 && hashArray[1] < 16) {
				return nonce;
			}
			nonce++;
			if (nonce > 500000) return nonce; // Safety guard
		}
	}

	/**
	 * Get or refresh anti-spam challenge token
	 */
	async function getChallenge(): Promise<AntiSpamChallenge | null> {
		if (currentChallenge) {
			const age = Date.now() - currentChallenge.timestamp;
			if (age < 23 * 3600 * 1000) {
				return currentChallenge;
			}
		}

		try {
			const res = await fetch(`/api/comments/challenge?slug=${encodeURIComponent(slug)}`);
			const data = await res.json();
			if (data.success) {
				currentChallenge = data;
				return data;
			}
		} catch (err) {
			console.error('Lỗi khi lấy mã bảo vệ chống bot:', err);
		}
		return null;
	}

	async function refreshChallenge() {
		try {
			const res = await fetch(`/api/comments/challenge?slug=${encodeURIComponent(slug)}`);
			const data = await res.json();
			if (data.success) {
				currentChallenge = data;
			}
		} catch {
			// Silent error
		}
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		errorMessage = '';
		successMessage = '';

		if (!name.trim()) {
			errorMessage = t('comments.namePlaceholder');
			return;
		}

		if (!content.trim()) {
			errorMessage = t('comments.contentPlaceholder');
			return;
		}

		isSubmitting = true;

		try {
			let token: string | undefined;
			let nonce: number | undefined;

			// Solve invisible Proof-of-Work for guests
			if (!isAdmin) {
				const challengeObj = await getChallenge();
				if (challengeObj) {
					token = challengeObj.token;
					nonce = await solvePoW(challengeObj.challenge);
				}
			}

			const payload = {
				slug,
				name: name.trim(),
				email: email.trim() || undefined,
				content: content.trim(),
				honeypot_website: honeypotWebsite,
				honeypot_phone: honeypotPhone,
				token,
				nonce
			};

			const res = await fetch('/api/comments', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || t('common.error'));
			}

			if (data.success && data.comment) {
				commentList = [data.comment, ...commentList];
				successMessage = data.message || t('comments.successMsg');
				content = '';
				if (!isAdmin) email = '';
				// Refresh challenge for next potential submission
				refreshChallenge();
			} else {
				successMessage = data.message || t('comments.successMsg');
			}
		} catch (err: any) {
			errorMessage = err.message || t('common.error');
		} finally {
			isSubmitting = false;
		}
	}

	async function handleReplySubmit(event: SubmitEvent, parentId: string) {
		event.preventDefault();
		replyError = '';

		if (!replyName.trim()) {
			replyError = t('comments.namePlaceholder');
			return;
		}

		if (!replyContent.trim()) {
			replyError = t('comments.contentPlaceholder');
			return;
		}

		isSubmittingReply = true;

		try {
			let token: string | undefined;
			let nonce: number | undefined;

			if (!isAdmin) {
				const challengeObj = await getChallenge();
				if (challengeObj) {
					token = challengeObj.token;
					nonce = await solvePoW(challengeObj.challenge);
				}
			}

			const res = await fetch('/api/comments', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					slug,
					name: replyName.trim(),
					email: replyEmail.trim() || undefined,
					content: replyContent.trim(),
					parentId,
					website: replyHoneypotWebsite,
					phone_number: replyHoneypotPhone,
					token,
					nonce
				})
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || t('comments.errorReplyGeneric'));
			}

			if (data.success && data.comment) {
				commentList = [...commentList, data.comment];
				cancelReply();
				refreshChallenge();
			}
		} catch (err: any) {
			replyError = err.message || t('comments.errorReplyGeneric');
		} finally {
			isSubmittingReply = false;
		}
	}
</script>

<section class="max-w-2xl mx-auto pt-12 pb-16 border-t border-border-subtle mt-16" id="comments">
	<!-- Section Header -->
	<div class="flex items-center justify-between mb-8">
		<div class="flex items-center gap-3">
			<div class="w-9 h-9 rounded-xl bg-soft-bg flex items-center justify-center text-text-main">
				<MessageSquare size={18} strokeWidth={1.75} />
			</div>
			<h2 class="text-2xl font-bold text-text-main tracking-tight">
				{t('comments.title')}
			</h2>
		</div>
		<span class="px-3 py-1 text-xs font-semibold rounded-full bg-soft-bg text-text-muted border border-border-subtle">
			{commentList.length} {t('comments.count')}
		</span>
	</div>

	<!-- Form gửi bình luận chính -->
	<form 
		onsubmit={handleSubmit}
		class="mb-12 p-5 sm:p-6 rounded-2xl bg-surface border border-border-subtle shadow-sm space-y-4 transition-colors"
	>
		<!-- Admin badge banner if logged in as Author -->
		{#if isAdmin}
			<div class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary/10 text-primary text-xs font-medium border border-primary/20">
				<UserCheck size={14} strokeWidth={1.75} class="shrink-0" />
				<span>{adminName} ({t('comments.adminBadge')})</span>
			</div>
		{/if}

		<!-- Anti-bot Off-screen Honeypot Traps (CSS off-screen, completely invisible to humans) -->
		<div 
			style="position: absolute; left: -9999px; top: -9999px; width: 1px; height: 1px; opacity: 0; pointer-events: none; overflow: hidden;"
			aria-hidden="true"
			tabindex="-1"
		>
			<label for="honeypot-website">Website</label>
			<input 
				type="text" 
				id="honeypot-website" 
				name="website" 
				bind:value={honeypotWebsite} 
				tabindex="-1" 
				autocomplete="off" 
			/>
			<label for="honeypot-phone">Phone</label>
			<input 
				type="text" 
				id="honeypot-phone" 
				name="phone_number" 
				bind:value={honeypotPhone} 
				tabindex="-1" 
				autocomplete="off" 
			/>
		</div>

		<!-- Ô nhập nội dung -->
		<div>
			<label for="comment-content" class="sr-only">{t('comments.contentLabel')}</label>
			<textarea
				id="comment-content"
				bind:value={content}
				placeholder={t('comments.contentPlaceholder')}
				rows={3}
				disabled={isSubmitting}
				maxlength={2000}
				required
				class="w-full rounded-xl bg-soft-bg/60 border border-border-subtle p-3.5 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-surface transition-all resize-none leading-relaxed"
			></textarea>
			<div class="flex justify-end mt-1 text-[11px] text-text-muted">
				{content.length}/2000
			</div>
		</div>

		<!-- Tên và Email -->
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
			<div>
				<label for="comment-name" class="sr-only">{t('comments.nameLabel')}</label>
				<input
					id="comment-name"
					type="text"
					bind:value={name}
					placeholder={t('comments.namePlaceholder')}
					disabled={isSubmitting || isAdmin}
					maxlength={60}
					required
					class="w-full rounded-xl bg-soft-bg/60 border border-border-subtle px-3.5 py-2.5 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-surface transition-all disabled:opacity-60"
				/>
			</div>
			<div>
				<label for="comment-email" class="sr-only">{t('comments.emailLabel')}</label>
				<input
					id="comment-email"
					type="email"
					bind:value={email}
					placeholder={t('comments.emailPlaceholder')}
					disabled={isSubmitting}
					maxlength={100}
					class="w-full rounded-xl bg-soft-bg/60 border border-border-subtle px-3.5 py-2.5 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-surface transition-all"
				/>
			</div>
		</div>

		<!-- Thông báo trạng thái -->
		{#if errorMessage}
			<div class="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs border border-rose-200 dark:border-rose-900/50">
				<AlertCircle size={15} strokeWidth={1.75} class="shrink-0" />
				<span>{errorMessage}</span>
			</div>
		{/if}

		{#if successMessage}
			<div class="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs border border-emerald-200 dark:border-emerald-900/50">
				<Check size={14} strokeWidth={2.25} class="shrink-0" />
				<span>{successMessage}</span>
			</div>
		{/if}

		<!-- Nút Gửi & Huy hiệu an toàn -->
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
			<div class="flex items-center gap-1.5 text-[11px] text-text-muted">
				<ShieldCheck size={14} strokeWidth={1.75} class="text-emerald-500 shrink-0" />
				<span>{t('comments.powStatus')}</span>
			</div>
			<button
				type="submit"
				disabled={isSubmitting || !name.trim() || !content.trim()}
				class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-text-main hover:bg-text-main/90 text-main-bg text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow active:scale-[0.98] cursor-pointer"
			>
				{#if isSubmitting}
					<span class="inline-block w-3.5 h-3.5 border-2 border-main-bg border-t-transparent rounded-full animate-spin"></span>
					<span>{t('comments.submittingBtn')}</span>
				{:else}
					<Send size={14} strokeWidth={1.75} />
					<span>{t('comments.submitBtn')}</span>
				{/if}
			</button>
		</div>
	</form>

	<!-- Danh sách các bình luận -->
	<div class="space-y-6">
		{#if commentList.length === 0}
			<div class="text-center py-12 px-4 rounded-2xl border border-dashed border-border-subtle bg-soft-bg/30">
				<div class="w-12 h-12 rounded-2xl bg-soft-bg mx-auto mb-3 flex items-center justify-center text-text-muted">
					<MessageSquare size={22} strokeWidth={1.5} />
				</div>
				<p class="text-sm font-medium text-text-main mb-1">
					{t('comments.emptyTitle')}
				</p>
				<p class="text-xs text-text-muted">
					{t('comments.emptyDesc')}
				</p>
			</div>
		{:else}
			{#each rootComments as comment (comment.id)}
				{@const replies = getReplies(comment.id)}
				<div class="space-y-3">
					<!-- Bình luận gốc -->
					<div class="p-5 rounded-2xl bg-surface border border-border-subtle shadow-sm space-y-3 transition-colors">
						<!-- Header -->
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3">
								<div class={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border ${getAvatarColor(comment.name, comment.isAuthor)}`}>
									{getInitials(comment.name)}
								</div>
								<div>
									<div class="flex items-center gap-2">
										<span class="text-sm font-semibold text-text-main leading-tight">
											{comment.name}
										</span>
										{#if comment.isAuthor}
											<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 tracking-wide uppercase">
												<Sparkles size={10} strokeWidth={1.75} />
												{t('comments.adminBadge')}
											</span>
										{/if}
									</div>
									<div class="flex items-center gap-1.5 text-[11px] text-text-muted mt-0.5">
										<Clock size={11} strokeWidth={1.75} />
										<time datetime={comment.createdAt}>
											{formatCommentTime(comment.createdAt)}
										</time>
									</div>
								</div>
							</div>

							<!-- Nút Trả lời -->
							<button
								type="button"
								onclick={() => startReply(comment.id, comment.name)}
								class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-text-main hover:bg-soft-bg transition-colors cursor-pointer"
							>
								<CornerDownRight size={13} strokeWidth={1.75} />
								<span>{t('comments.replyBtn')}</span>
							</button>
						</div>

						<!-- Nội dung -->
						<p class="text-sm text-text-body leading-relaxed pl-12 whitespace-pre-line">
							{comment.content}
						</p>
					</div>

					<!-- Form trả lời inline khi người dùng bấm Trả lời bình luận này -->
					{#if replyingToId === comment.id}
						<form 
							onsubmit={(e) => handleReplySubmit(e, comment.id)}
							class="ml-6 md:ml-10 p-4 md:p-5 rounded-2xl bg-soft-bg/50 border border-primary/20 space-y-3 transition-colors relative"
						>
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-1.5 text-xs text-primary font-medium">
									<CornerDownRight size={14} strokeWidth={1.75} />
									<span>{t('comments.replyingTo')} <strong>@{replyingToName}</strong></span>
								</div>
								<button 
									type="button" 
									onclick={cancelReply}
									class="text-text-muted hover:text-text-main p-1 rounded-lg hover:bg-soft-bg transition-colors cursor-pointer"
									title={t('comments.cancelBtn')}
								>
									<X size={15} strokeWidth={1.75} />
								</button>
							</div>

							<!-- Off-screen Honeypot for Reply -->
							<div 
								style="position: absolute; left: -9999px; top: -9999px; width: 1px; height: 1px; opacity: 0; pointer-events: none; overflow: hidden;"
								aria-hidden="true"
								tabindex="-1"
							>
								<input type="text" name="website" bind:value={replyHoneypotWebsite} tabindex="-1" autocomplete="off" />
								<input type="text" name="phone_number" bind:value={replyHoneypotPhone} tabindex="-1" autocomplete="off" />
							</div>

							<div>
								<textarea
									bind:value={replyContent}
									placeholder={`@${replyingToName}...`}
									rows={3}
									disabled={isSubmittingReply}
									maxlength={2000}
									required
									class="w-full rounded-xl bg-surface border border-border-subtle p-3 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none leading-relaxed"
								></textarea>
							</div>

							<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
								<input
									type="text"
									bind:value={replyName}
									placeholder={t('comments.namePlaceholder')}
									disabled={isSubmittingReply}
									maxlength={60}
									required
									class="w-full rounded-xl bg-surface border border-border-subtle px-3 py-2 text-xs text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
								/>
								<input
									type="email"
									bind:value={replyEmail}
									placeholder={t('comments.emailPlaceholder')}
									disabled={isSubmittingReply}
									maxlength={100}
									class="w-full rounded-xl bg-surface border border-border-subtle px-3 py-2 text-xs text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
								/>
							</div>

							{#if replyError}
								<p class="text-xs text-rose-500 font-medium">{replyError}</p>
							{/if}

							<div class="flex items-center justify-end gap-2 pt-1">
								<button
									type="button"
									onclick={cancelReply}
									class="px-3.5 py-1.5 rounded-xl text-xs font-medium text-text-muted hover:text-text-main hover:bg-soft-bg transition-colors cursor-pointer"
								>
									{t('comments.cancelBtn')}
								</button>
								<button
									type="submit"
									disabled={isSubmittingReply || !replyName.trim() || !replyContent.trim()}
									class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
								>
									{#if isSubmittingReply}
										<span class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
										<span>{t('comments.submittingBtn')}</span>
									{:else}
										<Send size={12} strokeWidth={1.75} />
										<span>{t('comments.submitBtn')}</span>
									{/if}
								</button>
							</div>
						</form>
					{/if}

					<!-- Danh sách các phản hồi con (Replies) - 1 cấp thụt lề -->
					{#if replies.length > 0}
						<div class="ml-6 md:ml-10 pl-3 md:pl-5 border-l-2 border-border-subtle space-y-3">
							{#each replies as reply (reply.id)}
								<div class="p-4.5 rounded-2xl bg-soft-bg/40 border border-border-subtle shadow-xs space-y-2.5 transition-colors">
									<div class="flex items-center justify-between">
										<div class="flex items-center gap-2.5">
											<div class={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] border ${getAvatarColor(reply.name, reply.isAuthor)}`}>
												{getInitials(reply.name)}
											</div>
											<div>
												<div class="flex items-center gap-1.5">
													<span class="text-xs font-semibold text-text-main">
														{reply.name}
													</span>
													{#if reply.isAuthor}
														<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary/10 text-primary border border-primary/20 tracking-wide uppercase">
															<Sparkles size={9} strokeWidth={1.75} />
															{t('comments.adminBadge')}
														</span>
													{/if}
												</div>
												<div class="flex items-center gap-1 text-[10px] text-text-muted mt-0.5">
													<Clock size={10} strokeWidth={1.75} />
													<time datetime={reply.createdAt}>
														{formatCommentTime(reply.createdAt)}
													</time>
												</div>
											</div>
										</div>

										<button
											type="button"
											onclick={() => startReply(comment.id, reply.name)}
											class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-text-muted hover:text-text-main hover:bg-soft-bg transition-colors cursor-pointer"
										>
											<CornerDownRight size={11} strokeWidth={1.75} />
											<span>{t('comments.replyBtn')}</span>
										</button>
									</div>

									<p class="text-xs md:text-sm text-text-body leading-relaxed pl-10.5 whitespace-pre-line">
										{#if reply.replyToName && reply.replyToName !== comment.name}
											<span class="text-primary font-medium mr-1.5">@{reply.replyToName}</span>
										{/if}
										{reply.content}
									</p>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		{/if}
	</div>
</section>
