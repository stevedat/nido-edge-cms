import { cn } from './cn.js';

export type SurfaceVariant = 'card' | 'soft' | 'main' | 'primary' | 'ghost' | 'island';
export type SurfaceRadius = 'xl' | '2xl' | '3xl' | 'full';

export interface SurfaceOptions {
	/**
	 * Visual recipe mapped to Nido Edge CMS semantic tokens:
	 * - `card`: Elevated surface (`bg-surface border-border-subtle`)
	 * - `soft`: Secondary section fill (`bg-soft-bg border-border-subtle`)
	 * - `main`: Page-level canvas (`bg-main-bg border-border-subtle`)
	 * - `primary`: High-emphasis primary action fill (`bg-primary text-main-bg`)
	 * - `ghost`: Transparent surface that reveals `bg-soft-bg` on hover
	 * - `island`: Translucent Apple Studio island container (`island-container`)
	 */
	variant?: SurfaceVariant;
	/**
	 * Border radius tier following Law 3 hierarchy (`rounded-xl`, `rounded-2xl`, `rounded-3xl`, `rounded-full`).
	 */
	radius?: SurfaceRadius;
	/**
	 * Adds hover border/background transition, haptic press feedback (`active:scale-98`), and touch-adaptive height.
	 */
	interactive?: boolean;
	/**
	 * Enables subtle top-edge light reflection (`.specular-highlight`) for Apple Minimalist / OLED Dark depth.
	 */
	specular?: boolean;
	/**
	 * Enables frosted backdrop blur (`backdrop-blur-md`).
	 */
	glass?: boolean;
	/**
	 * Additional Tailwind classes merged safely via `cn()`.
	 */
	class?: string;
}

const VARIANT_CLASSES: Record<SurfaceVariant, string> = {
	card: 'bg-surface text-text-main border border-border-subtle',
	soft: 'bg-soft-bg text-text-main border border-border-subtle',
	main: 'bg-main-bg text-text-main border border-border-subtle',
	primary: 'bg-primary text-main-bg border border-transparent font-medium',
	ghost: 'bg-transparent text-text-body border border-transparent',
	island: 'island-container text-text-main'
};

const INTERACTIVE_VARIANT_CLASSES: Record<SurfaceVariant, string> = {
	card: 'hover:bg-soft-bg hover:border-border-strong',
	soft: 'hover:bg-surface hover:border-border-strong',
	main: 'hover:bg-soft-bg hover:border-border-strong',
	primary: 'hover:opacity-90',
	ghost: 'hover:bg-soft-bg hover:text-text-main hover:border-border-subtle',
	island: 'hover:border-border-strong'
};

const RADIUS_CLASSES: Record<SurfaceRadius, string> = {
	xl: 'rounded-xl',
	'2xl': 'rounded-2xl',
	'3xl': 'rounded-3xl',
	full: 'rounded-full'
};

/**
 * Composes semantic Tailwind v4 classes for Nido Edge CMS surfaces, cards, and interactive controls.
 * Inspired by `bref-ui`'s `surface()` recipe, adapted strictly to Nido Edge CMS's 5 Immutable Laws.
 */
export function surface(options: SurfaceOptions = {}): string {
	const {
		variant = 'card',
		radius = variant === 'card' || variant === 'island' ? '3xl' : 'xl',
		interactive = false,
		specular = variant === 'card' || variant === 'island',
		glass = false,
		class: className
	} = options;

	return cn(
		VARIANT_CLASSES[variant],
		RADIUS_CLASSES[radius],
		specular && 'specular-highlight',
		glass && 'backdrop-blur-md bg-surface/80',
		interactive && [
			'touch-target cursor-pointer transition-all duration-150 active:scale-98',
			INTERACTIVE_VARIANT_CLASSES[variant]
		],
		className
	);
}

/**
 * Structured design-system specification used by `/llms.txt` and the AI Builder (`/api/v1/builder/generate`)
 * so AI agents can discover, compose, and verify Nido Edge CMS interfaces without hallucinating classes.
 */
export const DESIGN_SYSTEM_DOCS = {
	name: 'Nido Edge CMS Design System',
	philosophy: 'Apple Minimalist · WCAG AAA · OLED Dark Mode (#000000) · Edge Multi-tenant',
	tokens: {
		backgrounds: [
			{ token: 'bg-main-bg', description: 'Page canvas (#f5f5f7 light / #000000 OLED dark)' },
			{ token: 'bg-soft-bg', description: 'Secondary section fill & subtle hover fill' },
			{
				token: 'bg-surface',
				description: 'Elevated Card, Dialog, Modal, Drawer (#ffffff light / #1c1c1e dark)'
			}
		],
		borders: [
			{
				token: 'border-border-subtle',
				description: 'Hairline border (9% light / 14% dark reflection)'
			},
			{ token: 'border-border-strong', description: 'Emphasized or hovered border' }
		],
		typography: [
			{ token: 'text-text-main', description: 'Primary headings & high-contrast AAA text' },
			{ token: 'text-text-body', description: 'Body copy & paragraphs' },
			{ token: 'text-text-muted', description: 'Captions, metadata, timestamps' },
			{ token: 'text-primary', description: 'Brand accent color (#0066cc light / #2997ff dark)' }
		],
		utilities: [
			{
				token: 'specular-highlight',
				description: 'Top-edge inner specular reflection for cards on OLED dark mode'
			},
			{
				token: 'island-container',
				description: 'Color-mixed translucent section frame with rounded-3xl border'
			},
			{
				token: 'touch-target',
				description: 'Pointer-adaptive minimum height (36px fine pointer / 44px coarse touch)'
			}
		]
	},
	rules: [
		'NEVER use hardcoded hex colors or raw Tailwind palette classes (no bg-white, bg-black, bg-slate-*, text-gray-*).',
		'Every lucide-svelte icon MUST declare strokeWidth={1.75} (except Check which uses strokeWidth={2.25}).',
		'Interactive buttons, inputs, and links must meet 44px touch targets on mobile (min-h-[44px] or touch-target) and include active:scale-98 or active:scale-95.',
		'Border radius hierarchy: Cards/Sections use rounded-3xl (or rounded-2xl), Buttons/Inputs use rounded-xl (or rounded-2xl), Badges/Pills use rounded-full.',
		'Use surface({ variant, radius, interactive, specular, glass }) from $lib/utils/surface to compose consistent semantic surfaces.'
	]
} as const;
