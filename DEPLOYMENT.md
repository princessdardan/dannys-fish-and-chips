# Deployment Guide - Vercel and Sanity

## Overview

This application is a **Next.js 16** frontend deployed to **Vercel**. Content is managed via **Sanity Content Lake**. The `backend/` directory is an inert archive of a decommissioned Strapi backend and is **not built, run, or deployed**.

## Prerequisites

- **Vercel project** configured with root directory set to `frontend/`
- **Node.js**: `>=20 <=24` (CI truth is Node 20)
- **Sanity environment variables** (see table below)
- **Resend environment variables** for production contact/newsletter forms
- **Motion**: `MOTION_DEV_TOKEN` is required for the install step unless `frontend/.cache/motion-plus-2.0.2.tgz` already exists

## Build and Install Commands

Vercel install command (runs preinstall hook):

```bash
node scripts/setup-motion.mjs && npm install
```

Build command (from `frontend/` or root):

```bash
npm run build
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity dataset name (e.g., `production`) |
| `NEXT_PUBLIC_SANITY_API_VERSION` | Sanity API version (e.g., `2024-01-01`) |
| `SANITY_API_READ_TOKEN` | Sanity API read token for server-side fetching |
| `RESEND_API_KEY` | Resend API key for email sending |
| `RESEND_CONTACT_TO_EMAIL` | Destination email for contact form submissions |
| `RESEND_FROM_EMAIL` | Sender email address for Resend emails |
| `RESEND_AUDIENCE_ID` | Resend audience ID for newsletter subscriptions |
| `MOTION_DEV_TOKEN` | Motion developer token (for `setup-motion.mjs` preinstall hook) |

### Do Not Configure

The following are **legacy Strapi / backend variables** and must not be set:

- `NEXT_PUBLIC_STRAPI_URL`
- `STRAPI_API_TOKEN`
- Any Railway backend deployment settings
- Any `backend/` deployment pipeline

The `backend/` directory is an inert archive. See `backend/ARCHIVE.md` for historical context.

## Verification Steps

Before deploying, run these checks from the `frontend/` directory:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

After deployment, smoke test:
- Public pages load correctly
- `/studio` (Sanity Studio) is accessible if deployed
- Contact form and newsletter sign-up submit without errors

## External Cleanup

For guidance on removing legacy external platform resources (S3, Supabase, etc.), see:

[`docs/sanity-cutover/EXTERNAL_PLATFORM_CLEANUP.md`](docs/sanity-cutover/EXTERNAL_PLATFORM_CLEANUP.md)
