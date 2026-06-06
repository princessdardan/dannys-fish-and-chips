# Danny's Fish and Chips

A modern full-stack web application for Danny's Fish and Chips restaurant, built with Next.js and Sanity Content Lake.

> **✅ Frontend CMS migrated to Sanity**
>
> This project uses [Sanity Content Lake](https://www.sanity.io) with an embedded Studio as its active CMS.
> The Strapi 5 backend in `backend/` is retained as legacy/rollback-only infrastructure until formally decommissioned.
> - **Cutover docs:** See [`docs/sanity-cutover/CUTOVER_CHECKLIST.md`](./docs/sanity-cutover/CUTOVER_CHECKLIST.md)
> - **Rollback plan:** See [`docs/sanity-cutover/ROLLBACK_PROCEDURE.md`](./docs/sanity-cutover/ROLLBACK_PROCEDURE.md)
> - **Backend (`backend/`):** Rollback-only — not required for Sanity frontend operation except during rollback, final sync, or decommission checks

## Tech Stack

**Frontend:**
- [Next.js 16](https://nextjs.org/) - React framework with server components
- [React 18](https://react.dev/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives

**Backend / CMS:**
- [Sanity Content Lake](https://www.sanity.io/) - Active headless CMS (embedded Studio at `/studio`)
- [Strapi 5](https://strapi.io/) - **Legacy rollback-only** until formally decommissioned
- [PostgreSQL](https://www.postgresql.org/) - Strapi production database (legacy)
- [SQLite](https://www.sqlite.org/) - Strapi development database (legacy)

**DevOps:**
- [Vercel](https://vercel.com/) - Frontend deployment
- [Railway](https://railway.app/) - Legacy backend deployment (rollback, final sync, decommission)
- [GitHub Actions](https://github.com/features/actions) - CI/CD pipeline

## Features

- Server-side rendered pages with Next.js
- Dynamic content management with Sanity CMS (embedded Studio)
- Responsive design with Tailwind CSS
- Type-safe development with TypeScript
- RESTful API communication
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
npm run install:all
```

This will install dependencies for the root, backend, and frontend.

### 3. Environment Setup

**Frontend Environment Variables (Sanity — active CMS):**

Create `frontend/.env.local`:
```env
# Sanity (active CMS)
NEXT_PUBLIC_SANITY_PROJECT_ID=jz52wuvq
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-06-01
SANITY_API_READ_TOKEN=your-sanity-read-token

# Strapi (legacy rollback-only)
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
```

**Backend Environment Variables (Strapi — legacy/rollback-only):**

Copy the example environment file:
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and update the following:
```env
HOST=0.0.0.0
PORT=1337
APP_KEYS="your-app-keys-here"
API_TOKEN_SALT=your-api-token-salt
ADMIN_JWT_SECRET=your-admin-jwt-secret
TRANSFER_TOKEN_SALT=your-transfer-token-salt
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key

# Database (development uses SQLite by default)
DATABASE_CLIENT=sqlite
```

### 4. Run Development Servers

```bash
npm run dev
```

This runs both frontend and backend concurrently:
- Frontend: http://localhost:3000
- Backend/Strapi Admin: http://localhost:1337/admin

### 5. Access the Applications

- **Frontend**: http://localhost:3000
- **Sanity Studio (embedded)**: http://localhost:3000/studio
- **Strapi Admin Panel** (legacy/rollback-only): http://localhost:1337/admin
- **Strapi API** (legacy/rollback-only): http://localhost:1337/api

On first run for legacy Strapi, you'll need to create an admin user by visiting the admin panel.

## Project Structure

```
dannys-fish-and-chips/
├── backend/                 # Strapi CMS
│   ├── config/             # Strapi configuration
│   ├── src/                # API routes, content types, controllers
│   │   ├── api/           # API endpoints
│   │   └── components/    # Reusable components
│   ├── public/            # Static files and uploads
│   ├── .env.example       # Environment template
│   └── package.json       # Backend dependencies
│
├── frontend/               # Next.js application
│   ├── src/               # Source code
│   │   ├── app/          # App router pages
│   │   ├── components/   # React components
│   │   ├── lib/          # Utilities and helpers
│   │   └── types/        # TypeScript type definitions
│   ├── public/           # Static assets
│   └── package.json      # Frontend dependencies
│
├── .github/              # GitHub configuration
│   └── workflows/       # CI/CD workflows
│
├── .gitignore                   # Git ignore rules
├── package.json                 # Root scripts
├── README.md                    # This file
└── DEPLOYMENT.md                # Deployment guide
```

## Available Scripts

### Root Level
- `npm run dev` - Run both frontend and backend in development mode
- `npm run dev:backend` - Run only backend
- `npm run dev:frontend` - Run only frontend
- `npm run install:all` - Install all dependencies
- `npm run build:all` - Build both applications

### Backend (`cd backend`)
- `npm run dev` - Start Strapi in development mode
- `npm run build` - Build Strapi admin panel
- `npm run start` - Start Strapi in production mode
- `npm run strapi` - Run Strapi CLI commands

### Frontend (`cd frontend`)
- `npm run dev` - Start Next.js development server
- `npm run build` - Build Next.js for production
- `npm run start` - Start Next.js production server
- `npm run lint` - Run ESLint

## Environment Variables

### Backend (Strapi — legacy/rollback-only)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `HOST` | Server host | No | `0.0.0.0` |
| `PORT` | Server port | No | `1337` |
| `APP_KEYS` | Application keys for encryption | Yes | - |
| `API_TOKEN_SALT` | Salt for API tokens | Yes | - |
| `ADMIN_JWT_SECRET` | Secret for admin JWT | Yes | - |
| `TRANSFER_TOKEN_SALT` | Salt for transfer tokens | Yes | - |
| `JWT_SECRET` | General JWT secret | Yes | - |
| `ENCRYPTION_KEY` | Encryption key | Yes | - |
| `DATABASE_CLIENT` | Database type (`sqlite` or `postgres`) | No | `sqlite` |
| `DATABASE_HOST` | PostgreSQL host | Only for PostgreSQL | - |
| `DATABASE_PORT` | PostgreSQL port | Only for PostgreSQL | `5432` |
| `DATABASE_NAME` | Database name | Only for PostgreSQL | - |
| `DATABASE_USERNAME` | Database user | Only for PostgreSQL | - |
| `DATABASE_PASSWORD` | Database password | Only for PostgreSQL | - |
| `DATABASE_SSL` | Enable SSL | Only for PostgreSQL | `false` |

### Frontend

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID | Yes | `jz52wuvq` |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity dataset | Yes | `production` |
| `NEXT_PUBLIC_SANITY_API_VERSION` | Sanity API version | No | `2024-06-01` |
| `SANITY_API_READ_TOKEN` | Sanity API read token | Yes | - |
| `NEXT_PUBLIC_STRAPI_URL` | Strapi API base URL (legacy/rollback-only) | No | `http://localhost:1337` |

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
   - Backend (legacy/rollback-only): Update content types, controllers, or API routes in `backend/src/`

3. **Test your changes**
   ```bash
   npm run dev
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
- `backend-engineer-strapi` - Strapi schemas, controllers, permissions
- `api-contract-types` - Typed API contracts and runtime validation
- `qa-test-engineer` - Test plans and Playwright coverage
- `performance-observability` - Caching, performance, monitoring guidance
- `security-auth` - Auth, tokens, CORS, and public endpoint review
- `devops-deploy` - Vercel/Railway deploy and environment setup
- `content-seo-specialist` - SEO, metadata, and content workflows
- `tech-lead` - Architecture decisions and implementation plans

## Deployment

This project uses a modern CI/CD pipeline with automated deployments.


### Quick Overview

- **Frontend**: Deployed to Vercel automatically on push to main. This branch migrates the code and data path to Sanity; production cutover to Sanity as the active CMS is an operator-executed checklist step documented in [`docs/sanity-cutover/CUTOVER_CHECKLIST.md`](./docs/sanity-cutover/CUTOVER_CHECKLIST.md)
- **Active CMS**: Sanity Content Lake (hosted by Sanity; no Railway infrastructure required)
- **Legacy backend**: Strapi on Railway is retained for rollback, final sync, and decommission procedures only
- **Environments**: Vercel Preview + Production
- **Database Migrations**: Not applicable for Sanity; Strapi applies schema updates on startup if running

### Deployment Assumptions (Infrastructure)

- **Environment variables**: Managed in platform settings (Vercel), never committed.
- **Vercel project root**: `frontend/` with `npm run build` and `npm run start` for production.
- **Legacy Railway service** (rollback-only): Repository root with `railway.json` build/start commands:
  - Build: `cd backend && npm ci && npm run build`
  - Start: `cd backend && npm run start`
- **Alternate Railway root**: `backend/railway.json` supports Railway services rooted at `backend/`.
- **Health checks**: Railway hits `/_health` on the backend service (legacy).
- **Rollback**: Vercel dashboard allows redeploying a previous build; Strapi on Railway enables rollback to pre-Sanity state.
- **Preview flow**: Vercel Preview deploys on PRs; GitHub Action `e2e-preview.yml` runs Playwright against the preview URL.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Troubleshooting

### Port already in use

If you get port conflicts:
```bash
# Check what's using the port
lsof -i :3000  # or :1337

# Kill the process or change ports in your environment variables
```

### Database connection issues

- Verify database credentials in `.env`
- For development, SQLite is used by default (no setup required)
- For production with PostgreSQL, ensure your database service is running and accessible

## License

This project is private and proprietary.

## Support

For issues or questions:
- Review [docs/sanity-cutover/CUTOVER_CHECKLIST.md](./docs/sanity-cutover/CUTOVER_CHECKLIST.md) for deployment and production cutover help
- Check the [Sanity documentation](https://www.sanity.io/docs)
- Check the [Next.js documentation](https://nextjs.org/docs)
- For legacy Strapi issues: Check the [Strapi documentation](https://docs.strapi.io) (rollback-only)
