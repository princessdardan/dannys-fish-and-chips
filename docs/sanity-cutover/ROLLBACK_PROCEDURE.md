# Rollback Procedure (Historical)

> **Status:** OBSOLETE — This document is historical reference only.
> **Reason:** The Sanity cutover was completed successfully. Strapi repository decommission is complete. Rollback to Strapi is no longer possible.
> **Active CMS:** Sanity Content Lake
> **Backend status:** `backend/` is an inert archive; see `backend/ARCHIVE.md`.

---

## What This Document Was

This procedure originally described how to revert the frontend from Sanity back to Strapi within 5 minutes if critical issues arose after cutover. It required:

- A pre-Sanity Vercel deployment to redeploy
- Active Strapi environment variables (since removed)
- Strapi infrastructure running during the rollback window

## Why It Is No Longer Applicable

- The frontend codebase has been fully migrated to Sanity-only; there is no pre-Sanity deployment path.
- Strapi infrastructure has been decommissioned.
- The `backend/` directory in this repo is an inert archive and is not built, run, or deployed.

## Archived Migration Scripts

The original migration and verification scripts are preserved under:

- `docs/archive/migrations/`

These are retained for historical context only.

## External Platform Cleanup

External platform cleanup is tracked separately in:

- `docs/sanity-cutover/EXTERNAL_PLATFORM_CLEANUP.md`

That document is **document-only** until signed off. External infrastructure, environment, and platform cleanup remains outstanding until `EXTERNAL_PLATFORM_CLEANUP.md` is explicitly signed off.

---

*DOCUMENT-ONLY — No active operations. For historical context only.*
