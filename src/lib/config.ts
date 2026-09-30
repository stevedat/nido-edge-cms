/**
 * Default Production Site Configuration
 * Customize via environment variables or settings.json
 */
export const SITE_URL = (typeof process !== 'undefined' && process?.env?.SITE_URL) ? process.env.SITE_URL : 'https://example.com';
export const SITE_NAME = 'Edge CMS';
export const SITE_AUTHOR = 'Edge CMS Community';
export const TWITTER_HANDLE = '@edgecms';
