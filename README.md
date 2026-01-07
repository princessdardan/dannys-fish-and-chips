# Danny's Fish and Chips

A modern full-stack web application for Danny's Fish and Chips restaurant, built with Next.js and Strapi CMS.

## Tech Stack

**Frontend:**
- [Next.js 16](https://nextjs.org/) - React framework with server components
- [React 18](https://react.dev/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives

**Backend:**
- [Strapi 5](https://strapi.io/) - Headless CMS
- [PostgreSQL](https://www.postgresql.org/) - Production database
- [SQLite](https://www.sqlite.org/) - Development database

**DevOps:**
- [Vercel](https://vercel.com/) - Deployment platform
- [GitHub Actions](https://github.com/features/actions) - CI/CD pipeline

## Features

- Server-side rendered pages with Next.js
- Dynamic content management with Strapi CMS
- Responsive design with Tailwind CSS
- Type-safe development with TypeScript
- RESTful API communication
- Automated testing and builds via CI/CD
- Easy deployment to Vercel

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js 18+](https://nodejs.org/) and npm
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

**Backend Environment Variables:**

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

**Frontend Environment Variables:**

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
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
- **Strapi Admin Panel**: http://localhost:1337/admin
- **Strapi API**: http://localhost:1337/api

On first run, you'll need to create an admin user for Strapi by visiting the admin panel.

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

### Backend

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
| `NEXT_PUBLIC_STRAPI_URL` | Strapi API base URL | Yes | `http://localhost:1337` |

## Development Workflow

1. **Create a new feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Backend: Update content types, controllers, or API routes in `backend/src/`
   - Frontend: Update pages, components, or styles in `frontend/src/`

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

## Deployment

For production deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

This project is designed to be deployed to Vercel for both frontend and backend, with a managed PostgreSQL database (Neon, Supabase, or Railway recommended).

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
- Check the [Strapi documentation](https://docs.strapi.io)
- Check the [Next.js documentation](https://nextjs.org/docs)
- Review [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment help
