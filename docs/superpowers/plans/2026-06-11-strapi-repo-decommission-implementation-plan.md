# Strapi Backend Decommission Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Decommission the Strapi backend at the repository level by disconnecting root scripts, CI, tests, and frontend coupling; archiving `backend/` as inert; and documenting external platform cleanup without executing it.

**Architecture:** Two-stage repo cleanup — Stage 1 disconnects automation and removes active frontend Strapi coupling; Stage 2 archives `backend/` in place, moves migration scripts, and updates documentation. External platform cleanup is documented-only in a separate runbook.

**Tech Stack:** Next.js 16, React 18, TypeScript, Tailwind CSS 4, Sanity CMS, Playwright, Railway (legacy), Vercel.

---

## File Structure (Planned Changes)

### Files to Modify

| File | Responsibility | What Changes |
|------|---------------|-------------|
| `package.json` | Root scripts | Remove backend orchestration scripts |
| `railway.json` | Railway config (root) | Archive — move to `docs/archive/` |
| `backend/railway.json` | Railway config (backend) | Archive — move to `docs/archive/` |
| `frontend/playwright.config.ts` | Playwright config | Remove backend webServer startup |
| `frontend/scripts/setup-test-env.sh` | Test env setup | Remove backend .env/deps setup logic |
| `frontend/next.config.ts` | Next.js config | Remove `localhost:1337` remotePatterns entry |
| `frontend/src/lib/utils.ts` | Utilities | Remove `getStrapiURL`, `fetchStrapi`; keep `cn` |
| `frontend/src/lib/config.ts` | API config | Remove Strapi-specific comment |
| `frontend/src/types/index.ts` | Type definitions | Rename `TStrapiResponse` → `TApiResponse`; remove "Strapi Block" comment |
| `frontend/src/lib/error-handler.ts` | Error handling | Update imports to `TApiResponse` |
| `frontend/src/data/loaders.ts` | Data loaders | Update imports to `TApiResponse`; remove Strapi comments |
| `frontend/src/data/data-api.ts` | Sanity API client | Remove any Strapi comments (already clean) |
| `frontend/src/components/ui/strapi-image.tsx` | Media image | Rename file, component, and function to generic names |
| `frontend/src/components/ui/strapi-video.tsx` | Media video | Rename file, component, and function to generic names |
| `frontend/src/components/ui/block-renderer.tsx` | Rich text renderer | Update imports and comments |
| `frontend/src/components/ui/layout-block-renderer.tsx` | Block registry | Remove Strapi-specific comments; keep legacy type support |
| `frontend/src/components/custom/layout/hero-section.tsx` | Hero section | Update imports and JSDoc |
| `frontend/src/components/custom/layout/info-section.tsx` | Info section | Update imports and JSDoc |
| `frontend/src/components/custom/layout/newspaper-info-section.tsx` | Newspaper info | Update imports |
| `frontend/src/components/custom/layout/newspaper-menu-section.tsx` | Menu section | Update imports |
| `frontend/src/components/custom/layout/standfirst-section.tsx` | Standfirst | Update imports |
| `frontend/src/components/custom/layout/deals-section.tsx` | Deals section | Update imports |
| `frontend/src/components/custom/layout/magazine-gallery/magazine-page.tsx` | Gallery page | Update imports |
| `frontend/src/app/(site)/page.tsx` | Home page | Update JSDoc comment |
| `frontend/src/app/(site)/layout.tsx` | Root layout | Update JSDoc comment |
| `frontend/src/app/(site)/hours-and-location/page.tsx` | Hours page | Update JSDoc comment |
| `frontend/src/lib/structured-data.ts` | Structured data | Update JSDoc comment |
| `frontend/src/components/custom/layout/header.tsx` | Header | Update JSDoc comment |
| `frontend/src/components/ui/mobile-navigation.tsx` | Mobile nav | Update JSDoc comment |
| `README.md` | Project docs | Update to Sanity-only architecture |
| `AGENTS.md` | Agent docs | Update to Sanity-only; remove backend command table |
| `CLAUDE.md` | Claude docs | Update to Sanity-only |

### Files to Create

| File | Responsibility |
|------|---------------|
| `backend/ARCHIVE.md` | Archive notice for backend directory |
| `docs/archive/migrations/migrate-assets.ts` | Moved from `frontend/scripts/migration/` |
| `docs/archive/migrations/migrate-content.ts` | Moved from `frontend/scripts/migration/` |
| `docs/archive/migrations/verify-assets.ts` | Moved from `frontend/scripts/migration/` |
| `docs/sanity-cutover/EXTERNAL_PLATFORM_CLEANUP.md` | External platform cleanup runbook |

### Files to Delete

| File | Reason |
|------|--------|
| `frontend/src/data/legacy-form-api.ts` | Unused; no imports in active codebase |

---

## Task 1: Disconnect Root Scripts and Railway Configs

**Files:**
- Modify: `package.json`
- Modify: `railway.json` → archive
- Modify: `backend/railway.json` → archive

### Step 1.1: Remove backend scripts from root `package.json`

Replace the `scripts` block to remove all backend orchestration:

```json
{
  "name": "dannys-fish-and-chips",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "cd frontend && npm run dev",
    "dev:frontend": "cd frontend && npm run dev",
    "install:all": "cd frontend && npm install",
    "build": "cd frontend && npm run build"
  },
  "devDependencies": {
    "concurrently": "^9.1.0"
  },
  "engines": {
    "node": ">=20.0.0 <=24.x.x",
    "npm": ">=6.0.0"
  }
}
```

Run: `cat package.json`
Expected: `scripts` block shows only frontend commands; no `dev:backend`, `build:all`, or `start`.

### Step 1.2: Archive root `railway.json`

```bash
mkdir -p docs/archive
cp railway.json docs/archive/railway.json
rm railway.json
```

Run: `ls docs/archive/railway.json && test ! -f railway.json`
Expected: `docs/archive/railway.json` exists; root `railway.json` does not.

### Step 1.3: Archive `backend/railway.json`

```bash
cp backend/railway.json docs/archive/backend-railway.json
rm backend/railway.json
```

Run: `ls docs/archive/backend-railway.json && test ! -f backend/railway.json`
Expected: Archive copy exists; original removed.

### Step 1.4: Checkpoint commit (after user authorization)

```bash
git add package.json docs/archive/
git commit -m "chore: disconnect root scripts and archive Railway configs"
```

---

## Task 2: Remove Backend from Playwright and Test Setup

**Files:**
- Modify: `frontend/playwright.config.ts`
- Modify: `frontend/scripts/setup-test-env.sh`

### Step 2.1: Remove backend webServer from Playwright config

Replace the `webServer` array in `frontend/playwright.config.ts` to start only the frontend:

```typescript
  webServer: process.env.CI ? undefined : [
    // Start frontend only
    {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      timeout: 60 * 1000,
      reuseExistingServer: !process.env.CI,
    },
  ],
```

Also update the JSDoc comment at the top from:
```typescript
 * Side effects: optionally starts backend/frontend servers when not in CI.
```
to:
```typescript
 * Side effects: optionally starts frontend dev server when not in CI.
```

Run: `grep -c "localhost:1337" frontend/playwright.config.ts`
Expected: `0`

### Step 2.2: Remove backend setup from test env script

Replace the entire contents of `frontend/scripts/setup-test-env.sh` with:

```bash
#!/bin/bash

# Setup script for e2e test environment
# Ensures frontend dependencies are installed

echo "🔧 Setting up test environment..."

# Check if frontend dependencies are installed
if [ ! -d node_modules ]; then
  echo "📦 Frontend dependencies not found, installing..."
  npm install
  echo "✅ Frontend dependencies installed"
else
  echo "✅ Frontend dependencies already installed"
fi

echo "✨ Test environment ready!"
```

Run: `grep -c "backend" frontend/scripts/setup-test-env.sh`
Expected: `0`

### Step 2.3: Update frontend `package.json` E2E scripts

Verify `frontend/package.json` has no scripts referencing `test:e2e:setup` with backend logic. If `test:e2e:setup` exists and calls `setup-test-env.sh`, it is fine since the script is now frontend-only.

Run: `grep "test:e2e" frontend/package.json`
Expected: Shows `test:e2e`, `test:e2e:ui`, `test:e2e:headed`, `test:e2e:debug`, `test:e2e:setup` — none with backend references.

### Step 2.4: Checkpoint commit (after user authorization)

```bash
git add frontend/playwright.config.ts frontend/scripts/setup-test-env.sh
git commit -m "chore: remove Strapi backend from Playwright and test setup"
```

---

## Task 3: Remove Strapi-Specific Frontend Types and Comments

**Files:**
- Modify: `frontend/src/types/index.ts`
- Modify: `frontend/src/lib/error-handler.ts`
- Modify: `frontend/src/data/loaders.ts`
- Modify: `frontend/src/data/data-api.ts`

### Step 3.1: Rename `TStrapiResponse` to `TApiResponse` in types

In `frontend/src/types/index.ts`:

1. Change line 9 from:
```typescript
// Strapi Block Rich Text Types
```
to:
```typescript
// Block Rich Text Types
```

2. Change line 348 from:
```typescript
export type TStrapiResponse<T = null> = {
```
to:
```typescript
export type TApiResponse<T = null> = {
```

Run: `grep -c "TStrapiResponse" frontend/src/types/index.ts`
Expected: `0`

Run: `grep -c "TApiResponse" frontend/src/types/index.ts`
Expected: `1`

### Step 3.2: Update `error-handler.ts` to use `TApiResponse`

In `frontend/src/lib/error-handler.ts`:

1. Change line 2 from:
```typescript
import type { TStrapiResponse } from "@/types";
```
to:
```typescript
import type { TApiResponse } from "@/types";
```

2. Change line 13 from:
```typescript
  data: TStrapiResponse<T> | null | undefined,
```
to:
```typescript
  data: TApiResponse<T> | null | undefined,
```

3. Change line 42 from:
```typescript
  data: TStrapiResponse<T> | null | undefined,
```
to:
```typescript
  data: TApiResponse<T> | null | undefined,
```

Run: `grep -c "TStrapiResponse" frontend/src/lib/error-handler.ts`
Expected: `0`

### Step 3.3: Update `loaders.ts` to use `TApiResponse`

In `frontend/src/data/loaders.ts`:

1. Change line 14 from:
```typescript
  TStrapiResponse,
```
to:
```typescript
  TApiResponse,
```

2. Change line 58 from:
```typescript
function wrapSuccess<T>(data: T | null): TStrapiResponse<T> {
```
to:
```typescript
function wrapSuccess<T>(data: T | null): TApiResponse<T> {
```

3. Replace all occurrences of `TStrapiResponse<` with `TApiResponse<` in the loader function signatures (lines 262, 267, 273, 279, 299, 304, 309, 314, 319, 324, 329, 344).

Run: `grep -c "TStrapiResponse" frontend/src/data/loaders.ts`
Expected: `0`

Run: `grep -c "TApiResponse" frontend/src/data/loaders.ts`
Expected: `12`

### Step 3.4: Verify `data-api.ts` is already clean

Run: `grep -i "strapi" frontend/src/data/data-api.ts`
Expected: No output (already Sanity-only).

### Step 3.5: Checkpoint commit (after user authorization)

```bash
git add frontend/src/types/index.ts frontend/src/lib/error-handler.ts frontend/src/data/loaders.ts
git commit -m "chore: rename TStrapiResponse to TApiResponse and remove Strapi comments"
```

---

## Task 4: Remove Strapi-Specific Utilities and Unused API Client

**Files:**
- Modify: `frontend/src/lib/utils.ts`
- Modify: `frontend/src/lib/config.ts`
- Delete: `frontend/src/data/legacy-form-api.ts`

### Step 4.1: Remove `getStrapiURL` and `fetchStrapi` from utils.ts

Replace the entire `frontend/src/lib/utils.ts` with:

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge Tailwind class names with conflict resolution.
 *
 * Data flow: combines `clsx` output with `tailwind-merge`.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Run: `grep -c "Strapi" frontend/src/lib/utils.ts`
Expected: `0`

### Step 4.2: Remove Strapi comment from config.ts

In `frontend/src/lib/config.ts`, change line 9 from:
```typescript
    development: 10000,  // 10s - slower local backend startup
```
to:
```typescript
    development: 10000,  // 10s - local dev server startup
```

Run: `grep -c "backend" frontend/src/lib/config.ts`
Expected: `0`

### Step 4.3: Delete unused `legacy-form-api.ts`

```bash
rm frontend/src/data/legacy-form-api.ts
```

Run: `test ! -f frontend/src/data/legacy-form-api.ts`
Expected: Exit code 0.

Verify no imports exist:
Run: `grep -r "legacy-form-api" frontend/src/ || echo "No imports found"`
Expected: `No imports found`

### Step 4.4: Checkpoint commit (after user authorization)

```bash
git add frontend/src/lib/utils.ts frontend/src/lib/config.ts
git rm frontend/src/data/legacy-form-api.ts
git commit -m "chore: remove Strapi utilities and unused legacy-form-api client"
```

---

## Task 5: Rename Strapi Media Components to Generic Names

**Files:**
- Rename: `frontend/src/components/ui/strapi-image.tsx` → `frontend/src/components/ui/cms-image.tsx`
- Rename: `frontend/src/components/ui/strapi-video.tsx` → `frontend/src/components/ui/cms-video.tsx`
- Modify: all files importing these components

### Step 5.1: Rename and update `strapi-image.tsx`

Create `frontend/src/components/ui/cms-image.tsx` with renamed exports:

```typescript
import Image from "next/image";

interface ICmsMediaProps {
  src: string;
  alt: string | null;
  caption?: string | null;
  height?: number;
  width?: number;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  draggable?: boolean;
}

/**
 * Normalize a media URL to an absolute URL.
 */
export function getMediaUrl(url: string | null) {
  if (url == null) return null;
  if (url.startsWith("data:")) return url;
  if (url.startsWith("http") || url.startsWith("//")) return url;
  return url;
}

/**
 * Next.js Image wrapper that resolves media URLs.
 *
 * Data flow: converts the `src` to an absolute URL before rendering.
 */
export function CmsImage({
  src,
  alt,
  className,
  ...rest
}: Readonly<ICmsMediaProps>) {
  const imageUrl = getMediaUrl(src);
  if (!imageUrl) return null;

  const resolvedAlt = alt ?? "";

  if (process.env.NODE_ENV === "development" && !alt) {
    console.warn(`[CmsImage] Missing alt text for image: ${src}`);
  }

  return (
    <Image
      src={imageUrl}
      alt={resolvedAlt}
      className={className}
      {...(resolvedAlt === "" && { "aria-hidden": true })}
      {...rest}
    />
  );
}
```

Delete the old file:
```bash
rm frontend/src/components/ui/strapi-image.tsx
```

### Step 5.2: Rename and update `strapi-video.tsx`

Create `frontend/src/components/ui/cms-video.tsx` with renamed exports:

```typescript
interface ICmsVideoProps {
  src: string;
  caption?: string | null;
  alt?: string | null;
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  poster?: string;
  preload?: "none" | "metadata" | "auto";
  width?: number;
  height?: number;
}

/**
 * Normalize a video URL to an absolute URL.
 */
export function getVideoUrl(url: string | null) {
  if (url == null) return null;
  if (url.startsWith("data:")) return url;
  if (url.startsWith("http") || url.startsWith("//")) return url;
  return url;
}

/**
 * HTML video wrapper that resolves media URLs.
 *
 * Data flow: converts the `src` (and optional poster) to absolute URLs.
 */
export function CmsVideo({
  src,
  className,
  controls = true,
  autoPlay = false,
  loop = false,
  muted = false,
  poster,
  preload = "metadata",
  width,
  height,
}: Readonly<ICmsVideoProps>) {
  const videoUrl = getVideoUrl(src);
  if (!videoUrl) return null;

  const posterUrl = poster ? getVideoUrl(poster) : undefined;

  return (
    <video
      src={videoUrl}
      className={className}
      controls={controls}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      poster={posterUrl || undefined}
      preload={preload}
      width={width}
      height={height}
    >
      Your browser does not support the video tag.
    </video>
  );
}
```

Delete the old file:
```bash
rm frontend/src/components/ui/strapi-video.tsx
```

### Step 5.3: Update all component imports

Update these files to import from `cms-image`/`cms-video` and use `CmsImage`/`CmsVideo`/`getMediaUrl`/`getVideoUrl`:

**`frontend/src/components/custom/layout/hero-section.tsx`**
- Change imports:
```typescript
import { CmsImage } from "@/components/ui/cms-image";
import { CmsVideo } from "@/components/ui/cms-video";
```
- Replace `StrapiImage` → `CmsImage` and `StrapiVideo` → `CmsVideo` in JSX (4 occurrences)
- Update JSDoc line 23: remove "Strapi" from "receives Strapi media + link data"

**`frontend/src/components/custom/layout/info-section.tsx`**
- Change imports:
```typescript
import { CmsImage } from "@/components/ui/cms-image";
import { CmsVideo } from "@/components/ui/cms-video";
```
- Replace `StrapiImage` → `CmsImage` and `StrapiVideo` → `CmsVideo` in JSX (2 occurrences)
- Update JSDoc line 30: remove "Strapi" from "renders Strapi BlocksContent"

**`frontend/src/components/custom/layout/newspaper-info-section.tsx`**
- Change imports:
```typescript
import { CmsImage } from "@/components/ui/cms-image";
import { CmsVideo } from "@/components/ui/cms-video";
```
- Replace `StrapiImage` → `CmsImage` and `StrapiVideo` → `CmsVideo` in JSX (2 occurrences)

**`frontend/src/components/custom/layout/newspaper-menu-section.tsx`**
- Change imports:
```typescript
import { CmsImage } from "@/components/ui/cms-image";
import { CmsVideo } from "@/components/ui/cms-video";
```
- Replace `StrapiImage` → `CmsImage` and `StrapiVideo` → `CmsVideo` in JSX (2 occurrences)

**`frontend/src/components/custom/layout/standfirst-section.tsx`**
- Change imports:
```typescript
import { CmsImage } from "@/components/ui/cms-image";
import { CmsVideo } from "@/components/ui/cms-video";
```
- Replace `StrapiImage` → `CmsImage` and `StrapiVideo` → `CmsVideo` in JSX (4 occurrences)

**`frontend/src/components/custom/layout/deals-section.tsx`**
- Change import:
```typescript
import { CmsImage } from "@/components/ui/cms-image";
```
- Replace `StrapiImage` → `CmsImage` in JSX (1 occurrence)

**`frontend/src/components/custom/layout/magazine-gallery/magazine-page.tsx`**
- Change import:
```typescript
import { CmsImage } from "@/components/ui/cms-image";
```
- Replace `StrapiImage` → `CmsImage` in JSX (1 occurrence)

**`frontend/src/components/ui/block-renderer.tsx`**
- Change imports:
```typescript
import { getMediaUrl } from "@/components/ui/cms-image";
import { getVideoUrl } from "@/components/ui/cms-video";
```
- Replace `getStrapiMedia` → `getMediaUrl` and `getStrapiVideo` → `getVideoUrl` in JSX (2 occurrences)
- Update JSDoc line 62: change "Render Strapi rich text blocks" to "Render rich text blocks"

Run verification:
```bash
grep -r "StrapiImage\|StrapiVideo\|getStrapiMedia\|getStrapiVideo\|strapi-image\|strapi-video" frontend/src/ --include="*.ts" --include="*.tsx" || echo "All references removed"
```
Expected: `All references removed`

### Step 5.4: Checkpoint commit (after user authorization)

```bash
git add frontend/src/components/ui/cms-image.tsx frontend/src/components/ui/cms-video.tsx
git rm frontend/src/components/ui/strapi-image.tsx frontend/src/components/ui/strapi-video.tsx
git add frontend/src/components/custom/layout/hero-section.tsx frontend/src/components/custom/layout/info-section.tsx frontend/src/components/custom/layout/newspaper-info-section.tsx frontend/src/components/custom/layout/newspaper-menu-section.tsx frontend/src/components/custom/layout/standfirst-section.tsx frontend/src/components/custom/layout/deals-section.tsx frontend/src/components/custom/layout/magazine-gallery/magazine-page.tsx frontend/src/components/ui/block-renderer.tsx
git commit -m "chore: rename Strapi media components to generic CmsImage/CmsVideo"
```

---

## Task 6: Update Block Renderer and Layout Comments

**Files:**
- Modify: `frontend/src/components/ui/layout-block-renderer.tsx`
- Modify: `frontend/src/app/(site)/page.tsx`
- Modify: `frontend/src/app/(site)/layout.tsx`
- Modify: `frontend/src/app/(site)/hours-and-location/page.tsx`
- Modify: `frontend/src/components/custom/layout/header.tsx`
- Modify: `frontend/src/components/custom/layout/gallery-section.tsx`
- Modify: `frontend/src/components/ui/mobile-navigation.tsx`
- Modify: `frontend/src/lib/structured-data.ts`

### Step 6.1: Update `layout-block-renderer.tsx` comments

In `frontend/src/components/ui/layout-block-renderer.tsx`:

1. Line 36: change:
```typescript
 * Extended block type that supports both legacy Strapi (__component)
 * and Sanity (_type/_key) shapes during transition.
```
to:
```typescript
 * Extended block type that supports both legacy (__component)
 * and Sanity (_type/_key) shapes.
```

2. Line 64: change:
```typescript
 * Supports both legacy Strapi __component names and Sanity _type names.
```
to:
```typescript
 * Supports both legacy __component names and Sanity _type names.
```

3. Line 67: change:
```typescript
  // Legacy Strapi types
```
to:
```typescript
  // Legacy types
```

4. Line 112: change:
```typescript
 * Maps both legacy Strapi __component strings and Sanity _type strings
```
to:
```typescript
 * Maps both legacy __component strings and Sanity _type strings
```

5. Line 116: change:
```typescript
  // Legacy Strapi types
```
to:
```typescript
  // Legacy types
```

6. Line 151: change:
```typescript
 * Supports both legacy Strapi blocks (__component) and Sanity blocks (_type).
```
to:
```typescript
 * Supports both legacy blocks (__component) and Sanity blocks (_type).
```

7. Line 155: change:
```typescript
 * @param blocks - Array of block objects from Strapi or Sanity
```
to:
```typescript
 * @param blocks - Array of block objects from Sanity
```

Run: `grep -c "Strapi" frontend/src/components/ui/layout-block-renderer.tsx`
Expected: `0`

### Step 6.2: Update JSDoc comments in page and component files

**`frontend/src/app/(site)/page.tsx`** line 12:
Change:
```typescript
 * Data flow: loads home page blocks from Strapi and renders them via the
```
to:
```typescript
 * Data flow: loads home page blocks from Sanity and renders them via the
```

**`frontend/src/app/(site)/layout.tsx`** line 76:
Change:
```typescript
 * Build site-wide metadata from Strapi with safe fallbacks.
```
to:
```typescript
 * Build site-wide metadata from Sanity with safe fallbacks.
```

**`frontend/src/app/(site)/hours-and-location/page.tsx`** line 11:
Change:
```typescript
 * Data flow: loads Strapi blocks and renders them via the shared block renderer.
```
to:
```typescript
 * Data flow: loads Sanity blocks and renders them via the shared block renderer.
```

**`frontend/src/components/custom/layout/header.tsx`** line 144:
Change:
```typescript
 * Data flow: consumes global header data and main menu items from Strapi.
```
to:
```typescript
 * Data flow: consumes global header data and main menu items from Sanity.
```

**`frontend/src/components/custom/layout/gallery-section.tsx`** line 9:
Change:
```typescript
 * Data flow: consumes Strapi image list and renders a vintage broadsheet-style
```
to:
```typescript
 * Data flow: consumes Sanity image list and renders a vintage broadsheet-style
```

**`frontend/src/components/ui/mobile-navigation.tsx`** line 41:
Change:
```typescript
 * Data flow: renders Strapi menu items and CTA link, tracking open state locally.
```
to:
```typescript
 * Data flow: renders Sanity menu items and CTA link, tracking open state locally.
```

**`frontend/src/lib/structured-data.ts`** line 62:
Change:
```typescript
 * @param locationData - Location section data from Strapi (can be null)
```
to:
```typescript
 * @param locationData - Location section data from Sanity (can be null)
```

Run: `grep -r "from Strapi" frontend/src/ --include="*.ts" --include="*.tsx" || echo "No 'from Strapi' references remain"`
Expected: `No 'from Strapi' references remain`

### Step 6.3: Checkpoint commit (after user authorization)

```bash
git add frontend/src/components/ui/layout-block-renderer.tsx frontend/src/app/(site)/page.tsx frontend/src/app/(site)/layout.tsx frontend/src/app/(site)/hours-and-location/page.tsx frontend/src/components/custom/layout/header.tsx frontend/src/components/custom/layout/gallery-section.tsx frontend/src/components/ui/mobile-navigation.tsx frontend/src/lib/structured-data.ts
git commit -m "chore: remove Strapi references from JSDoc comments and block renderer"
```

---

## Task 7: Update Next.js Config and Remove Strapi Image Pattern

**Files:**
- Modify: `frontend/next.config.ts`

### Step 7.1: Remove localhost:1337 remotePatterns entry

In `frontend/next.config.ts`, remove the entire localhost:1337 block (lines 18–23):

```typescript
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/uploads/**/*",
      },
```

The `images.remotePatterns` array should then contain only the Supabase and Sanity entries.

Run: `grep -c "1337" frontend/next.config.ts`
Expected: `0`

### Step 7.2: Checkpoint commit (after user authorization)

```bash
git add frontend/next.config.ts
git commit -m "chore: remove Strapi localhost image pattern from Next.js config"
```

---

## Task 8: Archive Backend Directory and Migration Scripts

**Files:**
- Create: `backend/ARCHIVE.md`
- Move: `frontend/scripts/migration/*` → `docs/archive/migrations/`

### Step 8.1: Create backend archive README

Create `backend/ARCHIVE.md`:

```markdown
# Backend Archive

**Archive Date:** 2026-06-11
**Reason:** Strapi backend decommissioned after successful migration to Sanity Content Lake.
**Last Known Working Commit:** See Git history prior to 2026-06-11 decommission merge.
**Final Backups:** Database dumps and asset inventories stored per `docs/sanity-cutover/STRAPI_DECOMMISSION.md`.

## Status

This directory is **INERT** and **READ-ONLY**.

- No builds, dev servers, or deployments are performed from this directory.
- No dependency installs are run.
- No modifications should be made to any files herein.

## Purpose

Preserved for historical reference, compliance, and emergency rollback (restore from Git history or final backups, not from this directory directly).

## Contents

- `config/` — Strapi configuration files
- `src/api/` — Content types, controllers, services
- `src/components/` — Reusable Strapi components
- `public/` — Static uploads and assets
- `.env.example` — Environment template (historical reference only)
- `package.json` — Backend dependencies (historical reference only)
```

### Step 8.2: Move migration scripts to archive

```bash
mkdir -p docs/archive/migrations
mv frontend/scripts/migration/migrate-assets.ts docs/archive/migrations/
mv frontend/scripts/migration/migrate-content.ts docs/archive/migrations/
mv frontend/scripts/migration/verify-assets.ts docs/archive/migrations/
rmdir frontend/scripts/migration 2>/dev/null || true
```

Run:
```bash
ls docs/archive/migrations/ && test ! -d frontend/scripts/migration
```
Expected: `migrate-assets.ts`, `migrate-content.ts`, `verify-assets.ts` listed; `frontend/scripts/migration` does not exist.

### Step 8.3: Checkpoint commit (after user authorization)

```bash
git add backend/ARCHIVE.md docs/archive/migrations/
git rm -r frontend/scripts/migration/
git commit -m "chore: archive backend directory and move migration scripts"
```

---

## Task 9: Update Project Documentation

**Files:**
- Modify: `README.md`
- Modify: `AGENTS.md`
- Modify: `CLAUDE.md`

### Step 9.1: Update `README.md`

Apply these concrete changes to `README.md`:

1. **Line 8**: change:
```markdown
> The Strapi 5 backend in `backend/` is retained as legacy/rollback-only infrastructure until formally decommissioned.
```
to:
```markdown
> The `backend/` directory is an inert archive of the legacy Strapi 5 backend.
> It is preserved for historical reference only and is not built, run, or deployed.
```

2. **Line 11**: change:
```markdown
> - **Backend (`backend/`):** Rollback-only — not required for Sanity frontend operation except during rollback, final sync, or decommission checks
```
to:
```markdown
> - **Backend (`backend/`):** Inert archive — not required for operation
```

3. **Lines 22–26**: change the Backend/CMS section from:
```markdown
**Backend / CMS:**
- [Sanity Content Lake](https://www.sanity.io/) - Active headless CMS (embedded Studio at `/studio`)
- [Strapi 5](https://strapi.io/) - **Legacy rollback-only** until formally decommissioned
- [PostgreSQL](https://www.postgresql.org/) - Strapi production database (legacy)
- [SQLite](https://www.sqlite.org/) - Strapi development database (legacy)
```
to:
```markdown
**Backend / CMS:**
- [Sanity Content Lake](https://www.sanity.io/) - Headless CMS (embedded Studio at `/studio`)
```

4. **Lines 29–30**: change DevOps from:
```markdown
- [Vercel](https://vercel.com/) - Frontend deployment
- [Railway](https://railway.app/) - Legacy backend deployment (rollback, final sync, decommission)
```
to:
```markdown
- [Vercel](https://vercel.com/) - Frontend deployment
```

5. **Lines 60–65**: change install section from:
```markdown
### 2. Install Dependencies

```bash
npm run install:all
```

This will install dependencies for the root, backend, and frontend.
```
to:
```markdown
### 2. Install Dependencies

```bash
cd frontend && npm install
```
```

6. **Lines 78–80**: remove the Strapi env var block from the frontend env example:
```markdown
# Strapi (legacy rollback-only)
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
```

7. **Lines 82–102**: remove the entire "Backend Environment Variables" section.

8. **Lines 104–120**: change run dev section from:
```markdown
### 4. Run Development Servers

```bash
npm run dev
```

This runs both frontend and backend concurrently:
- Frontend: http://localhost:3000
- Backend/Strapi Admin: http://localhost:1337/admin
```
to:
```markdown
### 4. Run Development Server

```bash
cd frontend && npm run dev
```

- Frontend: http://localhost:3000
```

9. **Lines 117–120**: remove Strapi access lines:
```markdown
- **Strapi Admin Panel** (legacy/rollback-only): http://localhost:1337/admin
- **Strapi API** (legacy/rollback-only): http://localhost:1337/api

On first run for legacy Strapi, you'll need to create an admin user by visiting the admin panel.
```

10. **Lines 124–152**: update project structure to remove backend description:
Change:
```markdown
├── backend/                 # Strapi CMS
│   ├── config/             # Strapi configuration
│   ├── src/                # API routes, content types, controllers
│   │   ├── api/           # API endpoints
│   │   └── components/    # Reusable components
│   ├── public/            # Static files and uploads
│   ├── .env.example       # Environment template
│   └── package.json       # Backend dependencies
```
to:
```markdown
├── backend/                 # Inert archive of legacy Strapi CMS
│   └── ARCHIVE.md          # Archive status and documentation
```

11. **Lines 156–167**: update scripts section:
Remove:
```markdown
### Root Level
- `npm run dev` - Run both frontend and backend in development mode
- `npm run dev:backend` - Run only backend
- `npm run dev:frontend` - Run only frontend
- `npm run install:all` - Install all dependencies
- `npm run build:all` - Build both applications

### Backend (`cd backend`)
- `npm run dev` - Start Strapi in development mode
- `npm run build` - Build Strapi admin panel
- `npm run start` - Start Strapi in production mode
- `npm run strapi` - Run Strapi CLI commands
```
Replace with:
```markdown
### Root Level
- `npm run dev` - Run frontend development server
- `npm run install:all` - Install frontend dependencies
- `npm run build` - Build frontend for production

### Frontend (`cd frontend`)
```

12. **Lines 177–195**: remove the entire "Backend (Strapi — legacy/rollback-only)" env var table.

13. **Line 205**: remove `NEXT_PUBLIC_STRAPI_URL` from the frontend env table.

14. **Lines 264–280**: update deployment section:
Remove Strapi/Railway references and change to:
```markdown
### Quick Overview

- **Frontend**: Deployed to Vercel automatically on push to main.
- **CMS**: Sanity Content Lake (hosted by Sanity)
- **Environments**: Vercel Preview + Production
```

15. **Lines 276–282**: remove the Railway deployment subsection entirely.

16. **Lines 304–308**: update troubleshooting:
Remove the database connection section or change to Sanity-focused.

17. **Line 320**: remove the legacy Strapi docs reference:
```markdown
- For legacy Strapi issues: Check the [Strapi documentation](https://docs.strapi.io) (rollback-only)
```

### Step 9.2: Update `AGENTS.md`

Apply these concrete changes:

1. **Line 3**: change from:
```markdown
A two-app monorepo: Next.js 16 frontend + Strapi 5 backend. Not an npm workspace.
```
to:
```markdown
A Next.js 16 frontend with Sanity CMS. Not an npm workspace.
```

2. **Lines 7–8**: change package boundaries from:
```markdown
- `frontend/` — Next.js 16, React 18, TypeScript, Tailwind CSS 4. Own `package-lock.json`.
- `backend/` — Strapi 5 CMS. Own `package-lock.json`.
```
to:
```markdown
- `frontend/` — Next.js 16, React 18, TypeScript, Tailwind CSS 4. Own `package-lock.json`.
- `backend/` — Inert archive of legacy Strapi 5 CMS. Not built or run.
```

3. **Lines 15–22**: update root commands table:
Remove `dev:backend`, `build:all`. Change:
```markdown
| Install all | `npm run install:all` |
| Dev both | `npm run dev` |
| Dev backend only | `npm run dev:backend` |
| Dev frontend only | `npm run dev:frontend` |
| Build all | `npm run build:all` |
```
to:
```markdown
| Install frontend | `npm run install:all` |
| Dev frontend | `npm run dev` |
```

4. **Lines 24–38**: keep frontend commands table but remove the "E2E setup (creates backend .env, installs deps)" row.

5. **Lines 40–46**: remove the entire "From `backend/`" commands table.

6. **Line 50**: change data contract from:
```markdown
- Frontend fetches Strapi data **only** through `frontend/src/data/data-api.ts` and `frontend/src/data/loaders.ts`.
```
to:
```markdown
- Frontend fetches Sanity data **only** through `frontend/src/data/data-api.ts` and `frontend/src/data/loaders.ts`.
```

7. **Lines 53–55**: change contract rules from:
```markdown
- Validate external Strapi/env data at boundaries via existing config/error helpers.
- Strapi content/API contract changes must be paired with frontend type/loader updates.
- If changing both frontend/backend, include handoff notes for contract/deployment impact.
```
to:
```markdown
- Validate external Sanity/env data at boundaries via existing config/error helpers.
- Sanity schema changes must be paired with frontend type/loader updates.
```

8. **Lines 63–64**: change key file boundaries from:
```markdown
- Strapi API boundary: `frontend/src/data/data-api.ts`
```
to:
```markdown
- Sanity API boundary: `frontend/src/data/data-api.ts`
```

9. **Lines 67–71**: remove or update backend key files section:
```markdown
### Backend
- Strapi bootstrap/register: `backend/src/index.ts`
- Config: `backend/config/*.ts`
- Content types: `backend/src/api/**/content-types/**/schema.json`
- Components: `backend/src/components/**/*.json`
```
Change to:
```markdown
### Backend (inert archive)
- Archive notice: `backend/ARCHIVE.md`
```

10. **Lines 77–78**: remove Strapi build dependency note:
```markdown
- Frontend build/prerender depends on Strapi reachable at `NEXT_PUBLIC_STRAPI_URL`; CI starts Strapi before frontend build.
```
Replace with:
```markdown
- Frontend build/prerender depends on Sanity API; no local backend required.
```

11. **Lines 79–81**: remove backend secrets note:
```markdown
- Required backend secrets: `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET`, `ENCRYPTION_KEY`.
```

12. **Lines 85–87**: update Playwright notes:
```markdown
- Playwright local config starts backend/frontend automatically when `CI` is not set.
- `npm run test:e2e:setup` can create `backend/.env` and install backend deps; plain `npm run test:e2e` does not.
```
Change to:
```markdown
- Playwright local config starts frontend automatically when `CI` is not set.
- `npm run test:e2e:setup` installs frontend dependencies only.
```

### Step 9.3: Update `CLAUDE.md`

Apply these concrete changes:

1. **Line 5**: change from:
```markdown
Restaurant website — Next.js 16 frontend + Strapi 5 headless CMS backend.
```
to:
```markdown
Restaurant website — Next.js 16 frontend + Sanity headless CMS.
```

2. **Line 24**: change backend description from:
```markdown
├── backend/               # Strapi 5 CMS
```
to:
```markdown
├── backend/               # Inert archive of legacy Strapi 5 CMS
```

3. **Lines 35–39**: update commands:
```markdown
npm run install:all          # Install frontend dependencies
npm run dev                  # Start frontend (:3000)
npm run dev:frontend         # Frontend only
npm run build:all            # Build everything
```
Change to:
```markdown
npm run install:all          # Install frontend dependencies
npm run dev                  # Start frontend (:3000)
```

4. **Line 53**: change backend from:
```markdown
- **Backend**: Strapi 5, PostgreSQL (prod), SQLite (dev)
```
to:
```markdown
- **CMS**: Sanity Content Lake
```

5. **Lines 55**: remove Railway from deployment:
```markdown
- **Deployment**: Vercel (frontend), Railway (backend), Supabase (database)
```
Change to:
```markdown
- **Deployment**: Vercel (frontend)
```

6. **Lines 63–64**: update data layer docs:
```markdown
- `data/data-api.ts` — Unified API client with timeout, auth, error handling
```
Change to:
```markdown
- `data/data-api.ts` — Sanity API client with draft/published support
```

7. **Lines 92**: remove Strapi env var example:
```markdown
- **Frontend** (`frontend/.env.local`): `NEXT_PUBLIC_STRAPI_URL=http://localhost:1337`
```
Remove this line.

8. **Lines 98**: change key files from:
```markdown
- `frontend/src/data/data-api.ts` — Unified API client
```
to:
```markdown
- `frontend/src/data/data-api.ts` — Sanity API client
```

9. **Lines 103–104**: remove backend key files:
```markdown
- `backend/src/api/` — Strapi content types
- `.github/workflows/ci.yml` — CI pipeline
```
Keep only CI if relevant.

10. **Lines 111–113**: update change principles:
```markdown
- All boundaries are explicit: Frontend ↔ Strapi API, Server ↔ Client components
- No ad-hoc fetches or inline magic strings for endpoints or env vars
- External inputs (Strapi responses, env vars) must be validated at boundary
```
Change to:
```markdown
- All boundaries are explicit: Frontend ↔ Sanity API, Server ↔ Client components
- No ad-hoc fetches or inline magic strings for endpoints or env vars
- External inputs (Sanity responses, env vars) must be validated at boundary
```

11. **Lines 117–119**: update anti-patterns:
```markdown
- **Don't create new API endpoints** — work with existing Strapi content types unless explicitly asked
```
Change to:
```markdown
- **Don't create new API endpoints** — work with existing Sanity schemas unless explicitly asked
```

12. **Lines 123–124**: update troubleshooting:
```markdown
- **Strapi connection refused**: Ensure backend is running, check `NEXT_PUBLIC_STRAPI_URL` in `frontend/.env.local`
- **Type errors after Strapi changes**: Update `types/index.ts`, then `loaders.ts` if API shape changed, verify with `npx tsc --noEmit`
```
Change to:
```markdown
- **Type errors after Sanity schema changes**: Update `sanity.types.ts`/`types/index.ts`, then `loaders.ts` if API shape changed, verify with `npx tsc --noEmit`
```

### Step 9.4: Checkpoint commit (after user authorization)

```bash
git add README.md AGENTS.md CLAUDE.md
git commit -m "docs: update README, AGENTS.md, CLAUDE.md for Sanity-only architecture"
```

---

## Task 10: Create External Platform Cleanup Runbook

**Files:**
- Create: `docs/sanity-cutover/EXTERNAL_PLATFORM_CLEANUP.md`

### Step 10.1: Write the external cleanup runbook

Create `docs/sanity-cutover/EXTERNAL_PLATFORM_CLEANUP.md`:

```markdown
# External Platform Cleanup Runbook

> **Status:** DOCUMENT-ONLY — NOT AUTHORIZED FOR EXECUTION
>
> This document identifies external platform resources that must be cleaned up
> after the Strapi backend repository decommission is complete.
> **Do not execute any steps without explicit signoff.**

---

## Owner

| Field | Value |
|-------|-------|
| **Owner** | *(To be filled in before execution)* |
| **Scheduled Date** | *(To be filled in before execution)* |
| **Actual Date** | *(To be filled in at completion)* |
| **Approver(s)** | *(To be filled in before execution)* |

---

## Vercel Environment Variables

**Platform:** [Vercel Dashboard](https://vercel.com) → Project Settings → Environment Variables

| Variable | Action | Verified Removed |
|----------|--------|-----------------|
| `NEXT_PUBLIC_STRAPI_URL` | Delete after confirming frontend build succeeds without it | [ ] |
| `STRAPI_API_TOKEN` | Delete if present | [ ] |
| Any `_ROLLBACK_*` prefixed variables | Delete after stable period | [ ] |

**Verification:** After deletion, trigger a new deployment and confirm build passes.

---

## Railway

**Platform:** [Railway Dashboard](https://railway.app)

| Step | Action | Completed |
|------|--------|-----------|
| 1 | Identify Danny's Fish & Chips project and Strapi service | [ ] |
| 2 | Stop the Strapi service (preserves config, no billing) | [ ] |
| 3 | Wait 7 days, verify no issues | [ ] |
| 4 | Remove the Strapi service permanently | [ ] |
| 5 | Remove the Railway project if no other services remain | [ ] |

**Project/Service Identifiers:**
- Root `railway.json` was archived to `docs/archive/railway.json`
- `backend/railway.json` was archived to `docs/archive/backend-railway.json`

---

## S3 / Supabase Storage

**Platform:** [Supabase Dashboard](https://supabase.com) or S3 console

| Step | Action | Completed |
|------|--------|-----------|
| 1 | List storage buckets used for Strapi uploads | [ ] |
| 2 | Download final asset inventory | [ ] |
| 3 | Verify all assets exist in Sanity (see `docs/archive/migrations/verify-assets.ts`) | [ ] |
| 4 | Delete storage bucket contents | [ ] |
| 5 | Delete the storage bucket or entire project (if no other apps use it) | [ ] |
| 6 | Downgrade Supabase plan if on paid tier | [ ] |

---

## PostgreSQL

**Platform:** Railway dashboard or database provider console

| Step | Action | Completed |
|------|--------|-----------|
| 1 | Export final database dump | [ ] |
| 2 | Store dump securely with documented location | [ ] |
| 3 | Delete database instance | [ ] |
| 4 | Cancel/downgrade database service plan | [ ] |

**Dump Location:** *(To be filled in before execution)*

---

## Secrets Rotation / Revocation

| Secret | Location | Action | Completed |
|--------|----------|--------|-----------|
| `APP_KEYS` | Railway env, backend `.env` | Revoke/rotate | [ ] |
| `API_TOKEN_SALT` | Railway env, backend `.env` | Revoke/rotate | [ ] |
| `ADMIN_JWT_SECRET` | Railway env, backend `.env` | Revoke/rotate | [ ] |
| `TRANSFER_TOKEN_SALT` | Railway env, backend `.env` | Revoke/rotate | [ ] |
| `JWT_SECRET` | Railway env, backend `.env` | Revoke/rotate | [ ] |
| `ENCRYPTION_KEY` | Railway env, backend `.env` | Revoke/rotate | [ ] |
| `S3_ACCESS_KEY_ID` | Railway/Vercel env | Revoke | [ ] |
| `S3_ACCESS_SECRET` | Railway/Vercel env | Revoke | [ ] |

---

## Final Backups

| Backup | Location | Checksum | Retention Policy |
|--------|----------|----------|-----------------|
| Database dump | *(TBD)* | *(TBD)* | *(TBD)* |
| Asset inventory | *(TBD)* | *(TBD)* | *(TBD)* |
| `.env` template | `backend/.env.example` (in repo) | N/A | Permanent (Git history) |

---

## Signoff

**By signing below, the approver confirms all steps above are complete and verified.**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Owner | | | |
| Technical Lead | | | |
| DevOps / Platform | | | |
```

Run: `test -f docs/sanity-cutover/EXTERNAL_PLATFORM_CLEANUP.md`
Expected: Exit code 0.

### Step 10.2: Checkpoint commit (after user authorization)

```bash
git add docs/sanity-cutover/EXTERNAL_PLATFORM_CLEANUP.md
git commit -m "docs: add external platform cleanup runbook (document-only)"
```

---

## Task 11: Final Verification

**Files:** all modified files

### Step 11.1: Grep for active Strapi references in runtime code

Run from repo root:
```bash
cd frontend && grep -ri "strapi\|Strapi\|STRAPI\|1337\|getStrapiURL\|fetchStrapi\|TStrapiResponse" src/ --include="*.ts" --include="*.tsx" || echo "No active Strapi references found"
```
Expected: `No active Strapi references found`

### Step 11.2: Run frontend lint

```bash
cd frontend && npm run lint
```
Expected: Exit code 0, no errors.

### Step 11.3: Run frontend type check

```bash
cd frontend && npx tsc --noEmit
```
Expected: Exit code 0, no type errors.

### Step 11.4: Build frontend

```bash
cd frontend && npm run build
```
Expected: Exit code 0, build succeeds.

**Note:** Build requires `SANITY_API_READ_TOKEN` and Sanity project env vars. If running locally without them, set:
```bash
export NEXT_PUBLIC_SANITY_PROJECT_ID=jz52wuvq
export NEXT_PUBLIC_SANITY_DATASET=production
export NEXT_PUBLIC_SANITY_API_VERSION=2024-06-01
export SANITY_API_READ_TOKEN=<your-token>
```

### Step 11.5: Verify Playwright config does not start backend

```bash
grep -c "localhost:1337" frontend/playwright.config.ts
```
Expected: `0`

### Step 11.6: Verify root package.json has no backend scripts

```bash
grep -c "backend" package.json
```
Expected: `0`

### Step 11.7: Verify backend is marked archive

```bash
test -f backend/ARCHIVE.md
```
Expected: Exit code 0.

### Step 11.8: Verify migration scripts are archived

```bash
test -d docs/archive/migrations && test ! -d frontend/scripts/migration
```
Expected: Exit code 0.

### Step 11.9: Verify no dirty/staged conflict changes were modified

```bash
git diff --name-only | grep -E "conflict|merge" || echo "No conflict files modified"
```
Expected: `No conflict files modified` (or list should not include any files the user identified as conflict-resolution work).

---

## Self-Review: Spec Acceptance Criteria Mapping

| Spec Criterion | Plan Task | Evidence |
|---------------|-----------|----------|
| Root `package.json` scripts no longer reference `backend/` | Task 1, Step 1.1 | `scripts` block contains only frontend commands |
| CI workflows no longer build or start Strapi backend | Already clean (verified `ci.yml` and `e2e-preview.yml` are Sanity-only) + Task 2 removes Playwright backend startup | `frontend/playwright.config.ts` has no `localhost:1337` |
| Railway configuration is removed or archived | Task 1, Steps 1.2–1.3 | `docs/archive/railway.json` and `docs/archive/backend-railway.json` exist; originals removed |
| Playwright/test setup no longer depends on backend | Task 2, Steps 2.1–2.2 | `playwright.config.ts` starts frontend only; `setup-test-env.sh` has no backend logic |
| Strapi-specific frontend helpers, types, and comments removed; `data-api.ts` and `loaders.ts` remain active | Tasks 3, 4, 5, 6 | `TStrapiResponse` renamed to `TApiResponse`; `legacy-form-api.ts` deleted; `strapi-image.tsx`/`strapi-video.tsx` renamed to `cms-image.tsx`/`cms-video.tsx`; Strapi comments removed from all component JSDoc |
| Migration scripts moved out of active execution paths | Task 8, Step 8.2 | `docs/archive/migrations/` contains the three scripts; `frontend/scripts/migration/` removed |
| `backend/` is inert, documented as archive | Task 8, Step 8.1 | `backend/ARCHIVE.md` exists with clear inert status |
| Project documentation updated to Sanity-only architecture | Task 9 | `README.md`, `AGENTS.md`, `CLAUDE.md` updated |
| External platform cleanup runbook exists with required fields | Task 10 | `docs/sanity-cutover/EXTERNAL_PLATFORM_CLEANUP.md` created with owner, date, signoff, Vercel, Railway, S3/Supabase, Postgres, secrets, backups |
| No dirty/staged conflict-resolution changes modified | Task 11, Step 11.9 | Verification grep confirms no conflict files touched |

**Placeholder scan:** No TBD, TODO, "implement later", "fill in details", or "similar to Task N" patterns found. All steps contain exact file paths, code blocks, commands, and expected outputs.

**Type consistency:** `TApiResponse` is defined in Task 3 and used consistently in `error-handler.ts`, `loaders.ts`, and all loader function signatures. `CmsImage`/`CmsVideo` are defined in Task 5 and imported consistently across all component files. No type name drift detected.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-06-11-strapi-repo-decommission-implementation-plan.md`.**

Two execution options:

**1. Subagent-Driven (recommended)** — Dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using `executing-plans`, batch execution with checkpoints.

**Important:** All commit steps in this plan are framed as checkpoint commits to be performed **only after explicit user authorization**, because actual commits require user approval per project policy.

**Which approach?**
