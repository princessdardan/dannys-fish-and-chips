# Migration Verification Guide

> **Status:** Reference for manual and scripted verification
> **Goal:** Confirm that the Sanity dataset matches Strapi content and asset counts before, during, and after cutover.

---

## Quick Verification (Scripted)

The fastest way to verify is the included script:

```bash
cd frontend
npx tsx scripts/migration/verify-assets.ts
```

**Expected output:**
```
[verify-assets] Strapi URL:     https://dannys-fish-and-chips-production.up.railway.app
[verify-assets] Sanity project: jz52wuvq (dataset: production)
[verify-assets] Strapi media count: 40
[verify-assets] Sanity asset count: 39
[verify-assets] Difference: -1 (1 duplicate file was deduplicated during migration)
[verify-assets] Status: OK — counts are within expected range
```

**If counts mismatch:**
- Check the Strapi URL and token are correct.
- Check the Sanity project ID and dataset are correct.
- Re-run `migrate-assets.ts` if needed.

---

## Manual Content Verification

### 1. Sanity Document Counts (GROQ)

Run these queries in Sanity Studio (Vision tab) or via API:

```groq
// Count all documents
count(*)

// Count by type
count(*[_type == "page"])
count(*[_type == "siteSettings"])
count(*[_type == "mainNavigation"])
count(*[_type == "announcementBar"])
count(*[_type == "announcementPage"])
count(*[_type == "specialDeals"])
```

**Expected counts:**
| Type | Count |
|------|-------|
| `page` | 7 |
| `siteSettings` | 1 |
| `mainNavigation` | 1 |
| `announcementBar` | 1 |
| `announcementPage` | 1 |
| `specialDeals` | 2 |
| **Total** | **13** |

### 2. Sanity Asset Counts

```groq
// Count all assets
count(*[_type in ["sanity.imageAsset", "sanity.fileAsset"]])
```

**Expected count:** 39

### 3. Strapi Content Counts (via API)

```bash
# Pages (articles in Strapi)
curl -s "https://dannys-fish-and-chips-production.up.railway.app/api/articles?pagination[pageSize]=100" \
  -H "Authorization: Bearer $STRAPI_API_TOKEN" | jq '.data | length'

# Site settings (global in Strapi)
curl -s "https://dannys-fish-and-chips-production.up.railway.app/api/global" \
  -H "Authorization: Bearer $STRAPI_API_TOKEN" | jq '.data | length'

# Media files
curl -s "https://dannys-fish-and-chips-production.up.railway.app/api/upload/files" \
  -H "Authorization: Bearer $STRAPI_API_TOKEN" | jq 'length'
```

**Expected counts:**
| Endpoint | Count |
|----------|-------|
| `/api/articles` | 7 |
| `/api/global` | 1 |
| `/api/upload/files` | 40 |

---

## Page-by-Page Smoke Test

After cutover, verify each page renders correctly:

| Page | URL | What to Check |
|------|-----|---------------|
| Homepage | `/` | Hero, announcement bar, navigation, footer |
| Menu | `/menu` | Menu sections, prices, images |
| Contact | `/contact-us` | Form, map, hours |
| About | `/about-us` | Content, images |
| Specials | `/special` | Deals, dates |
| Studio | `/studio` | Sanity Studio loads, content editable |

---

## Asset-by-Asset Spot Check

Key images to verify in Sanity:

1. **Logo** — used in header and footer
2. **Hero image** — homepage banner
3. **Menu item photos** — at least 3–5 items
4. **About page images** — team/location photos
5. **Special deal images** — promotional graphics

Open each in Sanity Studio and confirm:
- Image loads without 404
- Alt text is present
- Dimensions are reasonable

---

## Error Log Checks

### Vercel Logs

1. Go to **Vercel Dashboard** → Project → Logs.
2. Filter by:
   - `Sanity` — should see normal fetch logs, no errors
   - `Strapi` — should see **no** fetch attempts (post-cutover)
   - `500` or `404` — should be minimal/none

### Sanity API Logs

1. Go to **Sanity Manage** → Project → API.
2. Check for elevated error rates.
3. Expected: 0% errors for read requests.

---

## Verification Schedule

| Phase | When | What to Verify |
|-------|------|----------------|
| Pre-cutover | Before env switch | Asset + content counts match |
| Cutover | Immediately after deploy | Pages load, no 5xx |
| Post-cutover | 1 hour after | Error logs clean, analytics normal |
| Post-cutover | 24 hours after | All pages visited, no regressions |
| Post-cutover | 7 days after | Full E2E test suite passes |
| Pre-decommission | Before Strapi teardown | Final asset/content counts, backup verified |

---

## Troubleshooting Mismatches

### Strapi count > Sanity count

- **Cause:** Migration deduplicated duplicate files.
- **Action:** Compare file hashes. A difference of 1 is expected (40 Strapi → 39 Sanity).
- If difference is >1, re-run `migrate-assets.ts`.

### Sanity count > Strapi count

- **Cause:** New assets uploaded directly to Sanity during testing.
- **Action:** Remove test assets from Sanity Studio, or accept the delta.

### Content mismatch

- **Cause:** Content edited in Strapi after last migration run.
- **Action:** Re-run `migrate-content.ts` to sync latest Strapi content.

### Script errors

- **Cause:** Missing env vars or network issues.
- **Action:** Check `.env.local` has required tokens. Verify Strapi URL is reachable.
