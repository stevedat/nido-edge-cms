// @ts-check
import { json } from '@sveltejs/kit';
import { getCurrentUser } from '$lib/server/auth.js';
import { core } from '$lib/server/core.js';
import { sanitizeTenantDomain } from '$lib/core/index.js';

const SYSTEM_PROMPT = `You are an expert SvelteKit engineer and CMS System Architect.
The user wants to generate a website. Your task is to output exactly one valid JSON object containing:

{
  "ui": "<Svelte component source code>",
  "schema": [
    { "id": "field_name", "label": "Label", "type": "text | image | number | rich-text" }
  ]
}

RULES FOR SOURCE CODE (ui):
1. Svelte source code must only use Tailwind v4 classes and project semantic CSS variable tokens:
   - Backgrounds: bg-main-bg, bg-soft-bg, bg-surface
   - Text: text-text-main, text-text-muted, text-primary
   - Borders: border-border-subtle, border-border-strong
2. NEVER use hardcoded hex colors or raw color utilities (e.g. #000, #fff, bg-gray-100, bg-white).
3. ALL DYNAMIC DATA (e.g. services, pricing, testimonials) MUST NOT be hardcoded. Bind it via \`data.dynamicData.XYZ\`.
   Example: \`{#each data.dynamicData.services as service}\` instead of hardcoding items.

RULES FOR CMS STRUCTURE (schema):
1. Based on the dynamic data used in the Svelte code, define a JSON schema array for the CMS admin interface.
2. Each schema field requires id (matching data key), label (display name), and type (data type).
3. Ensure the schema covers all necessary dynamic fields so users can edit everything in the admin panel.

Return ONLY a valid JSON string without markdown code fences or backticks.`;

/**
 * Resolve the tenant this request operates on.
 *
 * hooks.server.js returns early for /api/v1/** and therefore never populates
 * locals.domain, so the tenant has to be derived here. The admin tenant picker
 * persists to the `admin_tenant` cookie, which takes precedence; otherwise fall
 * back to the shared resolver. Either way the value is sanitised, because it is
 * interpolated into storage paths below.
 *
 * @param {Request} request
 * @param {import('@sveltejs/kit').Cookies} cookies
 */
function resolveBuilderTenant(request, cookies) {
	return sanitizeTenantDomain(cookies.get('admin_tenant') || core.tenant.resolveTenant(request));
}

/**
 * GET /api/v1/builder/generate
 * Returns the system prompt so the admin UI can offer a "copy prompt" flow.
 *
 * @type {import('./$types').RequestHandler}
 */
export async function GET({ request, cookies }) {
	const user = await getCurrentUser(request, cookies);
	if (!user) {
		return json({ message: 'Authentication required' }, { status: 401 });
	}

	return json({ systemPrompt: SYSTEM_PROMPT });
}

/**
 * POST /api/v1/builder/generate
 * Writes the generated homepage and its CMS schema into the repository.
 *
 * Restricted to the master admin: the Svelte files it writes
 * (`src/routes/(public)/+page.svelte` and `+layout.server.js`) are shared by
 * every tenant, so letting a tenant admin run this would let one customer
 * overwrite another customer's homepage.
 *
 * @type {import('./$types').RequestHandler}
 */
export async function POST({ request, cookies }) {
	const user = await getCurrentUser(request, cookies);
	if (!user) {
		return json({ message: 'Authentication required' }, { status: 401 });
	}
	if (user.id !== 'admin') {
		return json({ message: 'Only the master admin can generate site templates' }, { status: 403 });
	}

	/** @type {any} */
	let body;
	try {
		body = await request.json();
	} catch {
		return json({ message: 'Invalid JSON request body' }, { status: 400 });
	}

	const { mode, prompt, apiKey, provider, manualPayload } = body ?? {};

	try {
		let generatedUi = '';
		/** @type {Array<{ id: string; label?: string; type?: string }>} */
		let generatedSchema = [];

		if (mode === 'manual') {
			if (typeof manualPayload !== 'string' || !manualPayload.trim()) {
				return json({ message: 'Missing manual JSON payload' }, { status: 400 });
			}

			// Allow parsing even if they pasted markdown ```json ... ```
			let cleanPayload = manualPayload.trim();
			if (cleanPayload.startsWith('```json')) {
				cleanPayload = cleanPayload
					.replace(/^```json/, '')
					.replace(/```$/, '')
					.trim();
			} else if (cleanPayload.startsWith('```')) {
				cleanPayload = cleanPayload.replace(/^```/, '').replace(/```$/, '').trim();
			}

			/** @type {any} */
			let parsed;
			try {
				parsed = JSON.parse(cleanPayload);
			} catch {
				return json({ message: 'Invalid JSON: could not parse payload' }, { status: 400 });
			}

			if (!parsed?.ui || !Array.isArray(parsed?.schema)) {
				return json(
					{ message: "Invalid JSON: must contain 'ui' and a 'schema' array" },
					{ status: 400 }
				);
			}

			generatedUi = String(parsed.ui);
			generatedSchema = parsed.schema;
		} else {
			// Auto API Mode
			if (!prompt || !apiKey) {
				return json({ message: 'Missing prompt or apiKey' }, { status: 400 });
			}

			if (provider === 'gemini') {
				const res = await fetch(
					`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
					{
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
							contents: [{ parts: [{ text: prompt }] }],
							generationConfig: {
								response_mime_type: 'application/json'
							}
						})
					}
				);

				if (!res.ok) {
					const errorData = await res.json().catch(() => ({}));
					throw new Error(errorData?.error?.message || 'Gemini API Error');
				}

				const data = await res.json();
				const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
				if (typeof textResponse !== 'string') {
					throw new Error('Gemini returned an empty completion');
				}

				const parsed = JSON.parse(textResponse);
				if (!parsed?.ui || !Array.isArray(parsed?.schema)) {
					throw new Error("Gemini output must contain 'ui' and a 'schema' array");
				}
				generatedUi = String(parsed.ui);
				generatedSchema = parsed.schema;
			} else {
				return json({ message: 'Provider not fully implemented yet' }, { status: 400 });
			}
		}

		const tenant = resolveBuilderTenant(request, cookies);
		const storage = core.storage;

		// Ensure the generated component receives its data through $props
		const svelteCode = `<script>
	let { data } = $props();
</script>

${generatedUi}
`;

		await storage.write(
			'src/routes/(public)/+page.svelte',
			svelteCode,
			'feat(builder): regenerate public homepage [skip ci]'
		);

		await storage.write(
			`src/content/${tenant}/schema.json`,
			JSON.stringify({ _generatedBy: 'AI-Builder', fields: generatedSchema }, null, 2),
			`feat(builder): update schema for ${tenant} [skip ci]`
		);

		// Seed a mock data structure so the frontend doesn't crash before first save
		/** @type {Record<string, any>} */
		const mockData = { dynamicData: {} };
		for (const field of generatedSchema) {
			if (!field || typeof field.id !== 'string' || !field.id) continue;
			if (field.type === 'text' || field.type === 'rich-text') {
				mockData.dynamicData[field.id] = 'Generated Content';
			}
			if (field.type === 'number') {
				mockData.dynamicData[field.id] = 0;
			}
			if (field.type === 'image') {
				mockData.dynamicData[field.id] = 'https://placehold.co/600x400';
			}
			// Simple array handling for repetitive blocks
			if (field.id.endsWith('s') || field.id.endsWith('List')) {
				mockData.dynamicData[field.id] = [];
			}
		}

		await storage.write(
			`src/content/${tenant}/dynamicData.json`,
			JSON.stringify(mockData, null, 2),
			`feat(builder): seed dynamic data for ${tenant} [skip ci]`
		);

		// Provide that data to the public routes
		const layoutServerCode = `import { core } from '$lib/server/core.js';

export async function load({ locals }) {
	const tenant = locals.domain || 'default';
	let dynamicData = {};
	try {
		const raw = await core.storage.read(\`src/content/\${tenant}/dynamicData.json\`);
		if (raw) {
			const parsed = JSON.parse(raw);
			dynamicData = parsed.dynamicData || parsed;
		}
	} catch {
		// Missing or malformed dynamic data is not fatal for the page
	}

	return {
		domain: tenant,
		dynamicData
	};
}
`;
		await storage.write(
			'src/routes/(public)/+layout.server.js',
			layoutServerCode,
			'feat(builder): wire dynamic data into public layout [skip ci]'
		);

		return json({
			success: true,
			message: 'Website generated successfully',
			tenant
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Website generation failed';
		return json({ message }, { status: 500 });
	}
}
