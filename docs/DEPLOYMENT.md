# Somavesh Event Platform — Production Deployment Guide

Target Canonical Domain: `https://somavesh.com/`  
Transactional Mail Domain: `hello@mail.somavesh.com`  
Deployment Environment: Hostinger KVM VPS (Ubuntu 22.04 LTS / Docker Compose / Nginx / Cloudflare)

---

## 1. Production Docker Infrastructure

The platform is orchestrated via `docker-compose.yml`:

```yaml
version: '3.8'

services:
  Somavesh-postgres:
    image: postgres:15-alpine
    container_name: Somavesh-postgres
    restart: always
    environment:
      POSTGRES_DB: ${DB_NAME:-Somavesh_db}
      POSTGRES_USER: ${DB_USER:-Somavesh_user}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-Somavesh_user} -d ${DB_NAME:-Somavesh_db}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - Somavesh-network

  Somavesh-redis:
    image: redis:7-alpine
    container_name: Somavesh-redis
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - Somavesh-network

  Somavesh-backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    container_name: Somavesh-backend
    restart: always
    depends_on:
      Somavesh-postgres:
        condition: service_healthy
      Somavesh-redis:
        condition: service_healthy
    ports:
      - "127.0.0.1:3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - FRONTEND_URL=https://somavesh.com
      - CORS_ORIGIN=https://somavesh.com,https://www.somavesh.com
      - RESEND_FROM_EMAIL=hello@mail.somavesh.com
    networks:
      - Somavesh-network

  Somavesh-frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
    container_name: Somavesh-frontend
    restart: always
    ports:
      - "127.0.0.1:3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - NEXT_PUBLIC_API_URL=https://somavesh.com
    networks:
      - Somavesh-network

networks:
  Somavesh-network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
```

---

## 2. Environment Variables Checklist

Ensure `.env` in root and `backend/.env` contain production secrets:

| Variable | Purpose | Value Example / Requirements |
|----------|---------|------------------------------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Backend Express Port | `3001` |
| `CORS_ORIGIN` | CORS Allowed Origins | `https://somavesh.com,https://www.somavesh.com` |
| `FRONTEND_URL` | Frontend URL | `https://somavesh.com` |
| `DATABASE_URL` | Prisma DB URL | `postgresql://user:pass@Somavesh-postgres:5432/Somavesh_db?sslmode=disable` |
| `JWT_PRIVATE_KEY` | RS256 Private RSA Key | Multi-line 2048-bit RSA Private PEM Key |
| `JWT_PUBLIC_KEY` | RS256 Public RSA Key | Multi-line 2048-bit RSA Public PEM Key |
| `REDIS_HOST` | Redis Service Host | `Somavesh-redis` |
| `REDIS_PASSWORD` | Redis Authentication Pass | High-entropy random string |
| `RESEND_API_KEY` | Resend API Key | `re_...` |
| `RESEND_FROM_EMAIL` | Transactional Sender Email | `Somavesh <hello@mail.somavesh.com>` |
| `R2_ACCOUNT_ID` | Cloudflare Account ID | Cloudflare R2 account ID |
| `R2_ACCESS_KEY_ID` | Cloudflare R2 Access Key | Rotated R2 Access Key |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 Secret Key | Rotated R2 Secret Key |

---

## 3. Host Nginx Setup

1. Copy `nginx.somavesh.conf` to `/etc/nginx/sites-available/somavesh.com`.
2. Symlink to sites-enabled: `ln -s /etc/nginx/sites-available/somavesh.com /etc/nginx/sites-enabled/`.
3. Test Nginx config: `nginx -t`.
4. Reload Nginx: `systemctl reload nginx`.

---

## 4. Disaster Recovery & Database Backups

Run daily automated PostgreSQL dumps on host VPS:
```bash
docker exec -t Somavesh-postgres pg_dump -U Somavesh_user Somavesh_db | gzip > /backups/somavesh_$(date +%Y%m%d_%H%M%S).sql.gz
```
Retention: Keep daily backups for 30 days.
