# Strapi Decommission Guide

> **Status:** For use after stable Sanity cutover
> **Goal:** Safely and permanently decommission the Strapi backend and its infrastructure after a stable monitoring period.

---

## Prerequisites

- [ ] Sanity cutover completed and stable for **minimum 7 days** (recommended 14–30 days)
- [ ] No rollback performed during the monitoring period
- [ ] All stakeholders have approved Strapi decommission
- [ ] Sanity asset and content counts verified (see `VERIFICATION.md`)
- [ ] Final Strapi database backup exported and stored securely

---

## Phase 1: Verify No Runtime Strapi Dependencies

**Goal:** Confirm the frontend and CI/CD no longer reference Strapi.

1. **Search frontend code for Strapi references**:
   ```bash
   cd frontend
   grep -r "STRAPI" src/ --include="*.ts" --include="*.tsx" || echo "No Strapi references found"
   grep -r "strapi" src/ --include="*.ts" --include="*.tsx" -i || echo "No strapi references found"
   ```
   - Expected: Only migration scripts and legacy type files may reference Strapi.
   - If runtime code still references Strapi, **do not proceed**.

2. **Check environment variables**:
   - Vercel production should have **no** `NEXT_PUBLIC_STRAPI_URL` or `STRAPI_API_TOKEN`.
   - Any `_ROLLBACK_*` prefixed variables should have been removed after the stable period.

3. **Check CI/CD workflows**:
   - `.github/workflows/` should not start or depend on Strapi.
   - E2E tests should pass against Sanity-powered frontend.

---

## Phase 2: Verify All Assets in Sanity

**Goal:** Confirm every Strapi media file exists in Sanity.

1. **Run the verification script**:
   ```bash
   cd frontend
   npx tsx scripts/migration/verify-assets.ts
   ```
   - Confirm output shows expected counts.
   - If counts mismatch, investigate missing assets before proceeding.

2. **Manual sanity check** (optional but recommended):
   - Open Sanity Studio → Media tab.
   - Spot-check key images (logo, hero, menu items).

---

## Phase 3: Export Final Strapi Database Backup

**Goal:** Preserve a complete backup before deletion.

1. **Export Strapi data** (if Strapi still running locally or on Railway):
   ```bash
   cd backend
   npm run strapi export -- --file strapi-final-backup
   ```
   - Or use Railway dashboard to download the PostgreSQL backup.

2. **Store the backup securely**:
   - Upload to a secure cloud storage location (S3 bucket, Google Drive, etc.).
   - Verify the backup file is readable and complete.

3. **Document backup location** in this file or team wiki.

---

## Phase 4: Stop Railway Strapi Service

**Goal:** Take Strapi offline.

1. Go to **Railway Dashboard** → Danny's Fish & Chips project.
2. Find the Strapi service.
3. **Stop** or **remove** the service:
   - Option A: Click **Stop** (preserves config, no billing).
   - Option B: Click **Remove** (permanently deletes service).
   - **Recommendation:** Stop first, wait 7 days, then remove.

4. **Verify** the Strapi URL returns an error (e.g., `502` or connection refused).

---

## Phase 5: Clean Up Storage & Database

### S3 / Image Uploads

1. Identify the S3 bucket used for Strapi uploads (check `backend/.env` or Railway env vars).
2. **Download** any remaining files not in Sanity (should be none if migration was complete).
3. **Delete** the S3 bucket or its contents.
4. **Remove** S3 environment variables from Railway/Vercel:
   - `S3_BUCKET`
   - `S3_REGION`
   - `S3_ACCESS_KEY_ID`
   - `S3_ACCESS_SECRET`
   - `S3_ENDPOINT`

### Supabase (if used for storage)

1. Go to **Supabase Dashboard**.
2. Navigate to the project used for Strapi uploads.
3. **Delete** the storage bucket or the entire project (if no other apps use it).
4. **Downgrade** the Supabase plan if it was on a paid tier.

### PostgreSQL (if hosted separately)

1. If PostgreSQL was hosted on Railway/Neon/Supabase:
   - Export final schema and data.
   - Delete the database instance.
   - Downgrade or cancel the database service plan.

---

## Phase 6: Remove Strapi Environment Variables from Vercel

**Goal:** Clean up all Strapi-related env vars from the frontend platform.

1. Go to **Vercel Dashboard** → Project Settings → Environment Variables.
2. **Delete** any remaining Strapi variables:
   - `NEXT_PUBLIC_STRAPI_URL`
   - `STRAPI_API_TOKEN`
   - Any `_ROLLBACK_*` prefixed variants
3. Also remove backend-related variables if they exist in Vercel (they shouldn't):
   - `APP_KEYS`
   - `API_TOKEN_SALT`
   - `ADMIN_JWT_SECRET`
   - `TRANSFER_TOKEN_SALT`
   - `JWT_SECRET`
   - `ENCRYPTION_KEY`

---

## Phase 7: Update Documentation

1. **Update `README.md`**:
   - Remove Strapi from the tech stack.
   - Update the project structure diagram to remove `backend/`.
   - Update environment variable tables to Sanity-only.

2. **Update `DEPLOYMENT.md`**:
   - Remove Strapi deployment sections.
   - Update to Sanity-only deployment instructions.

3. **Update `AGENTS.md`** (if applicable):
   - Remove `backend-engineer-strapi` agent reference.
   - Add `cms-admin-sanity` or similar if needed.

4. **Archive this guide**:
   - Move `docs/sanity-cutover/` to `docs/archive/sanity-cutover/` after decommission is complete.

---

## Phase 8: Mark Backend as Deprecated

1. **Update `backend/README.md`**:
   - Add a prominent deprecation notice.
   - Link to Sanity Studio and the decommission date.

2. **Add `backend/DEPRECATED.md`** (optional):
   - State the decommission date.
   - Link to the final backup location.
   - Note that the backend code is preserved for reference but no longer deployed.

3. **Update root `package.json`**:
   - Remove backend-related scripts (`dev:backend`, `build:all` referencing backend).
   - Or keep them but add deprecation warnings.

---

## Decommission Checklist

- [ ] No runtime Strapi dependencies in frontend code
- [ ] No Strapi environment variables in Vercel production
- [ ] All assets verified in Sanity
- [ ] Final Strapi database backup exported and stored securely
- [ ] Railway Strapi service stopped/removed
- [ ] S3 bucket emptied and deleted
- [ ] Supabase project downgraded/deleted (if applicable)
- [ ] PostgreSQL instance deleted (if applicable)
- [ ] Strapi env vars removed from Vercel
- [ ] `README.md` updated (Strapi references removed)
- [ ] `DEPLOYMENT.md` updated (Strapi sections removed)
- [ ] `backend/README.md` marked deprecated
- [ ] Team notified that decommission is complete

---

## Post-Decommission Notes

- The `backend/` directory in the repo is preserved as a **read-only archive**.
- Do NOT delete the `backend/` directory from Git unless explicitly requested.
- If Strapi ever needs to be revived, restore from the final backup and re-deploy to Railway.
- Sanity remains the primary CMS. Future content work happens in Sanity Studio.
