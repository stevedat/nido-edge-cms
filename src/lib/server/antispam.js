import { core } from './core.js';

const RATE_LIMIT_COOLDOWN_MS = 15 * 1000;
const RATE_LIMIT_BURST_MAX = 5;
const RATE_LIMIT_BURST_WINDOW_MS = 10 * 60 * 1000;
/** @type {Map<string, { lastTime: number, count: number, windowStart: number }>} */
const ipRateLimitMap = new Map();

/**
 * Generate anti-spam challenge token for comments
 * @param {string} slug
 * @returns {Promise<{ challenge: string; token: string; difficulty: string; hint: string }>}
 */
export async function createAntiSpamChallenge(slug) {
	const res = await core.crypto.createPoWChallenge(slug);
	return {
		...res,
		hint: 'Solve Proof-of-Work puzzle to verify non-bot activity'
	};
}

/**
 * Verify Proof-of-Work (PoW) solution directly
 * @param {string} challenge
 * @param {number|string} nonce
 * @returns {Promise<boolean>}
 */
export async function verifyPoW(challenge, nonce) {
	return await core.crypto.verifyPoW(challenge, nonce, '', { difficulty: '000' });
}

/**
 * Filter and inspect comment content for spam heuristics
 * @param {string} content
 * @returns {{ pass: boolean; reason?: string }}
 */
export function inspectCommentContent(content) {
	if (!content || content.trim().length < 2) {
		return { pass: false, reason: 'Comment content is too short.' };
	}

	const clean = content.trim();

	// 1. Link spam check (max 1 URL allowed in legitimate comments)
	const urlRegex = /https?:\/\/[^\s]+|www\.[^\s]+/gi;
	const urls = clean.match(urlRegex) || [];
	if (urls.length > 1) {
		return { 
			pass: false, 
			reason: 'Comments can only contain a maximum of 1 link to prevent spam advertising.' 
		};
	}

	// 2. BBCode or HTML tag injection
	const tagRegex = /\[url[\s=\]]|\[link[\s=\]]|<a\s|<script|<iframe|\[b\]|\[img\]/i;
	if (tagRegex.test(clean)) {
		return { 
			pass: false, 
			reason: 'Please do not use HTML or BBCode tags in comments.' 
		};
	}

	// 3. Obvious spam keywords
	const spamKeywords = [
		'kubet', 'thabet', 'nhà cái', 'nha cai', 'keonhacai', 'soi cầu', 'soi cau', 
		'tai xiu', 'tài xỉu', 'đá gà', 'da ga', 'casino online', 'lô đề', 'lo de',
		'crypto airdrop', 'wa.me/', 'whatsapp:', 'viagra'
	];
	const lower = clean.toLowerCase();
	for (const keyword of spamKeywords) {
		if (lower.includes(keyword)) {
			return { 
				pass: false, 
				reason: 'Comment contains restricted keywords to protect content integrity.' 
			};
		}
	}

	// 4. Excessive repetitive characters
	const repeatRegex = /(.)\1{9,}/;
	if (repeatRegex.test(clean)) {
		return { 
			pass: false, 
			reason: 'Comment contains unusual repetitive character strings.' 
		};
	}

	return { pass: true };
}

/**
 * Rate limit check for IP
 * @param {string} ip
 * @returns {{ allowed: boolean; retryAfter?: number }}
 */
export function checkRateLimit(ip) {
	const now = Date.now();
	const record = ipRateLimitMap.get(ip);

	if (!record) {
		ipRateLimitMap.set(ip, { lastTime: now, count: 1, windowStart: now });
		return { allowed: true };
	}

	// Check immediate cooldown (15s)
	const elapsedSinceLast = now - record.lastTime;
	if (elapsedSinceLast < RATE_LIMIT_COOLDOWN_MS) {
		const retryAfter = Math.ceil((RATE_LIMIT_COOLDOWN_MS - elapsedSinceLast) / 1000);
		return { allowed: false, retryAfter };
	}

	// Check burst window (10 mins)
	if (now - record.windowStart > RATE_LIMIT_BURST_WINDOW_MS) {
		record.windowStart = now;
		record.count = 1;
		record.lastTime = now;
		return { allowed: true };
	}

	if (record.count >= RATE_LIMIT_BURST_MAX) {
		const retryAfter = Math.ceil((RATE_LIMIT_BURST_WINDOW_MS - (now - record.windowStart)) / 1000);
		return { allowed: false, retryAfter };
	}

	record.count += 1;
	record.lastTime = now;

	// Clean up map periodically
	if (ipRateLimitMap.size > 1000) {
		for (const [k, v] of ipRateLimitMap.entries()) {
			if (now - v.lastTime > RATE_LIMIT_BURST_WINDOW_MS) {
				ipRateLimitMap.delete(k);
			}
		}
	}

	return { allowed: true };
}

/**
 * Comprehensive verification of a comment submission
 * @param {object} params
 * @param {string} params.slug
 * @param {string} params.content
 * @param {Record<string, any>} [params.honeypots]
 * @param {string} [params.token]
 * @param {number|string} [params.nonce]
 * @param {string} params.ip
 * @param {boolean} [params.isAdmin]
 * @returns {Promise<{ isValid: boolean; silentDrop?: boolean; error?: string; status?: number }>}
 */
export async function verifyCommentSubmission({
	slug,
	content,
	honeypots = {},
	token,
	nonce,
	ip,
	isAdmin = false
}) {
	if (isAdmin) {
		return { isValid: true };
	}

	for (const [key, val] of Object.entries(honeypots)) {
		if (val && typeof val === 'string' && val.trim().length > 0) {
			console.warn(`[AntiSpam] Honeypot triggered (${key}) from IP: ${ip}`);
			return { isValid: false, silentDrop: true };
		}
	}

	const rateCheck = checkRateLimit(ip);
	if (!rateCheck.allowed) {
		return {
			isValid: false,
			status: 429,
			error: `You are submitting comments too frequently. Please try again in ${rateCheck.retryAfter} seconds.`
		};
	}

	if (!token) {
		return {
			isValid: false,
			status: 400,
			error: 'Missing bot authentication code. Please refresh the page.'
		};
	}

	if (nonce === undefined || nonce === null) {
		return {
			isValid: false,
			status: 400,
			error: 'Missing Proof-of-Work nonce solution.'
		};
	}

	const isValid = await core.crypto.verifyPoW(token, nonce, slug, { minSubmissionTimeMs: 3000 });
	if (!isValid) {
		return {
			isValid: false,
			status: 400,
			error: 'Anti-bot verification failed or token expired. Please reload and try again.'
		};
	}

	const contentCheck = inspectCommentContent(content);
	if (!contentCheck.pass) {
		return {
			isValid: false,
			status: 400,
			error: contentCheck.reason
		};
	}

	return { isValid: true };
}
