# Project: Decoupled Edge CMS Core & Universal Edge API

## Architecture

- **Web Standards Core (`src/lib/core/`)**:
  - Independent, zero-dependency business logic layer.
  - Zero imports from `@sveltejs/kit`, `$app/*`, or `$env/*`.
  - Pure Web Standards: `crypto.subtle`, standard Web `Request`/`Response`, `fetch`, `TextEncoder`/`TextDecoder`, `atob`/`btoa`.
  - Modules:
    - `crypto/`: `password.js` (PBKDF2-SHA256, constant-time compare), `pow.js` (anti-spam challenge & solution verification), `utils.js` (base64url, timing safe equal).
    - `auth/`: `jwt.js` (using `jose` for HS256 sign/verify), `auth-service.js` (master admin & tenant settings authentication), `token-extractor.js`.
    - `tenant/`: `resolver.js` (`resolveTenant(request, config)` checking `x-tenant-domain` -> `?tenant=` -> hostname -> default).
    - `storage/`: `interface.js` (`StorageAdapter`), `memory.js` (`MemoryStorageAdapter`), `fs.js` (`FsStorageAdapter`), `github.js` (`GitHubStorageAdapter`).
    - `content/`: `engine.js` (`ContentEngine` for posts, projects, videos, settings, leads, comments, categories, tags).
    - `index.js`: `createEdgeCMSCore(config)` DI entry point.
- **Universal Edge API (`/api/v1/`)**:
  - Public standard HTTP endpoints:
    - `GET /api/v1/posts`: List published posts for tenant.
    - `GET /api/v1/posts/[slug]`: Single post detail.
    - `GET /api/v1/projects`: List projects.
    - `GET /api/v1/settings`: Public tenant settings (theme, title, profile).
    - `GET /api/v1/challenge`: Generate PoW challenge token for anti-spam.
    - `POST /api/v1/leads`: Lead capture enforcing PoW verification via `X-PoW-Token` and `X-PoW-Nonce` headers or body payload.
    - `POST /api/v1/auth/login`: Authenticate master admin or tenant password and issue signed JWT.
  - Universal tenant resolution via `x-tenant-domain` header, `?tenant=` query parameter, or Host header.
- **SvelteKit Reference Integration (`src/lib/server/core.js` & Routes)**:
  - Centralized server adapter initializing `EdgeCMSCore` with `$env/dynamic/private`.
  - `hooks.server.js` using core tenant resolver and session token extractor.
  - Public Storefront (all 4 theme presets: Apple OLED, Academic, Executive, Wellness) preserving 100% visual and functional parity.
  - Admin Portal preserving cookie authentication (`sb-access-token`), Tiptap editor, leads, settings, and video CRUD.
- **Independent Test Suite (`tests/core/` & `tests/e2e/`)**:
  - Standalone unit tests running directly via `node --test` with zero framework dependencies.
  - Full E2E testing track verifying opaque-box contract.

## Feature Inventory

| #   | Feature                    | Description                                                                                | Milestone | Source              |
| --- | -------------------------- | ------------------------------------------------------------------------------------------ | --------- | ------------------- |
| 1   | `core-crypto-password`     | Web Crypto PBKDF2-SHA256 password hashing & constant-time verify                           | M1        | Survey (Explorer 2) |
| 2   | `core-crypto-pow`          | Web Crypto PoW challenge generator and solver/verifier (no Buffer)                         | M1        | Survey (Explorer 2) |
| 3   | `core-auth-jwt`            | `jose` HS256 JWT signing, verification, and claims extraction                              | M1        | Survey (Explorer 2) |
| 4   | `core-auth-service`        | Config-injected master and tenant credential verification                                  | M1        | Survey (Explorer 2) |
| 5   | `core-tenant-resolver`     | Pure Web `resolveTenant` from `x-tenant-domain`, `?tenant=`, host                          | M1        | Survey (Explorer 3) |
| 6   | `core-storage-adapters`    | `StorageAdapter` interface, Memory, Fs, and GitHub adapters                                | M1        | Survey (Explorer 1) |
| 7   | `core-content-engine`      | Unified `ContentEngine` for posts, projects, videos (full CRUD), settings, leads, comments | M1        | Survey (Explorer 1) |
| 8   | `core-di-entrypoint`       | `createEdgeCMSCore(config)` with zero SvelteKit/framework imports                          | M1        | Survey (Explorer 1) |
| 9   | `core-portability-tests`   | Standalone `node --test tests/core/*.test.js` in bare Node runtime                         | M1        | Survey (Explorer 2) |
| 10  | `api-posts-list`           | `GET /api/v1/posts` listing posts for resolved tenant                                      | M2        | Survey (Explorer 3) |
| 11  | `api-posts-detail`         | `GET /api/v1/posts/[slug]` single post for resolved tenant                                 | M2        | Survey (Explorer 3) |
| 12  | `api-projects-list`        | `GET /api/v1/projects` listing projects for resolved tenant                                | M2        | Survey (Explorer 3) |
| 13  | `api-settings`             | `GET /api/v1/settings` tenant configuration JSON                                           | M2        | Survey (Explorer 3) |
| 14  | `api-challenge`            | `GET /api/v1/challenge` anti-spam PoW challenge generator                                  | M2        | Survey (Explorer 3) |
| 15  | `api-leads-pow`            | `POST /api/v1/leads` requiring valid PoW token and nonce                                   | M2        | Survey (Explorer 3) |
| 16  | `api-auth-login`           | `POST /api/v1/auth/login` returning signed JWT                                             | M2        | Survey (Explorer 3) |
| 17  | `sveltekit-core-adapter`   | `src/lib/server/core.js` and `src/lib/content.server.js` bridge adapter                    | M3        | Survey (Explorer 3) |
| 18  | `sveltekit-hooks-rewire`   | `hooks.server.js` using `resolveTenant` and core auth token extractor                      | M3        | Survey (Explorer 3) |
| 19  | `sveltekit-routes-rewire`  | Storefront & Admin server loaders rewired to core engine                                   | M3        | Survey (Explorer 3) |
| 20  | `admin-videos-crud-fix`    | Consolidate videos CRUD to core engine, eliminating ad-hoc writes                          | M3        | Survey (Explorer 1) |
| 21  | `admin-auth-cookie-parity` | Preserve `sb-access-token` cookie auth for Admin portal                                    | M3        | Survey (Explorer 2) |
| 22  | `e2e-test-suite`           | Requirement-driven test harness and test cases (Tiers 1-4)                                 | E2E-TEST  | Survey (All)        |
| 23  | `e2e-pass-and-harden`      | 100% pass of E2E suite and Tier 5 adversarial hardening                                    | M4        | Survey (All)        |

## Milestones

| #   | Name                               | Scope                                                                                    | Dependencies | Status |
| --- | ---------------------------------- | ---------------------------------------------------------------------------------------- | ------------ | ------ |
| E2E | E2E Testing Track                  | Requirement-driven opaque-box test suite (Tiers 1-4) published via `docs/TESTING.md`     | none         | DONE   |
| M1  | Decoupled Web Standards Core       | Build `src/lib/core/` (crypto, auth, tenant, storage, content, DI) + `node --test` suite | none         | DONE   |
| M2  | Universal Edge API (`/api/v1/`)    | Implement `/api/v1/` REST endpoints with multi-tenant resolution and PoW validation      | M1           | DONE   |
| M3  | SvelteKit Integration & Parity     | Rewire SvelteKit services/loaders to core; verify 100% storefront & admin parity         | M1           | DONE   |
| M4  | Final Milestone: E2E Pass & Harden | Pass 100% of E2E test suite (Tiers 1-4) + Tier 5 adversarial coverage hardening          | M2, M3, E2E  | DONE   |

## Interface Contracts

### `src/lib/core/` Configuration Contract

```typescript
interface CoreConfig {
	rootDomain?: string;
	jwtSecret: string;
	jwtExpiresIn?: string;
	adminPassword?: string;
	antispamSalt?: string;
	powDifficulty?: string; // e.g. '000'
	storage: StorageAdapter;
}
```

### StorageAdapter Interface

```typescript
interface StorageAdapter {
	read(path: string): Promise<string | null>;
	write(path: string, content: string): Promise<void>;
	delete(path: string): Promise<void>;
	list(prefix: string): Promise<string[]>;
}
```

### Core Engine Interface

```typescript
interface EdgeCMSCore {
	tenant: {
		resolveTenant(request: Request, config?: { rootDomain?: string }): string;
	};
	crypto: {
		hashPassword(password: string): Promise<string>;
		verifyPassword(password: string, hash: string): Promise<boolean>;
		createPoWChallenge(
			resource: string
		): Promise<{ token: string; difficulty: string; timestamp: number }>;
		verifyPoW(token: string, nonce: number | string, resource: string): Promise<boolean>;
	};
	auth: {
		signToken(payload: object, expiresIn?: string): Promise<string>;
		verifyToken(token: string): Promise<{ valid: boolean; payload?: any; error?: string }>;
		authenticate(
			credentials: { password: string },
			tenantSettings?: any
		): Promise<{ success: boolean; user?: any; token?: string; error?: string }>;
		extractToken(request: Request, cookieHeader?: string | null): string | null;
	};
	content: {
		getPosts(tenant: string, options?: any): Promise<any[]>;
		getPostBySlug(tenant: string, slug: string): Promise<any | null>;
		savePost(tenant: string, post: any): Promise<any>;
		deletePost(tenant: string, slug: string): Promise<void>;
		getProjects(tenant: string): Promise<any[]>;
		saveProject(tenant: string, project: any): Promise<any>;
		deleteProject(tenant: string, id: string): Promise<void>;
		getVideos(tenant: string): Promise<any[]>;
		createVideo(tenant: string, video: any): Promise<any>;
		updateVideo(tenant: string, id: string, video: any): Promise<any>;
		deleteVideo(tenant: string, id: string): Promise<void>;
		getSettings(tenant: string): Promise<any>;
		saveSettings(tenant: string, settings: any): Promise<any>;
		getLeads(tenant: string): Promise<any[]>;
		addLead(tenant: string, lead: any): Promise<any>;
		getComments(tenant: string, postSlug: string): Promise<any[]>;
		addComment(tenant: string, postSlug: string, comment: any): Promise<any>;
		getCategories(tenant: string): Promise<any[]>;
		getTags(tenant: string): Promise<any[]>;
	};
}
```

### Edge API Contracts (`/api/v1/`)

- Headers:
  - `x-tenant-domain`: Target tenant domain (optional, defaults to host or 'default').
  - `Authorization`: `Bearer <jwt_token>` (for protected endpoints).
  - `X-PoW-Token`: Challenge token string (for `POST /api/v1/leads`).
  - `X-PoW-Nonce`: Nonce integer/string (for `POST /api/v1/leads`).
- Response formats:
  - Success: JSON object or array.
  - Error: `{ "error": string, "code"?: string }` with appropriate HTTP status (400, 401, 403, 404, 500).

## Code Layout

- `src/lib/core/` (Web Standards Core)
  - `index.js`: Factory `createEdgeCMSCore(config)`.
  - `crypto/`: `password.js`, `pow.js`, `utils.js`.
  - `auth/`: `jwt.js`, `auth-service.js`, `token-extractor.js`.
  - `tenant/`: `resolver.js`.
  - `storage/`: `interface.js`, `memory.js`, `fs.js`, `github.js`.
  - `content/`: `engine.js`.
- `src/routes/api/v1/` (Headless REST Endpoints)
  - `posts/+server.js`
  - `posts/[slug]/+server.js`
  - `projects/+server.js`
  - `settings/+server.js`
  - `challenge/+server.js`
  - `leads/+server.js`
  - `auth/login/+server.js`
- `src/lib/server/`
  - `core.js`: Singleton instance initialized with SvelteKit environment.
- `tests/`
  - `core/`: Unit tests directly invoking `src/lib/core/` via bare `node --test`.
  - `e2e/`: Opaque-box E2E test harness and test cases (Tiers 1-4).
