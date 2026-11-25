import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
	createEdgeCMSCore,
	MemoryStorageAdapter,
	sanitizeTenantDomain,
	resolveTenant,
	hashPassword
} from '../../src/lib/core/index.js';
import { escapeHtml, isSafeUrl, sanitizeHtml } from '../../src/lib/utils/sanitize.ts';
import { arrayBufferToBase64, base64ToUint8Array } from '../../src/lib/utils/base64.js';

describe('Security: HTML & URL Sanitization (XSS Defense)', () => {
	it('strips script, iframe, svg, and event handlers from rendered markdown HTML', () => {
		const malicious = [
			'<h1>Hello</h1>',
			'<script>alert("xss")</script>',
			'<img src="https://example.com/a.png" onerror="alert(1)" alt="ok">',
			'<a href="javascript:alert(1)">Click</a>',
			'<a href="&#106;avascript:alert(1)">Encoded</a>',
			'<iframe src="https://evil.test"></iframe>',
			'<svg onload="alert(1)"><circle r="10"/></svg>',
			'<p onclick=alert(1)>Safe paragraph</p>'
		].join('');

		const clean = sanitizeHtml(malicious);

		assert.ok(clean.includes('<h1>Hello</h1>'));
		assert.ok(clean.includes('Safe paragraph'));
		assert.ok(clean.includes('src="https://example.com/a.png"'));
		assert.equal(clean.toLowerCase().includes('<script'), false);
		assert.equal(clean.toLowerCase().includes('<iframe'), false);
		assert.equal(clean.toLowerCase().includes('<svg'), false);
		assert.equal(clean.toLowerCase().includes('onerror'), false);
		assert.equal(clean.toLowerCase().includes('onclick'), false);
		assert.equal(clean.toLowerCase().includes('javascript:'), false);
	});

	it('validates safe vs dangerous URL schemes', () => {
		assert.equal(isSafeUrl('https://example.com/path'), true);
		assert.equal(isSafeUrl('http://example.com'), true);
		assert.equal(isSafeUrl('/blog/hello-world'), true);
		assert.equal(isSafeUrl('#section-1'), true);
		assert.equal(isSafeUrl('mailto:team@example.com'), true);
		assert.equal(isSafeUrl('tel:+84901234567'), true);

		assert.equal(isSafeUrl('javascript:alert(1)'), false);
		assert.equal(isSafeUrl('  JaVaScRiPt:alert(1)'), false);
		assert.equal(isSafeUrl('vbscript:msgbox(1)'), false);
		assert.equal(isSafeUrl('data:text/html,<script>alert(1)</script>'), false);
		assert.equal(isSafeUrl('//evil.com/phish'), false);
	});

	it('escapes HTML special characters', () => {
		assert.equal(
			escapeHtml(`<a href="x">'&</a>`),
			'&lt;a href=&quot;x&quot;&gt;&#39;&amp;&lt;/a&gt;'
		);
	});
});

describe('Security: Binary Base64 Decoding for Uploads', () => {
	it('decodes newline-wrapped base64 payload back into exact binary bytes', () => {
		const original = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0xff]);
		const b64 = arrayBufferToBase64(original.buffer);
		const withNewlines = `${b64.slice(0, 4)}\n${b64.slice(4)}\n`;
		const decoded = base64ToUint8Array(withNewlines);

		assert.deepEqual(Array.from(decoded), Array.from(original));
	});
});

describe('Security: Multi-Tenant Resolution & Path Traversal Guards', () => {
	it('rejects traversal and illegal domain strings', () => {
		assert.equal(sanitizeTenantDomain('../../etc/passwd'), 'default');
		assert.equal(sanitizeTenantDomain('tenant..evil.com'), 'default');
		assert.equal(sanitizeTenantDomain('.hidden.com'), 'default');
		assert.equal(sanitizeTenantDomain('-bad.com'), 'default');
		assert.equal(sanitizeTenantDomain('reset'), 'default');
		assert.equal(sanitizeTenantDomain('default'), 'default');
		assert.equal(sanitizeTenantDomain('www.Acme-Corp.com'), 'acme-corp.com');
	});

	it('resolves tenant strictly with priority header > query > custom host > default', () => {
		const makeReq = (url, headers = {}) => ({
			url,
			headers: new Headers(headers)
		});

		assert.equal(
			resolveTenant(makeReq('https://acme.com/blog', { 'x-tenant-domain': 'override.io' }), {
				rootDomain: 'example.com'
			}),
			'override.io'
		);
		assert.equal(
			resolveTenant(makeReq('https://example.com/?tenant=client.vn'), {
				rootDomain: 'example.com'
			}),
			'client.vn'
		);
		assert.equal(
			resolveTenant(makeReq('https://www.custom.io/posts', { host: 'www.custom.io' }), {
				rootDomain: 'example.com'
			}),
			'custom.io'
		);
		assert.equal(
			resolveTenant(makeReq('https://app.example.com/', { host: 'app.example.com' }), {
				rootDomain: 'example.com'
			}),
			'default'
		);
	});
});

describe('Security: Authentication & Cross-Tenant Binding', () => {
	it('binds tenant admin tokens strictly to their own domain and signs both id & sub', async () => {
		const storage = new MemoryStorageAdapter();
		const core = createEdgeCMSCore({
			jwtSecret: 'super-secret-jwt-key-for-unit-tests-123456',
			adminPassword: 'MasterSecretPassword!99',
			storage
		});

		const tenantHash = await hashPassword('TenantPass123!');
		const tenantSettings = {
			domain: 'tenant-a.com',
			siteName: 'Tenant A',
			adminPasswordHash: tenantHash
		};

		// Tenant admin login even with spoofed identifier must bind to tenant-a.com
		const tenantRes = await core.auth.authenticate(
			{
				password: 'TenantPass123!',
				identifier: 'victim.com',
				domain: 'tenant-a.com'
			},
			tenantSettings
		);

		assert.equal(tenantRes.success, true);
		assert.equal(tenantRes.user?.id, 'tenant_tenant-a.com');
		assert.equal(tenantRes.user?.username, 'tenant-a.com');
		assert.equal(tenantRes.user?.tenant, 'tenant-a.com');
		assert.ok(tenantRes.token);

		const decodedTenant = await core.auth.getUserFromToken(tenantRes.token);
		assert.equal(decodedTenant?.id, 'tenant_tenant-a.com');
		assert.equal(decodedTenant?.username, 'tenant-a.com');
		assert.equal(decodedTenant?.tenant, 'tenant-a.com');

		// Master admin login
		const masterRes = await core.auth.authenticate({ password: 'MasterSecretPassword!99' });
		assert.equal(masterRes.success, true);
		assert.equal(masterRes.user?.id, 'admin');
		assert.ok(masterRes.token);

		const decodedMaster = await core.auth.getUserFromToken(masterRes.token);
		assert.equal(decodedMaster?.id, 'admin');

		// Backward compatibility: token with only sub claim resolves id properly
		const subOnlyToken = await core.auth.signToken({
			sub: 'admin',
			username: 'admin',
			role: 'ADMIN'
		});
		const decodedSubOnly = await core.auth.getUserFromToken(subOnlyToken);
		assert.equal(decodedSubOnly?.id, 'admin');

		// Invalid password rejected
		const badRes = await core.auth.authenticate(
			{ password: 'wrong-password', domain: 'tenant-a.com' },
			tenantSettings
		);
		assert.equal(badRes.success, false);
	});
});
