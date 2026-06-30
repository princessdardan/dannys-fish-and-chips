# Danny's Fish & Chips Website

A modern restaurant website and CMS platform for Danny's Fish & Chips, a family-owned Barrie, Ontario staple serving fish and chips since 1975.

This project replaces a legacy Strapi-backed implementation with a faster, easier-to-maintain Next.js frontend powered by Sanity Content Lake. The result is a responsive marketing and operations site where restaurant staff can manage menus, specials, announcements, gallery content, hours, location details, and page copy without developer intervention.

## Project Snapshot

| Area | Details |
| ------ | --------- |
| Client | Danny's Fish & Chips |
| Industry | Restaurant / Hospitality |
| Type | Responsive website, CMS migration, content platform |
| Frontend | Next.js 16, React 18, TypeScript, Tailwind CSS 4 |
| CMS | Sanity Content Lake with embedded Studio |
| Deployment | Vercel |
| Integrations | Resend for contact and newsletter workflows |

## What This Project Delivers

- A branded restaurant website with pages for home, menu, specials, gallery, about, contact, hours, and location.
- A CMS-driven content model that lets non-technical staff update high-value site content.
- A newspaper-inspired visual system that gives the site a memorable local-restaurant identity.
- Server-rendered pages with structured data, metadata, and sitemap support for search visibility.
- Contact and mailing list workflows backed by server-side validation and email delivery.
- A cleaner deployment model with the old Strapi backend fully decommissioned and archived.

## Business Goals

The project was built around practical restaurant needs:

- Make the menu and specials easy to update.
- Improve the site's mobile experience for customers checking hours, location, and menu items.
- Reduce infrastructure overhead by removing the self-hosted backend.
- Preserve the character of an established local brand while modernizing the web experience.
- Create a maintainable foundation for future content, SEO, and marketing updates.

## My Role

I handled the frontend implementation, CMS integration, deployment structure, and migration away from the legacy backend. The work included:

- Building the Next.js application architecture.
- Creating reusable page sections and CMS-driven layout rendering.
- Integrating Sanity data loading through typed API boundaries.
- Implementing responsive navigation, page templates, menu layouts, forms, and fallback states.
- Connecting contact and subscription flows through Resend.
- Establishing linting, type checks, build scripts, and Playwright E2E coverage.
- Archiving the old Strapi backend so the active app has a clear operational boundary.

## Technical Highlights

### CMS-Driven Pages

Page content is managed in Sanity and rendered through a reusable dynamic block system. This allows the restaurant to update sections such as hero content, menu groups, specials, image galleries, info panels, and announcements without hardcoding page content.

### Restaurant-Focused UX

The site prioritizes the information customers usually need quickly:

- Menu access
- Current specials
- Hours and location
- Contact form
- Mobile navigation
- Gallery and brand storytelling

The visual design leans into a print-inspired restaurant identity, with editorial menu sections, strong borders, and warm branded colors.

### Strong Frontend Boundaries

Sanity data access is centralized through the data API and loader layer, keeping components focused on rendering. External CMS and environment data are validated at application boundaries to reduce runtime surprises.

### Production-Oriented Infrastructure

The frontend is deployable on Vercel with preview and production environments. The project no longer depends on a local or hosted Strapi service; Sanity is the active content backend.

## Feature Set

- Responsive App Router frontend
- Embedded Sanity Studio at `/studio`
- CMS-managed navigation, footer, pages, menu, deals, gallery, and announcements
- Contact form with validation and Resend delivery
- Newsletter signup workflow
- SEO metadata, Open Graph metadata, sitemap, and JSON-LD menu schema
- Accessible UI primitives via Radix UI
- TypeScript-first implementation
- Playwright E2E test support
- Vercel Analytics integration

## Technology

| Category | Stack |
|----------|-------|
| Framework | Next.js 16 |
| UI | React 18, Tailwind CSS 4, Radix UI, lucide-react |
| Language | TypeScript |
| CMS | Sanity, next-sanity, Portable Text |
| Validation | Zod |
| Email | Resend |
| Testing | ESLint, TypeScript, Playwright |
| Hosting | Vercel |
