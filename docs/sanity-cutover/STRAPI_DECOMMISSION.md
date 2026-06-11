# Strapi Decommission Guide (Historical)

> **Status:** COMPLETED — This document is historical reference only.
> **Date:** Strapi repository decommission complete.
> **Active CMS:** Sanity Content Lake
> **Backend status:** `backend/` is an inert archive; see `backend/ARCHIVE.md`.

---

## What This Document Was

This guide originally outlined the phased decommissioning of the Strapi backend and its associated infrastructure (Railway, S3/Supabase storage, PostgreSQL) after the Sanity cutover was verified stable.

## Outcome

- The frontend contains no runtime Strapi dependencies.
- `backend/` is preserved in the repo as a read-only archive.
- The Sanity dataset is the sole source of CMS content.

## Repo-Only Decommission Status

The repository-level decommission is complete:

- `backend/` is marked as inert (`backend/ARCHIVE.md`).
- Root `package.json` no longer references backend build/deploy scripts.
- Frontend code loads data exclusively through `frontend/src/data/data-api.ts` and `frontend/src/data/loaders.ts`.

## Archived Migration Scripts

The original migration and verification scripts are preserved as a historical record:

- `docs/archive/migrations/migrate-assets.ts`
- `docs/archive/migrations/migrate-content.ts`
- `docs/archive/migrations/verify-assets.ts`

## External Platform Cleanup

External cleanup tasks (Railway service removal, S3 bucket deletion, Supabase project downgrade, etc.) are **not** authorized or executed from this repository. They are tracked separately in:

- `docs/sanity-cutover/EXTERNAL_PLATFORM_CLEANUP.md`

That document is **document-only** until signed off. External infrastructure, environment, and platform cleanup remains outstanding until `EXTERNAL_PLATFORM_CLEANUP.md` is explicitly signed off.

This document does **not** instruct external platform operations.

---

*DOCUMENT-ONLY — No active operations. For historical context only.*
