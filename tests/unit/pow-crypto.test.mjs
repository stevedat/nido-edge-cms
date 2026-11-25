import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
	hashPassword,
	verifyPassword,
	constantTimeEqual,
	createAntiSpamChallenge,
	solvePoW,
	verifyPoW,
	resetUsedTokens
} from '../../src/lib/core/index.js';

describe('Crypto: PBKDF2 Password Hashing & Constant-Time Equality', () => {
	it('hashes and verifies passwords with unique random salts', async () => {
		const h1 = await hashPassword('MyStrongPass#2026');
		const h2 = await hashPassword('MyStrongPass#2026');

		assert.ok(h1.startsWith('pbkdf2:'));
		assert.notEqual(h1, h2);
		assert.equal(await verifyPassword('MyStrongPass#2026', h1), true);
		assert.equal(await verifyPassword('WrongPass', h1), false);
		assert.equal(await verifyPassword('MyStrongPass#2026', 'invalid-hash'), false);
	});

	it('performs constant-time equality safely', () => {
		assert.equal(constantTimeEqual('abc123', 'abc123'), true);
		assert.equal(constantTimeEqual('abc123', 'abc124'), false);
		assert.equal(constantTimeEqual('abc', 'abcd'), false);
	});
});

describe('Crypto: Zero-Captcha Proof-of-Work Anti-Spam Engine', () => {
	const SECRET = 'unit-test-antispam-hmac-secret';

	beforeEach(() => {
		resetUsedTokens();
	});

	it('verifies valid PoW once and blocks replay attacks', async () => {
		const challenge = await createAntiSpamChallenge('lead', SECRET, '00');
		const nonce = await solvePoW(challenge, '00');

		const firstAttempt = await verifyPoW(challenge.token, nonce, 'lead', SECRET, {
			difficulty: '00',
			minTimeMs: 0
		});
		assert.equal(firstAttempt, true);

		// Replay attack with identical token & nonce must fail
		const replayAttempt = await verifyPoW(challenge.token, nonce, 'lead', SECRET, {
			difficulty: '00',
			minTimeMs: 0
		});
		assert.equal(replayAttempt, false);
	});

	it('enforces resource binding, HMAC integrity, and human minTimeMs timegate', async () => {
		const challenge = await createAntiSpamChallenge('post-slug-1', SECRET, '00');
		const nonce = await solvePoW(challenge, '00');

		// Instant submission must fail when minTimeMs = 3000
		const tooFast = await verifyPoW(challenge.token, nonce, 'post-slug-1', SECRET, {
			difficulty: '00',
			minTimeMs: 3000
		});
		assert.equal(tooFast, false);

		// Resource mismatch must fail
		const wrongResource = await verifyPoW(challenge.token, nonce, 'other-slug', SECRET, {
			difficulty: '00',
			minTimeMs: 0
		});
		assert.equal(wrongResource, false);

		// Tampered signature must fail
		const tampered = challenge.token.slice(0, -1) + (challenge.token.endsWith('0') ? '1' : '0');
		const badSig = await verifyPoW(tampered, nonce, 'post-slug-1', SECRET, {
			difficulty: '00',
			minTimeMs: 0
		});
		assert.equal(badSig, false);
	});
});
