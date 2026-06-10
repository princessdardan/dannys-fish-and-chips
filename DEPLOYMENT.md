# Deployment Guide - Vercel

> **Legacy Guidance — Retained for Rollback / Reference Only**
>
> This document describes the original Strapi-era deployment path. For the current Sanity production cutover and deployment procedure, follow [docs/sanity-cutover/CUTOVER_CHECKLIST.md](./docs/sanity-cutover/CUTOVER_CHECKLIST.md) instead. Keep this file available only as a rollback reference if the project ever needs to revert to the Strapi stack.

This guide covers deploying Danny's Fish and Chips to Vercel.

## Prerequisites

- A GitHub account with this repository
- A Vercel account (sign up at [vercel.com](https://vercel.com))
- A PostgreSQL database (we recommend [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app))

## Architecture

This project consists of two parts:
- **Frontend**: Next.js application (deployed to Vercel)
- **Backend**: Strapi CMS (deployed to Vercel or another Node.js hosting service)

## Option 1: Deploy Frontend to Vercel

### Step 1: Import Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel will auto-detect the Next.js frontend

### Step 2: Configure Project

- **Framework Preset**: Next.js
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### Step 3: Environment Variables

Add the following environment variable:

| Key | Value | Description |
|-----|-------|-------------|
| `NEXT_PUBLIC_STRAPI_URL` | Your Strapi backend URL | API endpoint (e.g., `https://your-strapi-backend.vercel.app`) |

### Step 4: Deploy

Click "Deploy" and Vercel will build and deploy your frontend.

## Option 2: Deploy Backend (Strapi) to Vercel

Vercel supports Node.js applications, so you can deploy Strapi there as well.

### Step 1: Create New Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the same GitHub repository
3. Create a separate project for the backend

### Step 2: Configure Project

- **Framework Preset**: Other
- **Root Directory**: `backend`
- **Build Command**: `npm run build`
- **Output Directory**: Leave empty
- **Install Command**: `npm install`

### Step 3: Environment Variables

Add all required Strapi environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `HOST` | Server host | `0.0.0.0` |
| `PORT` | Server port | `1337` |
| `APP_KEYS` | Encryption keys (comma-separated) | Generate with `openssl rand -base64 32` |
| `API_TOKEN_SALT` | Salt for API tokens | Generate with `openssl rand -base64 32` |
| `ADMIN_JWT_SECRET` | Admin JWT secret | Generate with `openssl rand -base64 32` |
| `TRANSFER_TOKEN_SALT` | Transfer token salt | Generate with `openssl rand -base64 32` |
| `JWT_SECRET` | General JWT secret | Generate with `openssl rand -base64 32` |
| `ENCRYPTION_KEY` | Encryption key | Generate with `openssl rand -base64 32` |
| `DATABASE_CLIENT` | Database type | `postgres` |
| `DATABASE_HOST` | PostgreSQL host | From your database provider |
| `DATABASE_PORT` | PostgreSQL port | `5432` |
| `DATABASE_NAME` | Database name | `dannys_db` |
| `DATABASE_USERNAME` | Database user | From your database provider |
| `DATABASE_PASSWORD` | Database password | From your database provider |
| `DATABASE_SSL` | Use SSL for database | `true` |
| `NODE_ENV` | Environment | `production` |

### Step 4: Deploy

Click "Deploy". Vercel will build and deploy your Strapi backend.

### Step 5: Update Frontend Environment

After backend deployment, update your frontend's `NEXT_PUBLIC_STRAPI_URL` environment variable with the backend URL.

## Database Setup

### Recommended: Neon (Serverless PostgreSQL)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Parse it to get the following values:
   - `DATABASE_HOST`
   - `DATABASE_PORT`
   - `DATABASE_NAME`
   - `DATABASE_USERNAME`
   - `DATABASE_PASSWORD`
5. Add these to your Vercel environment variables

### Alternative: Supabase

1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection details
5. Add to Vercel environment variables

### Alternative: Railway

1. Sign up at [railway.app](https://railway.app)
2. Create a new PostgreSQL database
3. Copy the connection details
4. Add to Vercel environment variables

## Continuous Deployment

Vercel automatically deploys when you push to your GitHub repository:

- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and other branches

GitHub Actions will run CI checks (linting, type checking, builds) before Vercel deploys.

## Custom Domain

### Configure Custom Domain on Vercel

1. Go to your project settings on Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow Vercel's DNS configuration instructions

## Environment Variables Best Practices

1. **Never commit secrets** to your repository
2. **Use different values** for production and development
3. **Rotate secrets periodically** for security
4. **Generate strong secrets** using:
   ```bash
   openssl rand -base64 32
   ```

## Monitoring

Vercel provides built-in monitoring:
- View logs in the Vercel dashboard
- Real-time function logs
- Analytics for performance metrics

## Troubleshooting

### Build Fails

1. Check build logs in Vercel dashboard
2. Ensure all environment variables are set
3. Verify Node.js version compatibility

### Backend Can't Connect to Database

1. Verify database credentials
2. Check database SSL settings
3. Ensure database accepts connections from Vercel IPs

### Frontend Can't Connect to Backend

1. Verify `NEXT_PUBLIC_STRAPI_URL` is correct
2. Check CORS settings in Strapi
3. Ensure backend is deployed and running

## Alternative: Deploy Backend Elsewhere

If you prefer not to deploy Strapi to Vercel, consider these alternatives:

- **Railway**: [railway.app](https://railway.app) - Easy deployment with PostgreSQL
- **Render**: [render.com](https://render.com) - Free tier available
- **Heroku**: [heroku.com](https://heroku.com) - Established platform
- **DigitalOcean App Platform**: Simple PaaS solution

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Strapi Deployment](https://docs.strapi.io/dev-docs/deployment)
