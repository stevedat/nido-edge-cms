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

## E2E Testing (Zero-Token CI)

This project uses `tester-army/e2e` for AI-native end-to-end testing.

- To run tests using the existing cache (fast and free):
  ```bash
  npm run test:e2e
  ```
- If you are writing new test scenarios using `agent.act()`, you must authenticate first:
  ```bash
  npx e2e login openai
  ```
  After authentication, the agent will generate semantic locators and cache them in `.e2e/cache`. **Make sure to commit `.e2e/cache`** so the CI pipeline remains free and deterministic.
