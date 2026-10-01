import { vi } from './translations/vi.js';
import { en } from './translations/en.js';
import { getLocale, setLocale, initLocale, SUPPORTED_LOCALES, DEFAULT_LOCALE, type Locale } from './state.svelte.js';

export type { Locale };
export { getLocale, setLocale, initLocale, SUPPORTED_LOCALES, DEFAULT_LOCALE };

const translations: Record<Locale, typeof vi> = {
	vi,
	en
};

/**
 * Server-side robust translation (thread-safe, does not rely on global getLocale)
 */
export function serverT(key: string, locale?: Locale | string | null, params?: Record<string, string | number>): string {
	const activeLocale: Locale = (locale === 'en' || locale === 'vi') ? locale : DEFAULT_LOCALE;
	const dict = translations[activeLocale] || translations[DEFAULT_LOCALE];
	const fallbackDict = translations[DEFAULT_LOCALE];

	const keys = key.split('.');
	let value: any = dict;
	let fallbackValue: any = fallbackDict;

	for (const k of keys) {
		value = value?.[k];
		fallbackValue = fallbackValue?.[k];
	}

	let result: string;
	if (typeof value === 'string') {
		result = value;
	} else if (typeof fallbackValue === 'string') {
		result = fallbackValue;
	} else if (params && typeof params.defaultValue === 'string') {
		result = params.defaultValue;
	} else {
		result = key;
	}

	if (params) {
		for (const [pKey, pVal] of Object.entries(params)) {
			if (pKey === 'defaultValue') continue;
			result = result.replace(new RegExp(`{${pKey}}`, 'g'), String(pVal));
		}
	}

	return result;
}

/**
 * Resolve nested translation keys like 'nav.projects' or 'freeSlotModal.submitBtn'
 */
export function t(key: string, params?: Record<string, string | number>): string {
	const locale = getLocale();
	const dict = translations[locale] || translations[DEFAULT_LOCALE];
	const fallbackDict = translations[DEFAULT_LOCALE];

	const keys = key.split('.');
	let value: any = dict;
	let fallbackValue: any = fallbackDict;

	for (const k of keys) {
		value = value?.[k];
		fallbackValue = fallbackValue?.[k];
	}

	let result: string;
	if (typeof value === 'string') {
		result = value;
	} else if (typeof fallbackValue === 'string') {
		result = fallbackValue;
	} else if (params && typeof params.defaultValue === 'string') {
		result = params.defaultValue;
	} else {
		result = key;
	}

	if (params) {
		for (const [pKey, pVal] of Object.entries(params)) {
			if (pKey === 'defaultValue') continue;
			result = result.replace(new RegExp(`{${pKey}}`, 'g'), String(pVal));
		}
	}

	return result;
}

/**
 * Format date based on active locale
 */
export function formatDate(dateString: string | Date, options?: Intl.DateTimeFormatOptions): string {
	try {
		const d = typeof dateString === 'string' ? new Date(dateString) : dateString;
		const localeCode = getLocale() === 'vi' ? 'vi-VN' : 'en-US';
		const defaultOptions: Intl.DateTimeFormatOptions = options || {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		};
		return new Intl.DateTimeFormat(localeCode, defaultOptions).format(d);
	} catch {
		return String(dateString);
	}
}

/**
 * Calculate localized reading time string
 */
export function formatReadingTime(minutes: number): string {
	if (getLocale() === 'vi') {
		return `${minutes} phút đọc`;
	}
	return `${minutes} min read`;
}

/**
 * Helper to get localized field from an object (e.g. tagline_en, description_en)
 */
export function localized(item: any, field: string): string {
	if (!item) return '';
	if (getLocale() === 'en' && item[`${field}_en`]) {
		return item[`${field}_en`];
	}
	return item[field] || '';
}

/**
 * Helper to get localized array from an object (e.g. highlights_en)
 */
export function localizedArray(item: any, field: string): string[] {
	if (!item) return [];
	if (getLocale() === 'en' && Array.isArray(item[`${field}_en`]) && item[`${field}_en`].length > 0) {
		return item[`${field}_en`];
	}
	return item[field] || [];
}
