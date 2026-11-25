// @ts-check
export { cn } from './cn.js';
export { surface, DESIGN_SYSTEM_DOCS } from './surface.js';
export { utf8ToBase64, base64ToUtf8, arrayBufferToBase64, base64ToUint8Array } from './base64.js';
export { slugify } from '../core/content/engine.js';

/**
 * Decode URL slug back to readable format (for display purposes)
 * @param {string} slug
 * @returns {string}
 */
export function unslugify(slug) {
	return slug
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

/**
 * Check if a domain represents the master site (Master)
 * @param {string | null | undefined} domain
 * @returns {boolean}
 */
export function isMasterDomain(domain) {
	if (!domain) return true;
	const d = domain.toLowerCase().replace(/^www\./, '');
	const rootDomain = (
		typeof process !== 'undefined' && process.env?.ROOT_DOMAIN ? process.env.ROOT_DOMAIN : ''
	).toLowerCase();
	return (
		d === 'default' ||
		d === 'localhost' ||
		d === '127.0.0.1' ||
		(rootDomain && (d === rootDomain || d.endsWith('.' + rootDomain))) ||
		d.endsWith('.vercel.app') ||
		d.endsWith('.pages.dev')
	);
}
