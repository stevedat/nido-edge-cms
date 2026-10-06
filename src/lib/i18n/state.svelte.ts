export type Locale = 'vi' | 'en';

export const SUPPORTED_LOCALES: Locale[] = ['vi', 'en'];
export const DEFAULT_LOCALE: Locale = 'vi';

// Global reactive state in .svelte.ts file so Svelte 5 runes compiler processes it
let currentLocale = $state<Locale>(DEFAULT_LOCALE);

/**
 * Initialize locale from server load or cookie
 */
export function initLocale(initialLocale?: string | null) {
	if (initialLocale && (initialLocale === 'vi' || initialLocale === 'en')) {
		currentLocale = initialLocale;
	} else if (typeof document !== 'undefined') {
		const match = document.cookie.match(/(?:^|; )locale=([^;]*)/);
		if (match && (match[1] === 'vi' || match[1] === 'en')) {
			currentLocale = match[1] as Locale;
		}
	}
	if (typeof document !== 'undefined') {
		document.documentElement.lang = currentLocale;
	}
}

/**
 * Switch locale reactively and persist to cookie
 */
export function setLocale(locale: Locale) {
	if (!SUPPORTED_LOCALES.includes(locale)) return;
	currentLocale = locale;

	if (typeof document !== 'undefined') {
		document.cookie = `locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
		document.documentElement.lang = locale;
	}
}

/**
 * Get current active locale (reactive)
 */
export function getLocale(): Locale {
	return currentLocale;
}
