/**
 * Pure Web Standards HTML escaping and sanitization utilities.
 * Zero Node/DOM dependencies — safe for Cloudflare Workers, Vercel Edge, and browsers.
 */

const DANGEROUS_TAGS_WITH_CONTENT = [
	'script',
	'style',
	'iframe',
	'object',
	'embed',
	'applet',
	'form',
	'input',
	'button',
	'textarea',
	'select',
	'option',
	'meta',
	'link',
	'base',
	'svg',
	'math',
	'template',
	'noscript',
	'frame',
	'frameset'
];

const DANGEROUS_PAIR_REGEX = new RegExp(
	`<(${DANGEROUS_TAGS_WITH_CONTENT.join('|')})\\b[^>]*>[\\s\\S]*?<\\/\\1\\s*>`,
	'gi'
);

const DANGEROUS_SELF_OR_OPEN_REGEX = new RegExp(
	`<\\/?(${DANGEROUS_TAGS_WITH_CONTENT.join('|')})\\b[^>]*\\/?>`,
	'gi'
);

/**
 * Escape HTML special characters for safe text interpolation.
 */
export function escapeHtml(input: string): string {
	if (!input || typeof input !== 'string') return '';
	return input
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

/**
 * Check whether a URL attribute value uses a safe scheme.
 */
export function isSafeUrl(rawUrl: string): boolean {
	if (!rawUrl || typeof rawUrl !== 'string') return false;
	// Strip ASCII control chars & whitespace that browsers ignore inside schemes
	// eslint-disable-next-line no-control-regex
	const normalized = rawUrl.replace(/[\u0000-\u0020]+/g, '').toLowerCase();
	if (!normalized) return false;

	// Allow relative paths and anchors
	if (
		normalized.startsWith('/') ||
		normalized.startsWith('#') ||
		normalized.startsWith('./') ||
		normalized.startsWith('../')
	) {
		return !normalized.startsWith('//');
	}

	// Allow explicit safe protocols
	if (
		normalized.startsWith('http://') ||
		normalized.startsWith('https://') ||
		normalized.startsWith('mailto:') ||
		normalized.startsWith('tel:')
	) {
		return true;
	}

	// Allow bare relative paths without any scheme colon before slash/query/hash
	const colonIdx = normalized.indexOf(':');
	if (colonIdx === -1) return true;
	const slashIdx = normalized.indexOf('/');
	const queryIdx = normalized.indexOf('?');
	const hashIdx = normalized.indexOf('#');
	const firstDelimiter = Math.min(
		slashIdx === -1 ? Infinity : slashIdx,
		queryIdx === -1 ? Infinity : queryIdx,
		hashIdx === -1 ? Infinity : hashIdx
	);
	return colonIdx > firstDelimiter;
}

/**
 * Decode basic HTML character entities so obfuscated schemes like `&#106;avascript:` cannot bypass validation.
 */
function decodeBasicEntities(value: string): string {
	return value
		.replace(/&#x([0-9a-f]+);?/gi, (_, hex) => {
			const code = Number.parseInt(hex, 16);
			return Number.isFinite(code) ? String.fromCodePoint(code) : '';
		})
		.replace(/&#([0-9]+);?/g, (_, dec) => {
			const code = Number.parseInt(dec, 10);
			return Number.isFinite(code) ? String.fromCodePoint(code) : '';
		})
		.replace(/&colon;/gi, ':')
		.replace(/&tab;/gi, '\t')
		.replace(/&newline;/gi, '\n')
		.replace(/&amp;/gi, '&');
}

/**
 * Sanitize rendered HTML (e.g. from marked.parse) to mitigate Stored XSS.
 */
export function sanitizeHtml(html: string): string {
	if (!html || typeof html !== 'string') return '';

	let clean = html;

	// 1. Remove HTML comments (including conditional comments)
	clean = clean.replace(/<!--[\s\S]*?-->/g, '');

	// 2. Iteratively strip dangerous paired and unpaired/self-closing tags
	let prev = '';
	let guard = 0;
	while (clean !== prev && guard < 10) {
		prev = clean;
		clean = clean.replace(DANGEROUS_PAIR_REGEX, '');
		clean = clean.replace(DANGEROUS_SELF_OR_OPEN_REGEX, '');
		guard += 1;
	}

	// 3. Sanitize attributes inside remaining opening tags
	clean = clean.replace(/<([a-zA-Z][a-zA-Z0-9-]*)(\s[^>]*)?>/g, (fullMatch, tagName, attrs) => {
		if (!attrs) return `<${tagName}>`;

		// Strip inline event handlers (on*=...) and srcdoc
		let safeAttrs = attrs
			.replace(/\s+on[a-zA-Z0-9_-]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
			.replace(/\s+srcdoc\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');

		// Validate URL-bearing attributes
		safeAttrs = safeAttrs.replace(
			/\s+(href|src|xlink:href|action|formaction|poster)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi,
			(_m: string, attrName: string, dq?: string, sq?: string, uq?: string) => {
				const rawVal = dq ?? sq ?? uq ?? '';
				const decoded = decodeBasicEntities(rawVal);
				if (!isSafeUrl(decoded)) {
					return '';
				}
				return ` ${attrName}="${escapeHtml(rawVal)}"`;
			}
		);

		return `<${tagName}${safeAttrs}>`;
	});

	return clean;
}
