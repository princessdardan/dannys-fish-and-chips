# Project: Danny's Fish & Chips

A Next.js 16 frontend using Sanity Content Lake as its CMS. `backend/` is an inert archive of the decommissioned Strapi backend and is not built, run, or deployed. Not an npm workspace.

## Package Boundaries

- `frontend/` — Next.js 16, React 18, TypeScript, Tailwind CSS 4. Own `package-lock.json`.
- `backend/` — Inert Strapi archive. See `backend/ARCHIVE.md`. No installs, builds, or deployments.
- Root has no lockfile and no shared node_modules.

## Commands

Run from root unless noted.

| What | Command |
|------|---------|
| Install all | `npm run install:all` |
| Dev | `npm run dev` |
| Dev frontend only | `npm run dev:frontend` |
| Build | `npm run build` |

From `frontend/`:

| What | Command |
|------|---------|
| Dev | `npm run dev` |
| Build | `npm run build` |
| Lint | `npm run lint` |
| Type check | `npx tsc --noEmit` |
| E2E | `npm run test:e2e` |
| E2E UI mode | `npm run test:e2e:ui` |
| E2E headed | `npm run test:e2e:headed` |
| E2E debug | `npm run test:e2e:debug` |
| Single spec | `npx playwright test e2e/home.spec.ts` |
| Single project | `npx playwright test --project=chromium` |
| CI-equivalent checks | `npm run lint && npx tsc --noEmit && npm run build` |

## Data & Contract Rules

- Frontend fetches Sanity data **only** through `frontend/src/data/data-api.ts` and `frontend/src/data/loaders.ts`. No ad-hoc fetches in components.
- Server components by default; `"use client"` only for hooks/events/browser APIs.
- Use Tailwind classes and `cn()` from `frontend/src/lib/utils.ts`; use `@/` imports in frontend.
- Validate external Sanity/env data at boundaries via existing config/error helpers.
- Sanity schema/API contract changes must be paired with frontend type/loader updates.
- Prefer additive changes; avoid broad refactors/cleanup.

## Key File Boundaries

### Frontend
- App shell: `frontend/src/app/(site)/layout.tsx`
- Pages: `frontend/src/app/(site)/*/page.tsx`
- Sanity API boundary: `frontend/src/data/data-api.ts`
- Page loaders/populate queries: `frontend/src/data/loaders.ts`
- Dynamic-zone rendering: `frontend/src/components/ui/layout-block-renderer.tsx`

### Backend
- `backend/` is an inert archive. Do not modify, build, or run it. See `backend/ARCHIVE.md` for status and historical context.

## Environment & Toolchain

- Node: executable truth is Node 20 (CI) and package engines `>=20 <=24`.
- Frontend preinstall hook runs `frontend/scripts/setup-motion.mjs`; it needs `MOTION_DEV_TOKEN` unless `frontend/.cache/motion-plus-2.0.2.tgz` exists. Vercel install runs `node scripts/setup-motion.mjs && npm install`.
- Frontend build/prerender depends on the Sanity API; no local backend is required.
- Active form/email env is `RESEND_*`. Legacy `S3_*`/`SUPABASE_URL` upload env guidance is external-cleanup only (see `docs/sanity-cutover/EXTERNAL_PLATFORM_CLEANUP.md`).

## Testing & CI Quirks

- Playwright tests exercise the frontend only.
- `global-setup.ts` hardcodes `http://localhost:3000`, even when `PLAYWRIGHT_TEST_BASE_URL` targets a preview URL.

## Stale/Conflicting Docs to Avoid

- `.github/workflows/README.md` references absent cd workflows.
- E2E README says tests run on push/PR but current CI does not run Playwright; preview workflow does.

- Cursor rules say no `any` but archived backend is strict false and uses any.
