# CLAUDE.md

## Project Overview

Restaurant website — Next.js 16 frontend using Sanity Content Lake as its CMS. The `backend/` directory is an inert, read-only archive of the decommissioned Strapi backend.

## Project Structure

```
dannys-fish-and-chips/
├── frontend/              # Next.js 16 (React 18, TypeScript, Tailwind CSS 4)
│   ├── src/
│   │   ├── app/(site)/    # App Router pages (route group)
│   │   ├── components/
│   │   │   ├── custom/layout/      # Page-level business components
│   │   │   ├── custom/collection/  # Collection/list components
│   │   │   ├── seo/                # SEO components (JSON-LD)
│   │   │   └── ui/                 # Primitives (block-renderer, navigation, etc.)
│   │   ├── data/          # Sanity API client (data-api.ts) and data loaders (loaders.ts)
│   │   ├── lib/           # utils, config, error-handler, structured-data
│   │   └── types/         # TypeScript definitions (index.ts)
│   ├── e2e/               # Playwright tests
│   └── scripts/           # Test environment setup
├── backend/               # Inert Strapi archive (see ARCHIVE.md)
│   └── ARCHIVE.md         # Archive status and purpose
├── supabase/              # Supabase config
├── .github/workflows/     # CI/CD pipelines
└── docs/                  # PRD and cutover/decommission docs
```

## Commands

```bash
npm run install:all          # Install frontend dependencies
npm run dev                  # Start frontend (:3000)
npm run dev:frontend         # Frontend only
npm run build                # Build frontend

# Testing & checks (from frontend/)
cd frontend
npm run test:e2e             # Playwright tests
npm run test:e2e:ui          # Interactive UI mode
npx playwright test e2e/home.spec.ts  # Single test file
npm run lint                 # ESLint
npx tsc --noEmit             # Type check
```

## Tech Stack

- **Frontend**: Next.js 16, React 18, TypeScript, Tailwind CSS 4, Radix UI, motion-plus
- **CMS**: Sanity Content Lake (embedded Studio at `/studio`)
- **Testing**: Playwright
- **Deployment**: Vercel (frontend)

## Code Patterns

### Data Layer

All data fetching goes through the centralized data layer — never fetch in components directly.

- `data/data-api.ts` — Sanity client with timeout, auth, error handling
- `data/loaders.ts` — Page-specific data loaders that call `data-api.ts`
- `lib/error-handler.ts` — `handleApiError()` / `validateApiResponse()` for consistent error handling in routes
- `lib/config.ts` — Environment-based API timeout configuration

### Components

- Server components by default (`"use client"` only for hooks, event handlers, browser APIs)
- Use `cn()` from `lib/utils` for class merging (clsx + tailwind-merge)

### ISR Caching

Most site pages use revalidate = 1800; announcement uses 300; layout has custom cache behavior.

### Imports

Use `@/` path alias: `import { HeroSection } from "@/components/custom/layout/hero-section"`

## Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `HeroSection` |
| Functions | camelCase | `loadHomePageData()` |
| Files | kebab-case | `hero-section.tsx` |
| Types | PascalCase with T/I prefix | `THomePage`, `IProps` |

## Environment Variables

- **Frontend** (`frontend/.env.local`): `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION`, `SANITY_API_READ_TOKEN`
- **Backend** (`backend/`): inert archive; no env vars are required or used

## Key Files

- `frontend/src/data/data-api.ts` — Sanity API client
- `frontend/src/data/loaders.ts` — Page data loaders
- `frontend/src/lib/error-handler.ts` — API error handling
- `frontend/src/lib/config.ts` — API timeout config
- `frontend/src/types/index.ts` — TypeScript types
- `frontend/src/components/ui/block-renderer.tsx` — Dynamic block rendering
- `backend/ARCHIVE.md` — Backend archive status
- `.github/workflows/ci.yml` — CI pipeline

## Change Principles

- Prefer additive changes over refactors; refactors require a stated payoff
- All boundaries are explicit: Frontend ↔ Sanity API, Server ↔ Client components
- No ad-hoc fetches or inline magic strings for endpoints or env vars
- External inputs (Sanity responses, env vars) must be validated at boundary
- Changes affecting Sanity schemas require paired frontend type/loader updates

## Anti-Patterns

- **Don't add inline styles** — use Tailwind classes
- **Don't fetch data in components** — use centralized loaders in `data/loaders.ts`
- **Don't create new API endpoints** — work with existing Sanity schemas unless explicitly asked

## Troubleshooting

- **Port in use**: `lsof -ti:3000 | xargs kill -9`
- **Sanity API issues**: Verify `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, and `SANITY_API_READ_TOKEN` in `frontend/.env.local`
- **Type errors after Sanity schema changes**: Update `types/index.ts`, then `loaders.ts` if API shape changed, verify with `npx tsc --noEmit`
- **E2E failures**: Ensure frontend is running; debug with `npm run test:e2e:ui`
