// @ts-check
import { writable } from 'svelte/store';

export const isDarkTheme = writable(false);

/**
 * Initialize theme based on localStorage or OS preference
 */
export function initTheme() {
	if (typeof window === 'undefined') return;
	const theme = localStorage.getItem('theme');
	const isDark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
	isDarkTheme.set(isDark);
	if (isDark) {
		document.documentElement.classList.add('dark');
	} else {
		document.documentElement.classList.remove('dark');
	}
}

/**
 * Toggle dark and light theme
 */
export function toggleTheme() {
	if (typeof window === 'undefined') return;
	isDarkTheme.update((current) => {
		const next = !current;
		if (next) {
			document.documentElement.classList.add('dark');
			localStorage.setItem('theme', 'dark');
		} else {
			document.documentElement.classList.remove('dark');
			localStorage.setItem('theme', 'light');
		}
		return next;
	});
}
