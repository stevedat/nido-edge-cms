/**
 * Nido Edge CMS - Dynamic Multi-Tenant Resolver
 *
 * Copyright (c) 2026 Steve Dat (@stevedat). All rights reserved.
 * Engineered and Copyrighted by Nido Holdings.
 *
 * This source code is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0-or-later).
 * For commercial, proprietary, or closed-source licensing, see COMMERCIAL.md.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
// @ts-check

/**
 * Sanitize tenant domain name string to prevent directory traversal
 * and illegal filesystem characters.
 * @param {string | null | undefined} domain
 * @returns {string} Sanitized domain or 'default'
 */
export function sanitizeTenantDomain(domain) {
	if (!domain || typeof domain !== 'string') {
		return 'default';
	}

	const cleaned = domain
		.toLowerCase()
		.trim()
		.replace(/^www\./, '')
		.replace(/[^a-z0-9.-]/g, '');

	if (
		!cleaned ||
		cleaned === 'default' ||
		cleaned === 'reset' ||
		cleaned.includes('..') ||
		cleaned.startsWith('.') ||
		cleaned.startsWith('-') ||
		cleaned.endsWith('.') ||
		cleaned.endsWith('-') ||
		!/^[a-z0-9]/.test(cleaned)
	) {
		return 'default';
	}

	return cleaned;
}

/**
 * Resolve tenant domain from standard HTTP Request and configuration.
 * Adheres to priority order:
 * 1. x-tenant-domain header (highest priority, universal for all environments)
 * 2. ?tenant= query parameter
 * 3. Host / URL hostname matching with root domain and platform mapping
 * 4. Fallback to 'default'
 *
 * @param {Request | { headers: Headers | { get(name: string): string | null }, url?: string }} request
 * @param {{ rootDomain?: string }} [config]
 * @returns {string} Resolved tenant domain
 */
export function resolveTenant(request, config = {}) {
	const rootDomain = (config.rootDomain || 'example.com').toLowerCase().trim();

	if (!request) {
		return 'default';
	}

	// 1. Priority 1: x-tenant-domain header (Universal override)
	if (request.headers && typeof request.headers.get === 'function') {
		const headerTenant = request.headers.get('x-tenant-domain');
		if (headerTenant && headerTenant.trim()) {
			return sanitizeTenantDomain(headerTenant);
		}
	}

	// 2. Priority 2: ?tenant= query parameter
	const urlStr = request.url || '';
	if (urlStr) {
		try {
			// Handle absolute URLs or relative paths for query extraction
			const parsedUrl = new URL(urlStr, 'http://localhost');
			const queryTenant = parsedUrl.searchParams.get('tenant');
			if (queryTenant && queryTenant.trim()) {
				return sanitizeTenantDomain(queryTenant);
			}
		} catch {
			// Ignore URL parse error and proceed to host check
		}
	}

	// 3. Priority 3: Host / URL hostname matching
	let rawHost = '';
	if (request.headers && typeof request.headers.get === 'function') {
		const forwarded = request.headers.get('x-forwarded-host');
		const host = request.headers.get('host');
		rawHost = (forwarded || host || '').split(',')[0].trim();
	}

	let hostname = '';
	if (rawHost) {
		try {
			// Use URL parser to handle port numbers and IPv6 brackets (e.g. "[::1]:8080")
			const hostUrl = new URL(`http://${rawHost}`);
			hostname = hostUrl.hostname;
		} catch {
			hostname = rawHost.replace(/:\d+$/, '');
		}
	}

	// If no host header was provided, or if host header resolved to localhost/127.0.0.1
	// while request.url is an absolute URL with a specific domain, extract from urlStr:
	if (!hostname || hostname === 'localhost' || hostname === '127.0.0.1') {
		if (urlStr && (urlStr.startsWith('http://') || urlStr.startsWith('https://'))) {
			try {
				const parsedUrl = new URL(urlStr);
				if (parsedUrl.hostname) {
					hostname = parsedUrl.hostname;
				}
			} catch {
				// Ignore URL parsing fallback failure
			}
		}
	}

	hostname = hostname
		.toLowerCase()
		.trim()
		.replace(/^www\./, '');

	if (!hostname) {
		return 'default';
	}

	// Check against root domain, hosting platforms, and local loopback
	if (
		hostname === rootDomain ||
		hostname.endsWith('.' + rootDomain) ||
		hostname.endsWith('.vercel.app') ||
		hostname.endsWith('.pages.dev') ||
		hostname === 'localhost' ||
		hostname === '127.0.0.1' ||
		hostname === '::1' ||
		hostname === '[::1]'
	) {
		return 'default';
	}

	// Custom domain represents the tenant directly
	return sanitizeTenantDomain(hostname);
}
