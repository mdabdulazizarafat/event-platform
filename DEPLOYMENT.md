# Ayojok Platform Production Deployment Guide

This guide provides step-by-step instructions for deploying the **Ayojok Event Platform** on the shared KVM VPS (2 vCPUs, 8 GB RAM) alongside existing applications (like `taphex-platform`) using Docker Compose and Cloudflare.

---

## 1. Architecture Overview

```
                        [ Cloudflare Edge ]
                    (SSL Termination & DNS proxy)
                                 │
                                 ▼ (Port 80 / 443)
                         [ Host Nginx ]
             (Routes traffic for ayojok.rongplan.com)
                                 │
             ┌───────────────────┴───────────────────┐
             ▼ (Port 8080)                           ▼ (Port 8081)
    [ ayojok-frontend ]                     [ ayojok-backend ]
     (Next.js Standalone)                  (Express REST Server)
             │                                       │
             └───────────────┬───────────────────────┘
                             ▼ (Internal Docker Network)
                 [ Postgres & Redis Containers ]
```

- **Isolation**: Every service runs inside a private Docker bridge network (`ayojok-network`).
- **Security**: PostgreSQL and Redis ports are *never* exposed to the host system or the public internet. The Frontend and Backend are bound to loopback IP `127.0.0.1` so they cannot be accessed directly on raw ports.
- **SSL/TLS**: SSL termination is fully managed by Cloudflare at the edge.

---

## 2. Prerequisites on the Host VPS

Ensure the VPS has the following installed:
1. **Docker & Docker Compose**:
   ```bash
   sudo apt update
   sudo apt install docker.io docker-compose-v2 -y
   sudo systemctl enable --now docker
   ```
2. **Nginx**:
   ```bash
   sudo apt install nginx -y
   sudo systemctl enable --now nginx
   ```

---

## 3. Step-by-Step Deployment

### Step A: Configure Cloudflare DNS
1. Log in to your Cloudflare Dashboard.
2. Go to **DNS settings** for `rongplan.com`.
3. Add a new **A Record**:
   - **Name**: `ayojok` (resolving to `ayojok.rongplan.com`)
   - **IPv4 Address**: `187.127.102.17`
   - **Proxy status**: Proxied (Orange cloud enabled)

---

### Step B: Generate Asymmetric RS256 JWT Keys
The backend uses secure asymmetric RS256 keys to sign and verify stateless JWT tokens. Run the following on your local machine or server to generate the PEM keys:
```bash
# Generate private key
openssl genrsa -out private.pem 2048

# Derive public key
openssl rsa -in private.pem -pubout -out public.pem
```
Convert both keys into single-line strings replacing newlines with `\n` to pass them safely in the `.env` file.

---

### Step C: Environment Variables Setup
1. Create a `.env` file at the root of the project on the VPS.
2. Populate the parameters based on `backend/.env.production` and `frontend/.env.production`.
3. Ensure you set strong, unique credentials:
   ```bash
   DB_NAME=ayojok_db
   DB_USER=ayojok_prod_user
   DB_PASSWORD=YOUR_SECURE_PASSWORD
   REDIS_PASSWORD=YOUR_REDIS_PASSWORD
   JWT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."
   JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n..."
   ```

---

### Step D: Build and Start Containers
1. Ensure the Neon database migration script at `database/init/01-init.sql` is present in the workspace.
2. From the root folder containing `docker-compose.yml`, run:
   ```bash
   # Build and run in detached (background) mode
   docker compose up -d --build
   ```
   > [!NOTE]
   > On the first startup, the PostgreSQL container detects an empty volume and automatically executes the SQL initialization script at `database/init/01-init.sql` to recreate the schema and populate it with the migrated Neon database data.

3. Verify all containers are up and running:
   ```bash
   docker compose ps
   ```

---

### Step E: Configure Host Nginx
1. Copy the provided [nginx.ayojok.conf](file:///d:/rong-plan/event-platform/nginx.ayojok.conf) to the Nginx configurations directory on the host VPS:
   ```bash
   sudo cp nginx.ayojok.conf /etc/nginx/sites-available/ayojok.conf
   ```
2. Enable the site configuration:
   ```bash
   sudo ln -s /etc/nginx/sites-available/ayojok.conf /etc/nginx/sites-enabled/
   ```
3. Test Nginx syntax and reload the service:
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

---

## 4. Cloudflare SSL Mode Selection
Under **SSL/TLS** tab in Cloudflare:
- **Flexible Mode**: If Nginx is configured to listen only on Port 80 (HTTP). Cloudflare encrypts traffic between user and Cloudflare, while Cloudflare connects to Nginx over Port 80.
- **Full / Full Strict Mode (Recommended)**: Enable the HTTPS block in [nginx.ayojok.conf](file:///d:/rong-plan/event-platform/nginx.ayojok.conf) and load a free Cloudflare Origin Certificate. Cloudflare will then encrypt traffic all the way to your origin VPS over port 443.

---

## 5. Operations & Logs Runbook

### Monitor Live Logs
```bash
# View all logs
docker compose logs -f

# View backend logs only
docker compose logs -f ayojok-backend

# View frontend logs only
docker compose logs -f ayojok-frontend
```

### Restart Services
```bash
# Graceful restart
docker compose restart

# Fully recreate containers
docker compose up -d --force-recreate
```

### Database Backup & Restore
Since Postgres runs inside Docker, use the following commands to back up the schema and data:
```bash
# Backup database to host
docker exec -t ayojok-postgres pg_dump -U ayojok_user ayojok_db > db_backup_$(date +%F).sql

# Restore database from host file
cat db_backup_xxx.sql | docker exec -i ayojok-postgres psql -U ayojok_user -d ayojok_db
```

---

## 6. Updating the Deployment via Git

When new code is pushed to your Git repository, follow these steps to pull the latest changes, update the Docker containers, and run any new database migrations on your VPS:

1. **Pull the latest changes from Git:**
   ```bash
   cd /path/to/event-platform
   git pull origin main
   ```

2. **Rebuild and restart the Docker containers:**
   Use the `--build` flag to force Docker to rebuild the Next.js and Express images with the latest code, and `-d` to run them in the background.
   ```bash
   docker compose up -d --build
   ```

3. **Sync the Prisma Database Schema (if changed):**
   If there were any database schema changes in `backend/prisma/schema.prisma`, you must apply them to the production database running inside the container:
   ```bash
   docker exec -it ayojok-backend npx prisma db push
   ```

4. **Verify the update:**
   Check the logs to ensure the backend and frontend started successfully with the new code:
   ```bash
   docker compose logs -f ayojok-backend
   ```
