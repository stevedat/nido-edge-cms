import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
	plugins: [tailwindcss(), sveltekit()],
	build: {
		emptyOutDir: false
	},
	esbuild: {
		drop: mode === 'production' ? ['console', 'debugger'] : []
	}
}));
