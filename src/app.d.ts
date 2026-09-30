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
			};
			isAuthenticated: boolean;
			domain?: string;
			locale?: 'vi' | 'en';
			settings?: any;
		}
		interface PageData {
			domain?: string;
			settings?: any;
			isAuthenticated?: boolean;
			locale?: 'vi' | 'en';
			[key: string]: any;
		}
		// interface PageState {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
