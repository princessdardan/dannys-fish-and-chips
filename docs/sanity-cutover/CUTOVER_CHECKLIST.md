# Sanity Cutover Checklist (Historical)

> **Status:** COMPLETED — This document is historical reference only.
> **Date:** Cutover to Sanity Content Lake was completed successfully.
> **Active CMS:** Sanity (`jz52wuvq`, `production` dataset)
> **Backend status:** `backend/` is an inert archive; see `backend/ARCHIVE.md`.

---

## What This Document Was

This checklist originally guided the zero-downtime switch of the Danny's Fish & Chips frontend from Strapi to Sanity Content Lake. The cutover has been completed and verified.

## Outcome

- Sanity project `jz52wuvq` with `production` dataset is the active CMS.
- All content (13 documents) and media (39 unique assets) were migrated successfully.
- The frontend now builds and serves exclusively from Sanity.
- The embedded Sanity Studio is available at `/studio`.

## Archived Migration Scripts

The original migration scripts used during cutover are preserved as a historical record:

- `docs/archive/migrations/migrate-assets.ts`
- `docs/archive/migrations/migrate-content.ts`
- `docs/archive/migrations/verify-assets.ts`

These scripts are no longer executable against live infrastructure and are retained for reference only.

## External Platform Cleanup

Any remaining external platform cleanup (Vercel env vars, Railway/Supabase/S3 resources) should be tracked in:

- `docs/sanity-cutover/EXTERNAL_PLATFORM_CLEANUP.md`

This document does **not** authorize or instruct execution of external cleanup tasks.

---

*DOCUMENT-ONLY — No active operations. For historical context only.*
