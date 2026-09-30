# Contributing to Nido Edge CMS

Thank you for your interest in contributing to **Nido Edge CMS**! 

## Development Setup

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/<your-username>/nido-edge-cms.git
   cd nido-edge-cms
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create local environment file:
   ```bash
   cp .env.example .env
   ```
4. Start dev server:
   ```bash
   npm run dev
   ```

## Guidelines

- All UI components must use **Semantic Design Tokens** defined in `src/routes/layout.css` (No hardcoded hex or raw colors).
- All Lucide icons must specify `strokeWidth={1.75}`.
- Ensure bilingual parity (`vi.ts` and `en.ts`) for any user-facing text.
- Run `npm run check` and `npm run build` before submitting a Pull Request.
- Run `node scripts/audit-design-system.mjs` to verify zero design token regressions.
