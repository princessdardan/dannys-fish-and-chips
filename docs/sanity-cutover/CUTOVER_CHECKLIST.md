# Sanity Cutover Checklist

> **Status:** Ready for execution
> **Goal:** Switch the Danny's Fish & Chips frontend from Strapi to Sanity Content Lake with zero-downtime and a verified rollback path.

---

## Prerequisites

- [ ] Milestone 13 automated verification passing (`tsc`, `lint`, `build`, E2E)
- [ ] Sanity project `jz52wuvq` configured with `production` dataset
- [ ] All Strapi media already migrated to Sanity (39 unique assets verified)
- [ ] All Strapi content already migrated to Sanity (13 docs verified)
- [ ] Frontend builds successfully against Sanity in local/staging
- [ ] `SANITY_API_READ_TOKEN` available for production dataset reads
- [ ] Team knows the rollback procedure (see `ROLLBACK_PROCEDURE.md`)

---

## Phase 1: Pre-Cutover Freeze (5 min)

**Goal:** Prevent content drift between Strapi and Sanity during the cutover window.

1. **Notify stakeholders** that the CMS is entering a brief freeze window.
2. **Pause content edits in Strapi Admin** (Railway production).
3. **Pause content edits in Sanity Studio** (embedded at `/studio`).
4. **Confirm no active editors** in either system.

> **Note:** If content must remain editable, skip the freeze and accept that a small delta may exist. Re-run the content migration after cutover if needed.

---

## Phase 2: Final Migration Sync (10–20 min)

**Goal:** Ensure production dataset matches Strapi exactly.

### Preflight: Required Environment Variables

Before running the migration scripts, ensure `frontend/.env.local` (or your shell environment) contains:

| Variable | Purpose | Required For |
|----------|---------|-------------|
| `SANITY_PROJECT_ID` | Your existing Sanity project ID | Write + Read |
| `SANITY_DATASET` | Target dataset (should be `production`) | Write + Read |
| `SANITY_API_WRITE_TOKEN` | Sanity token with write access to the dataset | **Write migrations only** |
| `STRAPI_URL` or `NEXT_PUBLIC_STRAPI_URL` | Strapi API base URL | Read (source) |
| `STRAPI_API_TOKEN` | Strapi API token for authenticated reads | Read (source) |

> **Note:** `SANITY_API_READ_TOKEN` is used for verification and runtime frontend reads, **not** for migration writes. Migration scripts require `SANITY_API_WRITE_TOKEN`.

### Migration Steps

1. **Re-run asset migration** (safe, idempotent due to deduplication):
   ```bash
   cd frontend
   npx tsx scripts/migration/migrate-assets.ts
   ```
   - Confirm output: `39 unique assets in Sanity`.

   > **Important:** `migrate-assets.ts` must run before `migrate-content.ts` because the content migration references the asset mapping produced by the asset migration.

2. **Re-run content migration** (safe, overwrites existing docs by ID):
   ```bash
   cd frontend
   npx tsx scripts/migration/migrate-content.ts
   ```
   - Confirm output: `13 content documents written`.

3. **Run verification script** (read-only):
   ```bash
   cd frontend
   npx tsx scripts/migration/verify-assets.ts
   ```
   - Confirm: `Strapi media count: 40` and `Sanity asset count: 39` (difference of `-1` from one deduplicated duplicate).
   - The script defaults to strict checking: expected difference `-1`, tolerance `0`. If your migration result differs, override via env vars:
     ```bash
     EXPECTED_ASSET_DIFF=0 ASSET_DIFF_TOLERANCE=0 npx tsx scripts/migration/verify-assets.ts
     ```

4. **Manual spot-check in Sanity Studio**:
   - Open `/studio` locally or on preview deployment.
   - Verify pages, site settings, navigation, announcement bar, special deals.

---

## Phase 3: Frontend Environment Switch (2 min)

**Goal:** Point the Next.js frontend to Sanity instead of Strapi.

### Vercel Production

1. Go to **Vercel Dashboard** → Project Settings → Environment Variables.
2. **Add** Sanity variables (if not already present):
   - `NEXT_PUBLIC_SANITY_PROJECT_ID` = `jz52wuvq`
   - `NEXT_PUBLIC_SANITY_DATASET` = `production`
   - `NEXT_PUBLIC_SANITY_API_VERSION` = `2024-06-01`
   - `SANITY_API_READ_TOKEN` = `<read-token>`
3. **Add** production form handling variables (server-only — do NOT prefix with `NEXT_PUBLIC_`):
   - `RESEND_API_KEY` = `<resend-api-key>`
   - `RESEND_CONTACT_TO_EMAIL` = `<contact-recipient-email>`
   - `RESEND_FROM_EMAIL` = `<verified-sender-email>`
   - `RESEND_AUDIENCE_ID` = `<resend-audience-id>`

   > **Note:** Previews without these variables will dry-run forms silently. Only Vercel production (`VERCEL_ENV=production`) requires these to be set; missing values will return HTTP 500.

4. **Remove or rename** Strapi variables (do NOT delete until rollback window closes):
   - Rename `NEXT_PUBLIC_STRAPI_URL` → `_ROLLBACK_NEXT_PUBLIC_STRAPI_URL`
   - Rename `STRAPI_API_TOKEN` → `_ROLLBACK_STRAPI_API_TOKEN`
4. Click **Save** and trigger a new production deployment.

### Vercel Preview (for verification)

If you want to test on a preview deployment first:
1. Set the above Sanity variables on a **preview branch**.
2. Deploy the branch.
3. Run smoke tests against the preview URL before promoting to production.

   > **Note:** Form submission tests on previews will dry-run if Resend variables are not set on the preview environment. This is expected behavior.

---

## Phase 4: Build & Deploy Verification (10 min)

**Goal:** Confirm the production deployment serves content from Sanity.

1. **Wait for Vercel build to complete** (monitor dashboard).
2. **Check build logs** for Sanity-related errors (search `Sanity`, `fetchDocument`).
3. **Smoke test the live site**:
   ```bash
   # Homepage loads
   curl -s https://dannys-fish-and-chips.vercel.app/ | grep -i "fish"

   # Menu page loads
   curl -s https://dannys-fish-and-chips.vercel.app/menu | grep -i "menu"

   # Contact page loads
   curl -s https://dannys-fish-and-chips.vercel.app/contact-us | grep -i "contact"
   ```
4. **Check Sanity Studio** loads at `/studio`.
5. **Verify no Strapi API calls** in browser Network tab (filter by `railway.app` or `1337`).

---

## Phase 5: Post-Cutover Monitoring (24–48 hr)

**Goal:** Catch any runtime issues early while rollback is still easy.

- [ ] Monitor Vercel Analytics for 4xx/5xx errors.
- [ ] Monitor Sanity API usage dashboard for errors.
- [ ] Verify contact form submissions still work (uses Resend, not CMS-dependent).
- [ ] Verify any dynamic content (announcement bar, special deals) renders correctly.
- [ ] Keep Strapi running on Railway during this window.

---

## Phase 6: Cleanup (after stable period)

After 24–48 hours of stable operation:

1. Delete the renamed `_ROLLBACK_*` environment variables from Vercel.
2. Proceed to **Strapi Decommission** (see `STRAPI_DECOMMISSION.md`).

---

## Emergency Contacts

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Railway Dashboard:** https://railway.app/dashboard
- **Sanity Manage:** https://www.sanity.io/manage
- **Rollback:** See `ROLLBACK_PROCEDURE.md`
