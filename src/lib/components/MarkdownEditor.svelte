<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { t } from '$lib/i18n/index.js';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import { Markdown } from 'tiptap-markdown';
	import Image from '@tiptap/extension-image';
	import Placeholder from '@tiptap/extension-placeholder';
	import { 
		Bold, Italic, Strikethrough, Code, 
		Heading1, Heading2, Heading3, 
		List, ListOrdered, Quote, 
		Image as ImageIcon, Link as LinkIcon, Undo, Redo 
	} from 'lucide-svelte';

	let { 
		value = $bindable(''),
		placeholder = t('admin.editor.placeholder'),
		height = '650px',
		showWordCount = true,
		autosave = false,
		autosaveKey = 'markdown-editor',
		theme = 'light'
	} = $props();

	let element: HTMLElement;
	let editor: Editor | null = $state(null);
	let wordCount = $state({ words: 0, characters: 0 });

	function updateWordCount(text: string) {
		const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
		const characters = text.length;
		wordCount = { words, characters };
	}

	onMount(() => {
		editor = new Editor({
			element: element,
			extensions: [
				StarterKit.configure({
					heading: { levels: [1, 2, 3, 4] },
					codeBlock: false,
					link: {
						openOnClick: false,
						autolink: true,
						defaultProtocol: 'https'
					}
				}),
				Markdown.configure({
					html: true,
					tightLists: true,
					tightListClass: 'tight',
					bulletListMarker: '-',
					linkify: true,
					breaks: true,
				}),
				Image.configure({
					inline: true,
					allowBase64: true,
				}),
				Placeholder.configure({
					placeholder: placeholder,
				})
			],
			content: value,
			onUpdate: ({ editor: currentEditor }) => {
				// tiptap-markdown gives us the getMarkdown() function!
				const markdownOutput = (currentEditor.storage as any).markdown.getMarkdown();
				value = markdownOutput;
				if (showWordCount) {
					updateWordCount(currentEditor.getText());
				}
				if (autosave && markdownOutput && typeof window !== 'undefined') {
					try {
						localStorage.setItem(autosaveKey, markdownOutput);
					} catch (e) {}
				}
			},
			onTransaction: () => {
				// force re-render for toolbar active states
				editor = editor;
			}
		});

		if (showWordCount && editor) {
			updateWordCount(editor.getText());
		}
	});

	onDestroy(() => {
		if (editor) {
			editor.destroy();
		}
	});

	function addLink() {
		if (!editor) return;
		const previousUrl = editor.getAttributes('link').href;
		const url = window.prompt(t('admin.editor.promptLink'), previousUrl);

		// cancelled
		if (url === null) {
			return;
		}

		// empty
		if (url === '') {
			editor.chain().focus().extendMarkRange('link').unsetLink().run();
			return;
		}

		// update link
		editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
	}

	function addImage() {
		if (!editor) return;
		const url = window.prompt(t('admin.editor.promptImage'));
		if (url) {
			editor.chain().focus().setImage({ src: url }).run();
		}
	}
</script>

<div class="tiptap-wrapper {theme}">
	{#if editor}
		<div class="tiptap-toolbar">
			<div class="toolbar-group">
				<button type="button" onclick={() => editor?.chain().focus().toggleBold().run()} class:is-active={editor?.isActive('bold')} title={t('admin.editor.bold')}><Bold strokeWidth={1.75} size={16} /></button>
				<button type="button" onclick={() => editor?.chain().focus().toggleItalic().run()} class:is-active={editor?.isActive('italic')} title={t('admin.editor.italic')}><Italic strokeWidth={1.75} size={16} /></button>
				<button type="button" onclick={() => editor?.chain().focus().toggleStrike().run()} class:is-active={editor?.isActive('strike')} title={t('admin.editor.strike')}><Strikethrough strokeWidth={1.75} size={16} /></button>
				<button type="button" onclick={() => editor?.chain().focus().toggleCode().run()} class:is-active={editor?.isActive('code')} title={t('admin.editor.code')}><Code strokeWidth={1.75} size={16} /></button>
			</div>

			<div class="toolbar-group">
				<button type="button" onclick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} class:is-active={editor?.isActive('heading', { level: 2 })} title={t('admin.editor.h1')}><Heading1 strokeWidth={1.75} size={16} /></button>
				<button type="button" onclick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} class:is-active={editor?.isActive('heading', { level: 3 })} title={t('admin.editor.h2')}><Heading2 strokeWidth={1.75} size={16} /></button>
				<button type="button" onclick={() => editor?.chain().focus().toggleHeading({ level: 4 }).run()} class:is-active={editor?.isActive('heading', { level: 4 })} title={t('admin.editor.h3')}><Heading3 strokeWidth={1.75} size={16} /></button>
			</div>

			<div class="toolbar-group">
				<button type="button" onclick={() => editor?.chain().focus().toggleBulletList().run()} class:is-active={editor?.isActive('bulletList')} title={t('admin.editor.bulletList')}><List strokeWidth={1.75} size={16} /></button>
				<button type="button" onclick={() => editor?.chain().focus().toggleOrderedList().run()} class:is-active={editor?.isActive('orderedList')} title={t('admin.editor.orderedList')}><ListOrdered strokeWidth={1.75} size={16} /></button>
				<button type="button" onclick={() => editor?.chain().focus().toggleBlockquote().run()} class:is-active={editor?.isActive('blockquote')} title={t('admin.editor.quote')}><Quote strokeWidth={1.75} size={16} /></button>
			</div>

			<div class="toolbar-group">
				<button type="button" onclick={addLink} class:is-active={editor?.isActive('link')} title={t('admin.editor.link')}><LinkIcon size={16} /></button>
				<button type="button" onclick={addImage} title={t('admin.editor.image')}><ImageIcon size={16} /></button>
			</div>
			
			<div class="toolbar-group ml-auto border-r-0 pr-0">
				<button type="button" onclick={() => editor?.chain().focus().undo().run()} disabled={!editor?.can().undo()} title={t('admin.editor.undo')}><Undo strokeWidth={1.75} size={16} /></button>
				<button type="button" onclick={() => editor?.chain().focus().redo().run()} disabled={!editor?.can().redo()} title={t('admin.editor.redo')}><Redo strokeWidth={1.75} size={16} /></button>
			</div>
		</div>
	{/if}

	<div class="tiptap-content-area" style="min-height: {height};">
		<div bind:this={element} class="prose prose-slate dark:prose-invert max-w-none prose-lg w-full p-8 focus:outline-none min-h-[500px]"></div>
	</div>

	{#if showWordCount}
		<div class="tiptap-status">
			<span class="status-item">{t('admin.editor.words')}: {wordCount.words}</span>
			<span class="status-item">{t('admin.editor.characters')}: {wordCount.characters}</span>
			<span class="status-item text-emerald-500 font-medium">{t('admin.editor.synced')}</span>
		</div>
	{/if}
</div>

<style>
	.tiptap-wrapper {
		display: flex;
		flex-direction: column;
		width: 100%;
		border-radius: 1.5rem;
		border: 1px solid var(--color-border-subtle, #e2e8f0);
		overflow: hidden;
		background: var(--color-surface, #ffffff);
		transition: all 0.2s;
	}

	.tiptap-wrapper:focus-within {
		border-color: var(--color-primary, #3b82f6);
		box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.15);
	}

	.tiptap-toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		padding: 0.75rem;
		background: var(--color-soft-bg, #f8fafc);
		border-bottom: 1px solid var(--color-border-subtle, #e2e8f0);
		gap: 0.5rem;
	}

	.toolbar-group {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding-right: 0.75rem;
		margin-right: 0.25rem;
		border-right: 1px solid var(--color-border-subtle, #e2e8f0);
	}

	.tiptap-toolbar button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 0.5rem;
		color: var(--color-text-muted, #475569);
		background: transparent;
		transition: all 0.15s ease;
		cursor: pointer;
		border: none;
	}

	.tiptap-toolbar button:hover:not(:disabled) {
		background: var(--color-surface, #e2e8f0);
		color: var(--color-text-main, #0f172a);
	}

	.tiptap-toolbar button.is-active {
		background: rgba(56, 189, 248, 0.15);
		color: var(--color-primary, #2563eb);
	}

	.tiptap-toolbar button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.tiptap-content-area {
		background: var(--color-surface, #ffffff);
		color: var(--color-text-main, #0f172a);
		overflow-y: auto;
		cursor: text;
	}

	.tiptap-status {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		padding: 0.75rem 1.5rem;
		background: var(--color-soft-bg, #f8fafc);
		border-top: 1px solid var(--color-border-subtle, #e2e8f0);
		font-size: 0.75rem;
		color: var(--color-text-muted, #64748b);
	}

	/* TipTap Global Styling overrides for Tailwind Prose */
	:global(.ProseMirror) {
		outline: none !important;
		min-height: 100%;
	}
	
	:global(.ProseMirror p.is-editor-empty:first-child::before) {
		color: var(--color-text-muted, #94a3b8);
		content: attr(data-placeholder);
		float: left;
		height: 0;
		pointer-events: none;
	}

	:global(.ProseMirror img) {
		max-width: 100%;
		height: auto;
		border-radius: 0.75rem;
		display: block;
		margin: 2rem auto;
		box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
	}

	:global(.ProseMirror img.ProseMirror-selectednode) {
		outline: 3px solid var(--color-primary, #3b82f6);
		outline-offset: 2px;
	}
	
	:global(.ProseMirror a) {
		color: var(--color-primary, #3b82f6);
		text-decoration: none;
		cursor: pointer;
		font-weight: 500;
	}

	:global(.ProseMirror a:hover) {
		text-decoration: underline;
	}
	
	:global(.ProseMirror blockquote) {
		border-left: 4px solid var(--color-border-strong, #cbd5e1);
		padding-left: 1rem;
		font-style: italic;
		color: var(--color-text-body, #475569);
	}
</style>