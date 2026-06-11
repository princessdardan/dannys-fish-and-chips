# External Platform Cleanup Runbook

> **Status:** DOCUMENT-ONLY — NOT AUTHORIZED FOR EXECUTION. Do not execute any step in this document without explicit signoff.
> **Active CMS:** Sanity Content Lake
> **Backend status:** `backend/` is an inert archive; see `backend/ARCHIVE.md`.
> **Note:** This runbook was created by and exists within this repository only. No external platform changes have been performed by the creation of this document.

---

## Destructive-Action Gate

> **CRITICAL:** This is the destructive-action gate. No storage, database, or service deletion may begin until Final Backups are complete and signed off.
>
> Final backups must include:
> - [ ] Database dump (logical dump with verified checksum)
> - [ ] Asset inventory (complete object listing with checksum)
> - [ ] Redacted environment/secrets inventory
> - [ ] Checksum verification, storage location, and retention policy documented
>
> **Do not proceed with any deletion steps in this runbook until the above checklist is complete and explicitly signed off by the owner and approver(s).**

---

## 1. Owner / Signoff

| Field | Value |
|-------|-------|
| **Owner** | Required before execution |
| **Scheduled Date** | Not scheduled |
| **Actual Date** | Pending |
| **Approver(s)** | Pending |
| **Status** | Pending signoff |

---

## 2. Vercel Environment Variables

### 2.1 Identify legacy Strapi variables
Review all Vercel projects (production and preview environments) for the following legacy variables:

- `NEXT_PUBLIC_STRAPI_URL`
- `STRAPI_API_TOKEN`
- Any `_ROLLBACK_*` prefixed variables (e.g., `_ROLLBACK_STRAPI_URL`, `_ROLLBACK_STRAPI_API_TOKEN`)
- Any other backend-specific secrets (e.g., `STRAPI_API_URL`, `STRAPI_JWT_SECRET`, `STRAPI_ADMIN_JWT_SECRET`)

### 2.2 Validate frontend no longer references them
Confirm the frontend codebase does not read these variables at build time or runtime. The frontend should fetch data exclusively through `frontend/src/data/data-api.ts` and `frontend/src/data/loaders.ts`.

### 2.3 Removal procedure (requires signoff)
- [ ] List all target variables per environment (Production / Preview / Development).
- [ ] Remove variables **only** after confirming the frontend is stable on Sanity-only data for at least 7 days.
- [ ] Record removed variables and dates in the signoff section.

> **WARNING:** Do not remove `NEXT_PUBLIC_STRAPI_URL` or `STRAPI_API_TOKEN` until you have confirmed zero traffic depends on them.

---

## 3. Railway — Legacy Strapi Service

### 3.1 Identify the legacy service
- Locate the Railway project / service that hosted the Strapi backend.
- Archived configuration references:
  - `docs/archive/railway.json`
  - `docs/archive/backend-railway.json`

### 3.2 Stopping the service (requires signoff)
- [ ] Stop the Railway service (do not delete yet).
- [ ] Monitor for 7 days. Confirm no client errors, no frontend build failures, and no third-party integrations are calling the old backend.
- [ ] If stable, proceed to removal.

### 3.3 Removing the service / project (requires signoff)
- [ ] Remove the Strapi service from the Railway project.
- [ ] If the Railway project contains **only** the Strapi service, consider deleting the entire project.
- [ ] Record the service name, project URL, and removal date in the signoff section.

> **WARNING:** Do not delete the Railway project until all dependent services (e.g., attached PostgreSQL, S3/Supabase integrations) have been backed up and verified as no longer needed.

---

## 4. S3 / Supabase Storage — Asset Cleanup

### 4.1 Bucket inventory
- [ ] List all S3 buckets or Supabase storage buckets previously used for Strapi uploads.
- [ ] Document bucket names, regions, and estimated object counts / total size.
- [ ] Identify any lifecycle policies or cross-region replication.

### 4.2 Final asset inventory
- [ ] Export a complete inventory of objects (keys, sizes, last-modified dates).
- [ ] Store the inventory in a secure, durable location (e.g., separate S3 bucket with versioning, or encrypted local storage).

### 4.3 Verify assets in Sanity
- [ ] Confirm asset completeness using one of the following:
  - Historical verified results from [`docs/sanity-cutover/VERIFICATION.md`](./VERIFICATION.md) (39 unique Sanity assets verified; 1 duplicate deduplicated during migration).
  - A current Sanity-only inventory (e.g., query Sanity for all `_type == "sanity.imageAsset"` or `sanity.fileAsset` documents).
- [ ] The archived script at `docs/archive/migrations/verify-assets.ts` is **historical reference only** and is not required for live cleanup.
- [ ] Resolve any mismatches or missing assets before proceeding.

### 4.4 Deletion / downgrade (requires signoff)
- [ ] Delete or empty the legacy bucket **only** after:
  - Sanity asset verification passes.
  - A retention period of at least 30 days has elapsed since cutover.
  - Final backups are confirmed (see Section 7).
- [ ] If using Supabase, downgrade or delete the project **only** after confirming no other services depend on it.
- [ ] Record deletion/downgrade dates and confirmation in the signoff section.

> **WARNING:** Deletion is irreversible. Ensure checksums and backups are verified before proceeding.

---

## 5. PostgreSQL / Database

### 5.1 Final dump
- [ ] Perform a final logical dump of the Strapi PostgreSQL database:
  ```bash
  pg_dump --format=custom --file=strapi-final-$(date +%Y%m%d).dump <connection_string>
  ```
- [ ] Alternatively, use the hosting provider's export tool (e.g., Railway, Neon, Supabase dashboard).

### 5.2 Secure storage
- [ ] Transfer the dump to encrypted, durable storage (e.g., encrypted S3 Glacier, encrypted local NAS, or equivalent).
- [ ] Restrict access to the dump to the owner and designated approvers only.

### 5.3 Checksum and retention
- [ ] Generate a SHA-256 checksum of the dump file:
  ```bash
  sha256sum strapi-final-YYYYMMDD.dump > strapi-final-YYYYMMDD.dump.sha256
  ```
- [ ] Retain the dump and checksum for a minimum of **12 months** (or per organizational policy).
- [ ] Document the retention policy and expiry date.

### 5.4 Delete / downgrade (requires signoff)
- [ ] Delete the PostgreSQL instance or database **only** after:
  - Final dump is verified (restore test optional but recommended).
  - Checksum matches.
  - A retention period of at least 30 days has elapsed since cutover.
- [ ] If using a managed service (Railway, Neon, Supabase), downgrade the plan or delete the project.
- [ ] Record deletion/downgrade dates and confirmation in the signoff section.

> **WARNING:** Do not delete the database until the final dump is verified and the checksum is recorded.

---

## 6. Secrets — Revocation and Rotation

### 6.1 Strapi application secrets
Locate and revoke or rotate the following secrets. These were typically defined in the Railway / hosting environment or `.env` files:

- `APP_KEYS`
- `API_TOKEN_SALT`
- `ADMIN_JWT_SECRET`
- `TRANSFER_TOKEN_SALT`
- `JWT_SECRET`
- `ENCRYPTION_KEY`

### 6.2 Cloud and storage credentials
- [ ] Rotate or revoke S3 access keys / IAM credentials used by the Strapi backend.
- [ ] Rotate or revoke Supabase service-role keys / anon keys if no other services depend on them.
- [ ] Update or remove any CloudFront / CDN origin access identities tied to the legacy bucket.

### 6.3 Strapi API tokens
- [ ] Revoke any Strapi API tokens issued for the legacy instance (e.g., `STRAPI_API_TOKEN` used by the frontend or third-party integrations).
- [ ] Confirm no external integrations are still authenticating against the old Strapi instance.

### 6.4 Record keeping
- [ ] Document each secret category, the rotation/revocation action taken, and the date.
- [ ] Store this record securely (e.g., password manager, secrets vault).

> **WARNING:** Do not revoke secrets until you have confirmed no active service depends on them. Revoking secrets prematurely can break running services or CI pipelines.

---

## 7. Final Backups

### 7.1 Database dump
- [ ] Final PostgreSQL dump completed (see Section 5).
- [ ] Dump file location: `__RECORD_LOCATION__`
- [ ] Dump file checksum (SHA-256): `__RECORD_CHECKSUM__`

### 7.2 Asset inventory
- [ ] Final S3 / Supabase asset inventory completed (see Section 4).
- [ ] Inventory file location: `__RECORD_LOCATION__`
- [ ] Inventory file checksum (SHA-256): `__RECORD_CHECKSUM__`

### 7.3 Environment and secrets inventory (redacted)
- [ ] Create a redacted inventory of all environment variables and secrets used by the legacy Strapi backend.
- [ ] Redact all actual secret values (replace with `[REDACTED]`).
- [ ] Include variable names, environments (Production / Staging / Preview), and purpose.
- [ ] Store the redacted inventory in this repo or a secure documentation location.

### 7.4 Retention policy
- [ ] Define retention period for final backups (recommended: minimum 12 months).
- [ ] Set calendar reminder for retention expiry review.
- [ ] Document the responsible party for retention compliance.

---

## 8. Completion Checklist and Signoff

### 8.1 Pre-execution checklist
- [ ] Owner assigned.
- [ ] Scheduled date agreed upon by owner and approver(s).
- [ ] All sections of this runbook reviewed.
- [ ] Rollback window defined (e.g., 48 hours after each destructive step).

### 8.2 Execution checklist
Complete the table below as each section is executed and verified. Do not mark complete until the step is verified.

| Section | Step | Verified By | Date | Notes |
|---------|------|-------------|------|-------|
| 2 | Vercel env vars removed | | | |
| 3 | Railway service stopped | | | |
| 3 | Railway service/project removed | | | |
| 4 | S3/Supabase bucket inventory | | | |
| 4 | Sanity asset verification passed | | | |
| 4 | S3/Supabase bucket deleted / downgraded | | | |
| 5 | Final PostgreSQL dump | | | |
| 5 | Dump checksum verified | | | |
| 5 | PostgreSQL deleted / downgraded | | | |
| 6 | Strapi secrets revoked / rotated | | | |
| 6 | Cloud credentials revoked / rotated | | | |
| 6 | Strapi API tokens revoked | | | |
| 7 | Database dump stored securely | | | |
| 7 | Asset inventory stored securely | | | |
| 7 | Redacted env/secrets inventory stored | | | |

### 8.3 Final signoff

| Field | Value |
|-------|-------|
| **Owner** | Required before execution |
| **Approver(s)** | Pending |
| **Execution completed date** | Pending |
| **All sections verified** | Pending |
| **Final signoff** | Pending |

> **This document is repo-created documentation only.** No external platform changes have been performed by the creation or maintenance of this file. All destructive actions require explicit owner and approver signoff before execution.

---

## 9. Execution Record

Record all removed resources, revoked secrets, and deleted services here.

| Resource Name | Platform | Environment | Action | Date | Verifier | Notes |
|---------------|----------|-------------|--------|------|----------|-------|
| | | | | | | |

---

*DOCUMENT-ONLY — NOT AUTHORIZED FOR EXECUTION. External cleanup is out of scope for this repository.*
