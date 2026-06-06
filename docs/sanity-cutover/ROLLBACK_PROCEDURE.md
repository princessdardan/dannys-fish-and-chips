# Rollback Procedure

> **Status:** Documented and tested locally
> **Goal:** Revert the frontend from Sanity back to Strapi within 5 minutes if critical issues arise after cutover.

---

## When to Rollback

Rollback immediately if any of the following occur after the Sanity cutover:

- Homepage or key pages fail to load (5xx errors)
- CMS content is missing or incorrect (blank sections, stale data)
- Contact form or interactive features break
- Sanity API errors spike in Vercel logs
- Any issue that stakeholders deem customer-facing and urgent

---

## Rollback Steps (Vercel Production)

**Estimated time:** 3–5 minutes

> **Important:** The migrated frontend is Sanity-only. There is no runtime CMS switch.
> Rollback requires redeploying a pre-Sanity Strapi-backed deployment, not just renaming env vars.

### Step 1: Revert to a Pre-Sanity Deployment

1. Go to **Vercel Dashboard** → Deployments.
2. Find the last successful deployment **before the Sanity cutover** (pre-Sanity commit/tag).
3. Click **Redeploy** on that deployment, or:
   - Revert the codebase to the pre-Sanity commit/tag (e.g., `git revert` or checkout the known-good tag).
   - Push to trigger a new deployment with the Strapi-backed frontend code.

### Step 2: Restore Strapi Environment Variables

If the pre-Sanity deployment does not include the required Strapi env vars, set them first:

1. Go to **Vercel Dashboard** → Project Settings → Environment Variables.
2. Ensure these variables are present:
   - `NEXT_PUBLIC_STRAPI_URL`
   - `STRAPI_API_TOKEN`
3. Remove or rename Sanity variables (keep them prefixed for quick re-cutover):
   - `NEXT_PUBLIC_SANITY_PROJECT_ID` → `_ROLLBACK_NEXT_PUBLIC_SANITY_PROJECT_ID`
   - `NEXT_PUBLIC_SANITY_DATASET` → `_ROLLBACK_NEXT_PUBLIC_SANITY_DATASET`
   - `NEXT_PUBLIC_SANITY_API_VERSION` → `_ROLLBACK_NEXT_PUBLIC_SANITY_API_VERSION`
   - `SANITY_API_READ_TOKEN` → `_ROLLBACK_SANITY_API_READ_TOKEN`
4. Click **Save** and redeploy the pre-Sanity commit if needed.

### Step 3: Verify the Rollback Deployment

1. Wait for the deployment to finish (check Vercel dashboard).
2. Open the production URL in an incognito window.
3. Confirm pages load and content renders correctly.
4. Check the Network tab for Strapi API calls (should hit `railway.app` or your Strapi URL).

### Step 4: Notify Stakeholders

- Confirm rollback is complete.
- Note the time of rollback for post-mortem.
- Keep Strapi running; do NOT decommission it.

---

## Rollback Steps (Local Development)

If you need to rollback a local dev environment, the migrated frontend code is
Sanity-only and will not work with Strapi env vars alone. You must revert the
frontend codebase first.

1. **Revert the frontend to a pre-Sanity commit/tag/branch** (e.g.):
   ```bash
   git checkout <pre-sanity-tag>
   ```
   or create a revert commit:
   ```bash
   git revert --no-commit <sanity-migration-commit>...
   ```
2. **Restore Strapi environment variables** in `frontend/.env.local`:
   ```bash
   NEXT_PUBLIC_STRAPI_URL=https://dannys-fish-and-chips-production.up.railway.app
   STRAPI_API_TOKEN=...
   ```
   Remove or comment out Sanity variables.
3. **Restart the Next.js dev server**:
   ```bash
   cd frontend && npm run dev
   ```

---

## Post-Rollback Investigation

After rollback, investigate the root cause before re-attempting cutover:

1. **Check Vercel build logs** for Sanity-related errors.
2. **Check Sanity dataset** for missing documents or schema mismatches.
3. **Re-run verification script**:
   ```bash
   cd frontend
   npx tsx scripts/migration/verify-assets.ts
   ```
4. **Compare content** between Strapi and Sanity Studio.
5. **Fix the issue** in the Sanity schema, frontend code, or migration scripts.
6. **Re-test** locally and on preview before re-cutover.

---

## Rollback Checklist

- [ ] Strapi environment variables restored in Vercel
- [ ] Sanity environment variables renamed/preserved
- [ ] New production deployment triggered and completed
- [ ] Production URL smoke-tested in incognito
- [ ] Strapi API calls confirmed in Network tab
- [ ] Stakeholders notified
- [ ] Root cause documented for post-mortem
- [ ] Strapi backend left running (not decommissioned)

---

## Important Notes

- **Strapi must remain running** on Railway during the rollback window (minimum 48 hours after cutover).
- **Do not delete the Sanity dataset** during rollback; it is preserved for re-cutover.
- **Do not delete Strapi media or content** until the decommission milestone is complete.
- The `_ROLLBACK_*` prefix convention keeps variables available but inactive, enabling sub-5-minute rollbacks.
