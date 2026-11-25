// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user?: {
				id: string;
				email: string;
				username: string;
				name: string;
				role: string;
				avatar: string;
				isActive: boolean;
				branch?: string;
				tenant?: string;
			};
			isAuthenticated: boolean;
			domain?: string;
			locale?: 'vi' | 'en';
			settings?: Record<string, unknown> | null;
		}
		interface PageData {
			domain?: string;
			settings?: Record<string, unknown>;
			isAuthenticated?: boolean;
			locale?: 'vi' | 'en';
			[key: string]: unknown;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
