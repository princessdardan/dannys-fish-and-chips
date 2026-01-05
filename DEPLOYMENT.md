# Deployment Guide

This guide covers deploying Danny's Fish and Chips to a VPS using Docker Compose.

## Table of Contents

- [Prerequisites](#prerequisites)
- [VPS Setup](#vps-setup)
- [Deployment with Docker Compose](#deployment-with-docker-compose)
- [Manual Deployment with PM2](#manual-deployment-with-pm2)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [SSL/HTTPS Configuration](#ssl-https-configuration)
- [Monitoring and Logs](#monitoring-and-logs)
- [Backup and Restore](#backup-and-restore)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### VPS Requirements

- **Operating System**: Ubuntu 20.04+ or Debian 11+
- **RAM**: Minimum 2GB (4GB recommended)
- **Storage**: Minimum 20GB
- **CPU**: 2+ cores recommended

### Domain Setup

- A domain name pointed to your VPS IP address
- A records configured:
  - `@` or `yourdomain.com` → VPS IP
  - `www` → VPS IP (optional)

### Software Required

- Docker and Docker Compose
- Git
- Nginx (for reverse proxy)
- Certbot (for SSL certificates)

## VPS Setup

### 1. Initial Server Setup

SSH into your VPS:
```bash
ssh root@your-server-ip
```

Update system packages:
```bash
apt update && apt upgrade -y
```

### 2. Create Non-Root User

```bash
adduser deploy
usermod -aG sudo deploy
su - deploy
```

### 3. Install Docker

```bash
# Install dependencies
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### 4. Install Docker Compose

```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

### 5. Install Git

```bash
sudo apt install -y git
```

### 6. Configure Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

## Deployment with Docker Compose

### 1. Clone Repository

```bash
cd /home/deploy
git clone https://github.com/YOUR_USERNAME/dannys-fish-and-chips.git
cd dannys-fish-and-chips
```

### 2. Configure Environment Variables

**Backend Environment (.env)**

Create `backend/.env`:
```bash
nano backend/.env
```

Add the following configuration:
```env
# Server
HOST=0.0.0.0
PORT=1337

# Secrets (IMPORTANT: Generate secure values!)
APP_KEYS=your-generated-app-key-1,your-generated-app-key-2
API_TOKEN_SALT=your-generated-api-token-salt
ADMIN_JWT_SECRET=your-generated-admin-jwt-secret
TRANSFER_TOKEN_SALT=your-generated-transfer-token-salt
JWT_SECRET=your-generated-jwt-secret
ENCRYPTION_KEY=your-generated-encryption-key

# Database
DATABASE_CLIENT=postgres
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=dannys_db
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=your-secure-database-password
DATABASE_SSL=false

# Node environment
NODE_ENV=production
```

**Generate secure secrets:**
```bash
# Generate random strings for secrets
openssl rand -base64 32  # Run this multiple times for different secrets
```

**Root Environment (.env for docker-compose.prod.yml)**

Create `.env` in the project root:
```bash
nano .env
```

Add:
```env
# Database credentials
DATABASE_NAME=dannys_db
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=your-secure-database-password

# Frontend URL
NEXT_PUBLIC_STRAPI_URL=https://api.yourdomain.com
```

### 3. Install Backend Dependencies (for pg package)

```bash
cd backend
npm install
cd ..
```

### 4. Build and Start Services

```bash
# Build and start in detached mode
npm run docker:prod:build

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
npm run docker:logs:prod
```

### 5. Create Strapi Admin User

Visit `http://your-server-ip:1337/admin` and create your admin account.

### 6. Configure Nginx Reverse Proxy

Install Nginx:
```bash
sudo apt install -y nginx
```

Create Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/dannys-fish-and-chips
```

Add configuration:
```nginx
# Frontend (main domain)
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend/API (subdomain)
server {
    listen 80;
    server_name api.yourdomain.com;

    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:1337;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/dannys-fish-and-chips /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. Test Deployment

- Frontend: `http://yourdomain.com`
- Backend API: `http://api.yourdomain.com`
- Strapi Admin: `http://api.yourdomain.com/admin`

## Manual Deployment with PM2

If you prefer not to use Docker:

### 1. Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### 2. Install PM2

```bash
sudo npm install -g pm2
```

### 3. Install PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo -u postgres createuser strapi
sudo -u postgres createdb dannys_db
sudo -u postgres psql
```

In PostgreSQL:
```sql
ALTER USER strapi WITH ENCRYPTED PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE dannys_db TO strapi;
\q
```

### 4. Build Applications

```bash
# Install all dependencies
npm run install:all

# Build applications
npm run build:all
```

### 5. Create PM2 Ecosystem File

Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: 'dannys-backend',
      cwd: './backend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'dannys-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
```

### 6. Start with PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Environment Variables

### Backend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `HOST` | Server host | `0.0.0.0` |
| `PORT` | Server port | `1337` |
| `APP_KEYS` | Encryption keys (comma-separated) | Generated string |
| `API_TOKEN_SALT` | Salt for API tokens | Generated string |
| `ADMIN_JWT_SECRET` | Admin JWT secret | Generated string |
| `TRANSFER_TOKEN_SALT` | Transfer token salt | Generated string |
| `JWT_SECRET` | General JWT secret | Generated string |
| `ENCRYPTION_KEY` | Encryption key | Generated string |
| `DATABASE_CLIENT` | Database type | `postgres` |
| `DATABASE_HOST` | PostgreSQL host | `postgres` (Docker) or `localhost` |
| `DATABASE_PORT` | PostgreSQL port | `5432` |
| `DATABASE_NAME` | Database name | `dannys_db` |
| `DATABASE_USERNAME` | Database user | `strapi` |
| `DATABASE_PASSWORD` | Database password | Secure password |
| `NODE_ENV` | Environment | `production` |

### Frontend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_STRAPI_URL` | Strapi API URL | `https://api.yourdomain.com` |

## Database Setup

### PostgreSQL Configuration

#### Connection Pooling

Adjust in `backend/config/database.ts`:
```typescript
pool: {
  min: env.int('DATABASE_POOL_MIN', 2),
  max: env.int('DATABASE_POOL_MAX', 10)
}
```

#### Backup Database

```bash
# Using Docker
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U strapi dannys_db > backup.sql

# Manual PostgreSQL
pg_dump -U strapi dannys_db > backup.sql
```

#### Restore Database

```bash
# Using Docker
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U strapi dannys_db < backup.sql

# Manual PostgreSQL
psql -U strapi dannys_db < backup.sql
```

## SSL/HTTPS Configuration

### Using Certbot (Let's Encrypt)

Install Certbot:
```bash
sudo apt install -y certbot python3-certbot-nginx
```

Obtain SSL certificates:
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

The certificates will auto-renew. Test renewal:
```bash
sudo certbot renew --dry-run
```

### Update Environment Variables

Update `NEXT_PUBLIC_STRAPI_URL` in `.env`:
```env
NEXT_PUBLIC_STRAPI_URL=https://api.yourdomain.com
```

Rebuild frontend:
```bash
docker-compose -f docker-compose.prod.yml up -d --build frontend
```

## Monitoring and Logs

### Docker Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f postgres

# Last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100 backend
```

### Container Status

```bash
docker-compose -f docker-compose.prod.yml ps
docker stats
```

### PM2 Monitoring

```bash
pm2 status
pm2 logs
pm2 monit
```

### Nginx Logs

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Backup and Restore

### Complete Backup Script

Create `backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/home/deploy/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U strapi dannys_db > $BACKUP_DIR/db_$DATE.sql

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz -C backend/public uploads

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

Make executable and add to cron:
```bash
chmod +x backup.sh
crontab -e
# Add: 0 2 * * * /home/deploy/dannys-fish-and-chips/backup.sh
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs backend

# Check container status
docker ps -a

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker-compose -f docker-compose.prod.yml ps postgres

# Test connection
docker-compose -f docker-compose.prod.yml exec postgres psql -U strapi -d dannys_db

# Check credentials in backend/.env
```

### Port Already in Use

```bash
# Find process using port
sudo lsof -i :3000
sudo lsof -i :1337

# Kill process or change port in docker-compose
```

### Out of Memory

```bash
# Check memory usage
free -h
docker stats

# Increase swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Frontend Can't Connect to Backend

1. Check `NEXT_PUBLIC_STRAPI_URL` in frontend environment
2. Verify CORS settings in Strapi
3. Check network connectivity between containers
4. Verify Nginx configuration

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew manually
sudo certbot renew

# Check Nginx config
sudo nginx -t
```

### Strapi Admin Access Issues

1. Clear browser cache and cookies
2. Check `ADMIN_JWT_SECRET` hasn't changed
3. Reset admin password via Strapi CLI:
   ```bash
   docker-compose -f docker-compose.prod.yml exec backend npm run strapi admin:reset-user-password
   ```

## Performance Optimization

### Enable Gzip in Nginx

Add to Nginx config:
```nginx
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;
```

### Docker Resource Limits

Already configured in `docker-compose.prod.yml`. Adjust as needed:
```yaml
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 1G
```

### Database Optimization

For production PostgreSQL, consider:
- Increasing connection pool size
- Enabling query caching
- Regular VACUUM operations

## Updating the Application

### Pull Latest Changes

```bash
cd /home/deploy/dannys-fish-and-chips
git pull origin main
```

### Rebuild and Restart

```bash
npm run docker:prod:build
```

### Database Migrations

If schema changed:
```bash
docker-compose -f docker-compose.prod.yml exec backend npm run strapi db:migrate
```

## Support Resources

- [Strapi Documentation](https://docs.strapi.io)
- [Next.js Documentation](https://nextjs.org/docs)
- [Docker Documentation](https://docs.docker.com)
- [Nginx Documentation](https://nginx.org/en/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)

## Security Best Practices

1. **Use strong passwords** for database and admin accounts
2. **Keep software updated** - regularly update packages and Docker images
3. **Enable firewall** - only open necessary ports
4. **Use HTTPS** - always use SSL certificates in production
5. **Backup regularly** - automate database and file backups
6. **Monitor logs** - set up log monitoring and alerts
7. **Limit access** - use SSH keys instead of passwords
8. **Update secrets** - rotate encryption keys periodically
