# Danny's Fish and Chips

A modern web application for Danny's Fish and Chips restaurant, built with Next.js and Sanity Content Lake.

> **Backend Decommission Complete**
>
> The Strapi backend in `backend/` has been decommissioned and is preserved as an inert, read-only archive.
> It is not built, run, or deployed. All CMS operations use Sanity Content Lake.
> - **Archive details:** See [`backend/ARCHIVE.md`](./backend/ARCHIVE.md)
> - **Historical cleanup context:** See [`docs/sanity-cutover/STRAPI_DECOMMISSION.md`](./docs/sanity-cutover/STRAPI_DECOMMISSION.md)

## Tech Stack

**Frontend:**
- [Next.js 16](https://nextjs.org/) - React framework with server components
- [React 18](https://react.dev/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives

**Backend / CMS:**
- [Sanity Content Lake](https://www.sanity.io/) - Active headless CMS (embedded Studio at `/studio`)

**DevOps:**
- [Vercel](https://vercel.com/) - Frontend deployment
- [GitHub Actions](https://github.com/features/actions) - CI/CD pipeline

## Features

- Server-side rendered pages with Next.js
- Dynamic content management with Sanity CMS (embedded Studio)
- Responsive design with Tailwind CSS
- Type-safe development with TypeScript
- Automated testing and builds via CI/CD
- Easy deployment to Vercel

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js 20+](https://nodejs.org/) and npm (engines `>=20 <=24`)
- [Git](https://git-scm.com/)

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd dannys-fish-and-chips
```

### 2. Install Dependencies

```bash
cd frontend && npm install
```

Or from the root (root scripts map to the frontend):

```bash
npm run install:all
```

### 3. Environment Setup

Create `frontend/.env.local`:

```env
# Sanity (active CMS)
NEXT_PUBLIC_SANITY_PROJECT_ID=jz52wuvq
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-06-01
SANITY_API_READ_TOKEN=your-sanity-read-token
```

### 4. Run Development Server

```bash
cd frontend && npm run dev
```

Or from the root:

```bash
npm run dev
```

The frontend will be available at http://localhost:3000.

### 5. Access the Applications

- **Frontend**: http://localhost:3000
- **Sanity Studio (embedded)**: http://localhost:3000/studio

## Project Structure

```
dannys-fish-and-chips/
├── backend/                 # Inert Strapi archive (see ARCHIVE.md)
│   └── ARCHIVE.md          # Archive status and purpose
│
├── frontend/               # Next.js application
│   ├── src/               # Source code
│   │   ├── app/          # App router pages
│   │   ├── components/   # React components
│   │   ├── data/         # Sanity API client and data loaders
│   │   ├── lib/          # Utilities and helpers
│   │   └── types/        # TypeScript type definitions
│   ├── public/           # Static assets
│   └── package.json      # Frontend dependencies
│
├── .github/              # GitHub configuration
│   └── workflows/       # CI/CD workflows
│
├── .gitignore                   # Git ignore rules
├── package.json                 # Root scripts (frontend-only)
└── README.md                    # This file
```

## Available Scripts

### Root Level
- `npm run dev` - Run frontend in development mode
- `npm run dev:frontend` - Run frontend in development mode
- `npm run install:all` - Install frontend dependencies
- `npm run build` - Build frontend for production

### Frontend (`cd frontend`)
- `npm run dev` - Start Next.js development server
- `npm run build` - Build Next.js for production
- `npm run start` - Start Next.js production server
- `npm run lint` - Run ESLint
- `npm run test:e2e` - Run Playwright tests
- `npm run test:e2e:ui` - Run Playwright tests in UI mode
- `npx tsc --noEmit` - Run TypeScript type check

## Environment Variables

### Frontend

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID | Yes | `jz52wuvq` |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity dataset | Yes | `production` |
| `NEXT_PUBLIC_SANITY_API_VERSION` | Sanity API version | No | `2024-06-01` |
| `SANITY_API_READ_TOKEN` | Sanity API read token | Yes | - |

**Production form handling (server-only — do NOT prefix with `NEXT_PUBLIC_`)**

| Variable | Description | Required |
|----------|-------------|----------|
| `RESEND_API_KEY` | Resend API key for contact/subscribe forms | **Yes** on Vercel production |
| `RESEND_CONTACT_TO_EMAIL` | Contact form recipient email | **Yes** on Vercel production |
| `RESEND_FROM_EMAIL` | Contact form sender email | **Yes** on Vercel production |
| `RESEND_AUDIENCE_ID` | Resend audience ID for newsletter subscriptions | **Yes** on Vercel production |

> **Note:** These are server-only variables used by API routes. Previews and local development without these variables will dry-run forms silently (returning success without sending email). Production deployments on Vercel (`VERCEL_ENV=production`) require these to be set; missing values will return HTTP 500.

## Development Workflow

1. **Create a new feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Sanity CMS: Edit content and schemas via the embedded Studio at `/studio`
   - Frontend: Update pages, components, or styles in `frontend/src/`

3. **Test your changes**
   ```bash
   cd frontend && npm run dev
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

5. **Push and create a pull request**
   ```bash
   git push origin feature/your-feature-name
   ```

## AI Subagents

Shortcuts to specialized help when working with Cursor:
- `frontend-engineer` - Next.js UI and component work
- `api-contract-types` - Typed API contracts and runtime validation
- `qa-test-engineer` - Test plans and Playwright coverage
- `performance-observability` - Caching, performance, monitoring guidance
- `security-auth` - Auth, tokens, CORS, and public endpoint review
- `devops-deploy` - Vercel deploy and environment setup
- `content-seo-specialist` - SEO, metadata, and content workflows
- `tech-lead` - Architecture decisions and implementation plans

## Deployment

This project uses a modern CI/CD pipeline with automated deployments.

### Quick Overview

- **Frontend**: Deployed to Vercel automatically on push to main
- **Active CMS**: Sanity Content Lake (hosted by Sanity; no self-hosted backend required)
- **Legacy backend**: `backend/` is an inert archive. Historical rollback or cleanup details are in [`docs/sanity-cutover/STRAPI_DECOMMISSION.md`](./docs/sanity-cutover/STRAPI_DECOMMISSION.md)
- **Environments**: Vercel Preview + Production
- **Database Migrations**: Not applicable for Sanity

### Deployment Assumptions (Infrastructure)

- **Environment variables**: Managed in platform settings (Vercel), never committed.
- **Vercel project root**: `frontend/` with `npm run build` and `npm run start` for production.
- **Preview flow**: Vercel Preview deploys on PRs; GitHub Action `e2e-preview.yml` runs Playwright against the preview URL.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Troubleshooting

### Port already in use

If you get port conflicts on the frontend development server:
```bash
# Check what's using the port
lsof -i :3000

# Kill the process or change ports in your environment variables
```

### Sanity API issues

- Verify your Sanity project ID, dataset, and API read token in `frontend/.env.local`
- Check the [Sanity documentation](https://www.sanity.io/docs) for schema and API help

## License

This project is private and proprietary.

## Support

For issues or questions:
- Review [`docs/sanity-cutover/STRAPI_DECOMMISSION.md`](./docs/sanity-cutover/STRAPI_DECOMMISSION.md) for historical Strapi decommission context
- Check the [Sanity documentation](https://www.sanity.io/docs)
- Check the [Next.js documentation](https://nextjs.org/docs)
