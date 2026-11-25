import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
	ContentEngine,
	MemoryStorageAdapter,
	StorageAdapter,
	slugify
} from '../../src/lib/core/index.js';

describe('ContentEngine: slugify', () => {
	it('normalizes Vietnamese diacritics and punctuation into clean URL slugs', () => {
		assert.equal(slugify('Tiếng Việt Đẹp 123 — Đổi Mới!'), 'tieng-viet-dep-123-doi-moi');
		assert.equal(slugify('  Hello   World  '), 'hello-world');
		assert.ok(slugify('').startsWith('item-'));
	});
});

describe('ContentEngine: Posts, Draft Filtering, and Slug Renaming', () => {
	it('filters DRAFT posts when publishedOnly=true and keeps them when false', async () => {
		const engine = new ContentEngine(new MemoryStorageAdapter());

		await engine.savePost('default', {
			title: 'Published Post',
			slug: 'pub-post',
			content: 'Public body',
			status: 'PUBLISHED'
		});
		await engine.savePost('default', {
			title: 'Secret Draft',
			slug: 'secret-draft',
			content: 'Draft body',
			status: 'DRAFT'
		});

		const publicPosts = await engine.getPosts('default', { publishedOnly: true });
		assert.equal(publicPosts.length, 1);
		assert.equal(publicPosts[0].slug, 'pub-post');

		const allPosts = await engine.getPosts('default', { publishedOnly: false });
		assert.equal(allPosts.length, 2);
	});

	it('renames post slug in-place via originalSlug and prevents duplicate slug collisions', async () => {
		const engine = new ContentEngine(new MemoryStorageAdapter());

		await engine.savePost('acme.com', {
			title: 'First Article',
			slug: 'old-slug',
			content: 'Body 1',
			status: 'PUBLISHED'
		});
		await engine.savePost('acme.com', {
			title: 'Second Article',
			slug: 'second-slug',
			content: 'Body 2',
			status: 'DRAFT'
		});

		const renamed = await engine.savePost('acme.com', {
			originalSlug: 'old-slug',
			slug: 'new-slug',
			title: 'First Article Updated',
			status: 'DRAFT'
		});

		assert.equal(renamed.slug, 'new-slug');
		assert.equal(renamed.status, 'DRAFT');

		const all = await engine.getPosts('acme.com');
		assert.equal(all.length, 2);
		assert.equal(await engine.getPostBySlug('acme.com', 'old-slug'), null);
		assert.ok(await engine.getPostBySlug('acme.com', 'new-slug'));

		// Collision with existing post slug must reject
		await assert.rejects(
			() =>
				engine.savePost('acme.com', {
					originalSlug: 'new-slug',
					slug: 'second-slug',
					title: 'Should Fail'
				}),
			/already exists/
		);
	});

	it('does not overwrite generated defaults when empty slug/id fields are passed', async () => {
		const engine = new ContentEngine(new MemoryStorageAdapter());
		const created = await engine.savePost('default', {
			id: '',
			slug: '',
			title: 'Bài Viết Mới',
			content: 'Nội dung'
		});
		assert.ok(created.id.startsWith('post_'));
		assert.equal(created.slug, 'bai-viet-moi');
		assert.equal(created.status, 'DRAFT');
	});
});

describe('ContentEngine: Cache Integrity & Deep Cloning', () => {
	it('does not poison cache if storage.write throws an error', async () => {
		class FailingWriteStorage extends StorageAdapter {
			constructor() {
				super();
				this.files = new Map([
					['src/content/default/settings.json', JSON.stringify({ siteName: 'Original Name' })]
				]);
				this.shouldFail = true;
			}
			async read(p) {
				return this.files.has(p) ? this.files.get(p) : null;
			}
			async write(p, content) {
				if (this.shouldFail) throw new Error('Simulated storage failure');
				this.files.set(p, content);
			}
			async delete(p) {
				this.files.delete(p);
			}
			async list() {
				return Array.from(this.files.keys());
			}
		}

		const storage = new FailingWriteStorage();
		const engine = new ContentEngine(storage);

		const before = await engine.getSettings('default');
		assert.equal(before.siteName, 'Original Name');

		await assert.rejects(
			() => engine.saveSettings('default', { siteName: 'Uncommitted Name' }),
			/Simulated storage failure/
		);

		const after = await engine.getSettings('default');
		assert.equal(after.siteName, 'Original Name');
	});

	it('deep-clones cached data so caller mutations never corrupt cache', async () => {
		const engine = new ContentEngine(new MemoryStorageAdapter());
		await engine.savePost('default', {
			title: 'Immutable Test',
			slug: 'immutable-test',
			tags: ['svelte', 'edge'],
			status: 'PUBLISHED'
		});

		const firstRead = await engine.getPosts('default');
		firstRead[0].tags.push('MUTATED');
		firstRead[0].title = 'CORRUPTED';

		const secondRead = await engine.getPosts('default');
		assert.equal(secondRead[0].title, 'Immutable Test');
		assert.deepEqual(secondRead[0].tags, ['svelte', 'edge']);
	});
});

describe('ContentEngine: Multi-Tenant Isolation, Comments & Videos', () => {
	it('isolates leads, comments, and videos per tenant and supports comment deletion/moderation', async () => {
		const engine = new ContentEngine(new MemoryStorageAdapter());

		await engine.addLead('default', { phone: '0901234567', name: 'Default Lead' });
		const tenantLeads = await engine.getLeads('tenant-b.com');
		assert.equal(tenantLeads.length, 0);

		const cmt = await engine.addComment('tenant-b.com', 'hello-post', {
			name: 'Alice',
			content: 'Great article!'
		});
		assert.ok(cmt.id);

		const moderated = await engine.updateCommentStatus(
			'tenant-b.com',
			'hello-post',
			cmt.id,
			'REJECTED'
		);
		assert.equal(moderated, true);

		const commentsAfterMod = await engine.getComments('tenant-b.com', 'hello-post');
		assert.equal(commentsAfterMod[0].status, 'REJECTED');

		const deleted = await engine.deleteComment('tenant-b.com', 'hello-post', cmt.id);
		assert.equal(deleted, true);
		assert.equal((await engine.getComments('tenant-b.com', 'hello-post')).length, 0);

		const vid = await engine.createVideo('tenant-b.com', {
			title: 'Edge Architecture',
			url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
		});
		assert.equal(vid.platform, 'YOUTUBE');

		const updatedVid = await engine.updateVideo('tenant-b.com', vid.id, {
			title: 'Edge Architecture v2'
		});
		assert.equal(updatedVid.title, 'Edge Architecture v2');

		await engine.deleteVideo('tenant-b.com', vid.id);
		assert.equal((await engine.getVideos('tenant-b.com')).length, 0);
	});
});
