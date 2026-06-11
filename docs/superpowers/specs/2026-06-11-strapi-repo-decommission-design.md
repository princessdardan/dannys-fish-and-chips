# Strapi Backend Decommission Design

**Date:** 2026-06-11
**Status:** Approved
**Scope:** Repository-only decommission of the Strapi 5 backend after Sanity migration to `main`.

---

## Purpose/Scope

This spec defines the repository-level cleanup required to decommission the Strapi backend inside the Danny's Fish & Chips monorepo. The goal is to remove active backend runtime, deployment, and test coupling, and to convert the Strapi backend into an inert archive for history and compliance.

External platform cleanup (Vercel, Railway, S3/Supabase, Postgres, secrets) is **out of scope for execution** but must be captured in a separate runbook/document.

---

## Current Context

- The Sanity migration has merged to `main`.
- The Next.js frontend now fetches content from Sanity instead of Strapi.
- Forms are handled via Resend.
- The `backend/` directory still exists with active Strapi 5 code, dependencies, and configuration.
- Root scripts, CI, Railway configs, Playwright setup, and frontend Strapi helpers/types/comments still reference the backend.
- Migration scripts may still live in active repo paths.
- The working tree currently contains dirty/staged conflict-resolution changes; this work must not touch them.

---

## Goals

1. Make `backend/` an inert, read-only archive with no active build, dev, or deploy path.
2. Remove backend-related automation from root `package.json`, CI, and test setup.
3. Remove or archive frontend Strapi helpers, types, and comments.
4. Move migration scripts out of active paths or clearly mark them historical.
5. Update project documentation to reflect the Sanity-only architecture.
6. Produce a separate external-cleanup runbook/document with clear ownership and signoff.

---

## Non-Goals

- No deletion of external platform resources (Vercel, Railway, S3/Supabase, Postgres, secrets).
- No production data mutation beyond repository changes.
- No broad frontend refactoring beyond removing Strapi-specific coupling.
- No changes to the dirty/staged conflict-resolution changes in the working tree.
- No commit or branch creation as part of this document creation step.

---

## Selected Approach: Two-Stage Repo Decommission

### Stage 1 - Disconnect

- Update root `package.json` scripts to remove backend install/dev/build/start commands.
- Remove or archive Railway configuration files.
- Update Playwright/test setup to stop starting the Strapi backend.
- Remove frontend Strapi data helpers, types, and related comments.
- Audit and update environment variable templates/examples.
- Update CI workflows to drop backend build/start steps.

### Stage 2 - Archive

- Convert `backend/` into an inert archive directory.
- Move migration scripts into `docs/` or an archive path.
- Add an archive README inside `backend/` explaining its status.
- Update root documentation (`README.md`, `AGENTS.md`, `CLAUDE.md`) to reflect Sanity-only operation.

This approach balances cleanliness with rollback safety by preserving source history in place rather than deleting the directory.

---

## Alternatives/Tradeoffs

| Alternative | Pros | Cons | Decision |
|-------------|------|------|----------|
| Delete `backend/` entirely | Cleanest repo state | Loses in-tree history; harder rollback; larger diff | Rejected |
| Keep `backend/` fully active | Easiest short-term path | Continued maintenance debt, CI time, confusion | Rejected |
| Archive `backend/` in place (selected) | Preserves history, clear inert status, smaller blast radius | Directory still present | Accepted |

---

## Target Repo Architecture / Data Flow

```
Next.js frontend (frontend/)
    |
    |-- Content ----> Sanity
    |
    |-- Forms ------> Resend
    |
backend/ (inert archive, no runtime role)
```

- Content requests go directly from the Next.js frontend to Sanity.
- Form submissions go directly to Resend.
- `backend/` has no runtime, build, or deployment role.

---

## Planned Repo Cleanup Areas

### Root Scripts

- Remove `install:all`, `dev`, `dev:backend`, `build:all`, or equivalent entries that orchestrate the backend.
- Keep `dev:frontend` and frontend-only build/lint commands.
- Update `README.md` command tables.

### Railway Configs

- Remove or archive `railway.json`, `.railway/`, and any Railway-specific environment files.
- Document the Railway project/service identifiers in the external cleanup runbook.

### Playwright / Test Setup

- Remove backend startup logic from Playwright configuration and global setup.
- Remove backend dependency installation from test setup scripts.
- Update E2E documentation to reflect Sanity-only prerequisites.

### Frontend Strapi Helpers / Types / Comments

- Preserve `frontend/src/data/data-api.ts` and `frontend/src/data/loaders.ts` as the active Sanity data boundaries; remove only Strapi-specific fetch code, naming, response types, environment references, and comments from them.
- Remove Strapi type definitions and Zod/validation schemas.
- Strip Strapi-specific comments from components and utilities.
- Keep any generic data-fetching abstractions that can be reused for Sanity.

### Migration Scripts

- Move migration scripts from active source paths into `docs/archive/migrations/` or similar.
- Ensure they remain readable but are no longer imported or executed by the build.

### Documentation

- Update `README.md`, `AGENTS.md`, and `CLAUDE.md` to describe the Sanity-only stack.
- Add a decommission changelog entry.
- Cross-link the external cleanup runbook.

---

## Backend Archive Policy

- `backend/` is retained as a read-only archive.
- No further builds, dependency installs, local development, or deployments are performed from it.
- A final backup is captured before full archive status and stored in a documented location (database dump, uploaded-assets inventory, `.env` template).
- An `ARCHIVE.md` or `README.md` is added inside `backend/` stating:
  - Archive date
  - Reason for decommission
  - Last known working commit
  - Where final backups live
  - That the directory is not to be modified or executed

---

## External Platform Cleanup Runbook / Document Requirements

A separate document must be created and approved. It must cover, at minimum:

- **Vercel environment variables:** identify and remove Strapi-related vars such as `NEXT_PUBLIC_STRAPI_URL` after confirming frontend no longer references them.
- **Railway:** project/service teardown steps, including environment deletion if applicable.
- **S3 / Supabase storage:** bucket listing, asset inventory, and deletion/suspension steps.
- **Postgres:** database snapshot, dump location, and deletion procedure.
- **Secrets:** rotation or revocation of `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET`, `ENCRYPTION_KEY`, and any cloud-provider credentials.
- **Final backups:** exact location, checksums if available, retention policy.
- **Ownership:** name of the person responsible for execution.
- **Date:** scheduled and actual execution date.
- **Signoff:** required approver(s) and confirmation that all steps are complete.

The runbook must be treated as a controlled document; it does not authorize execution until signed off.

---

## Validation / Checks

- `npm run dev:frontend` starts the Next.js frontend without requiring the backend.
- `npm run build` (from `frontend/`) completes successfully with no Strapi env dependencies.
- `npm run lint` and `npx tsc --noEmit` pass in the frontend.
- Root `package.json` contains no scripts that install, build, or start `backend/`.
- CI workflows do not reference `backend/` build/start steps.
- Playwright configuration does not start the Strapi backend.
- No active frontend code imports Strapi-specific helpers or types.
- `backend/` is marked as archive and contains no executable entry points that are called by the repo.
- External cleanup runbook exists and has required owner/date/signoff fields.

---

## Risks / Rollback

| Risk | Impact | Mitigation |
|------|--------|------------|
| CI/build still expects backend | Build failures | Audit root scripts and CI before merging cleanup |
| Frontend env vars still point to Strapi | Runtime errors or confusion | Audit `.env.example` and Vercel env vars |
| Migration scripts referenced by docs or tests | Broken links/tests | Update references or move to archive path |
| Staged/dirty conflict changes interfered with | Lost work | Strictly avoid touching unrelated files |
| External platform cleanup executed prematurely | Data loss | Document-only scope; require signed runbook |

**Rollback:** If the decommission needs reversal, restore `backend/` and related configuration from the Git history captured immediately before Stage 1 merge. Final backups provide an additional recovery path.

---

## Acceptance Criteria

- [ ] Root `package.json` scripts no longer reference `backend/`.
- [ ] CI workflows no longer build or start the Strapi backend.
- [ ] Railway configuration is removed or archived.
- [ ] Playwright/test setup no longer depends on the backend.
- [ ] Strapi-specific frontend helpers, types, and comments are removed or archived; `frontend/src/data/data-api.ts` and `frontend/src/data/loaders.ts` remain as active Sanity data boundaries.
- [ ] Migration scripts are moved out of active execution paths.
- [ ] `backend/` is inert, documented as an archive, and contains an archive README.
- [ ] Project documentation is updated to reflect the Sanity-only architecture.
- [ ] A separate external platform cleanup runbook exists and includes Vercel env vars, Railway, S3/Supabase, Postgres, secrets, final backups, owner, date, and signoff.
- [ ] No dirty/staged conflict-resolution changes were modified during this work.

---

## Notes / Decisions

- Archive-in-place was selected over deletion to preserve Git history and minimize blast radius.
- External cleanup is intentionally document-only to keep approval and execution separate.
- All implementation work must branch from a clean state and avoid the current dirty/staged conflict-resolution changes.
