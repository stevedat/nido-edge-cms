import adapterCloudflare from '@sveltejs/adapter-cloudflare';
import adapterVercel from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const isCloudflare = Boolean(process.env.CF_PAGES || process.env.DEPLOY_TARGET === 'cloudflare');
const adapter = isCloudflare
	? adapterCloudflare()
	: adapterVercel({
			runtime: 'nodejs22.x'
		});

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter
	}
};

export default config;
