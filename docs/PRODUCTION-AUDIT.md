# Production Audit Report — Somavesh Event Platform

**Date**: September 10, 2026  
**Auditor**: Senior Software Architect, DevSecOps, Database & Infrastructure Lead  
**Scope**: Codebase, GitHub repo, Docker configuration, Database schema & seeds, Nginx, SSL/TLS, Cloudflare, Security, Performance, Deployment & Recovery  
**Target Domain**: `somavesh.rongplan.com` / `somavesh.com`  

---

## 1. Executive Summary

A comprehensive, ground-up pre-launch audit of the Somavesh Event Platform was conducted across all system layers. The platform possesses strong architectural foundations:
- Modern Next.js 16 (React 19) frontend with Ant Design + Tailwind CSS v4.
- Asymmetric RS256 stateless JWT authentication backed by Redis session caching.
- Isolated Docker bridge networking keeping PostgreSQL and Redis unexposed to the public internet.
- High-concurrency event registration utilizing PostgreSQL row-level locking (`FOR UPDATE`) to prevent capacity overselling.
- Cloudflare R2 image optimization pipeline via Sharp to keep avatars and banners under 100KB.

However, several **Critical (P0)** and **High (P1)** security, data integrity, and operational issues were identified that must be resolved prior to launching public production traffic. Most notably:
1. **P0 Security**: A production database connection string containing plaintext Neon credentials (`npg_...`) is actively saved in `.env`, and default PostgreSQL/Redis root passwords are committed to Git history in `docker-compose.yml`.
2. **P0 Security**: The SSLCommerz callback endpoints (`/api/v1/payments/success`, `/ipn`) lack server-to-server transaction validation against SSLCommerz's verification API (`validatePayment`), leaving ticket creation susceptible to forged callbacks.
3. **P1 Operational / Data**: The database initialization script (`database/init/01-init.sql`) executes `DROP TABLE IF EXISTS ... CASCADE` and seeds dummy development users and events, creating high data-loss risk if mounted on an existing database volume.
4. **P1 Functionality**: Admin route mismatch on event deletion (`DELETE /api/v1/admin/events/:id` passes integer `id` from frontend, but backend controller and service expect `slug`, causing admin event deletion to fail with 404/500).
5. **P1 Email / UX**: Multiple transactional email templates contain corrupted UTF-8 replacement characters (``) in headings, separators, and titles instead of clean em-dashes or bullets.

---

## 2. Architecture Overview

### 2.1 Complete System Topology

```
                                [ Internet Users ]
                                        │
                                        ▼ (Port 80 / 443 HTTPS)
                             [ Cloudflare Edge CDN & WAF ]
                                (SSL Termination / Proxy)
                                        │
                                        ▼ (Port 80 / 443 Encrypted)
                             [ Hostinger KVM VPS: Ubuntu ]
                                        │
                                        ▼
                                   [ Host Nginx ]
                         (Domain: somavesh.rongplan.com)
                           ├── /api/v1/ ──► Port 3001
                           ├── /health  ──► Port 3001
                           └── /*       ──► Port 3000
                                        │
        ┌───────────────────────────────┴───────────────────────────────┐
        ▼ (127.0.0.1:3000)                                              ▼ (127.0.0.1:3001)
  [ Somavesh-frontend ]                                           [ Somavesh-backend ]
  - Next.js 16 (App Router)                                       - Express + TypeScript
  - Node 20 Alpine Runner                                         - Node.js Cluster Master/Worker
  - Port 3000 bound to loopback                                   - Port 3001 bound to loopback
        │                                                               │
        └───────────────────────────────┬───────────────────────────────┘
                                        ▼ [ Somavesh-network (Bridge) ]
                        ┌───────────────────────────────┐
                        │                               │
                        ▼                               ▼
               [ Somavesh-postgres ]            [ Somavesh-redis ]
               - Postgres 15 Alpine             - Redis 7 Alpine
               - Internal Port 5432             - Internal Port 6379
               - Named Volume: postgres_data    - Named Volume: redis_data
```

### 2.2 External Integrations & Boundaries

| Component | Provider | Protocol / Port | Purpose | Trust Boundary |
|-----------|----------|-----------------|---------|----------------|
| DNS & CDN | Cloudflare | DNS / HTTPS (443) | Edge security, SSL, DDoS protection | Public Perimeter |
| Storage | Cloudflare R2 | S3 API / HTTPS (443) | Avatars, event banners, partner logos | Private API (Access Key ID + Secret) |
| Transactional Mail | Resend | HTTPS REST API | OTP verification, ticket confirmation, cancellations | Outbound API (Resend API Key) |
| Payment Gateway | SSLCommerz | Form POST / IPN Webhook | BDT checkout via bKash, Nagad, Cards | External Webhook & Redirects |
| Database Hosting | Self-hosted Docker / Neon | PostgreSQL (5432) | Relational application data storage | Internal VPC / Docker Network |
| In-Memory Cache | Self-hosted Redis | RESP (6379) | BullMQ background jobs, user session cache | Internal Docker Network only |

---

## 3. Application Audit

### 3.1 Frontend (Next.js 16 App Router)
- **Routing & Pages**: All major routes configured under `(public)`, `(auth)`, `(dashboard)`, and `(marketing)`.
- **API Client**: Implements unified fetch wrapper in [api.ts](file:///d:/rong-plan/event-platform/frontend/src/lib/api.ts) with client-side origin awareness (`window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_API_URL`).
- **Form Validation & Hydration**: Ant Design v6 components wrapped with `@ant-design/nextjs-registry` to avoid hydration flicker.
- **Image Optimization**: Custom Sharp pipelines run on upload; frontend renders WebP variants.

### 3.2 Backend (Express REST API)
- **Process Model**: Node.js `cluster` in production forks worker per CPU core; background `status-scheduler` runs exclusively on the Primary process to prevent multi-worker concurrency race conditions.
- **Security Middleware**: `securityHeaders` applies CSP, HSTS, X-Frame-Options (`DENY`), X-Content-Type-Options (`nosniff`).
- **CORS**: Dynamically validates incoming origin against `CORS_ORIGIN` env list; allows credentials (`Access-Control-Allow-Credentials: true`).
- **Unhandled Error Handling**: Production global error handler returns `Internal server error` while logging full error traces via JSON logger.
- **Telemetry**: Built-in JSON logger with automatic redaction of `password`, `password_hash`, `session_token`, `qr_token`, `authorization`, and `cookie`.

---

## 4. Authentication & Authorization Audit

### 4.1 Token Security
- **Asymmetric Signature**: JWTs signed using 2048-bit RSA keys (`RS256`). Private key signs tokens; public key verifies.
- **Expiration**: Stateless tokens expire in 24 hours.
- **Cookie Flags**:
  - `httpOnly: true` (prevents JavaScript access / XSS token exfiltration).
  - `secure: true` in production (ensures transmission strictly over HTTPS).
  - `sameSite: 'lax'` (mitigates CSRF on top-level cross-site navigations).
- **Session Caching**: User status (`ACTIVE` vs `SUSPENDED`) and role are cached in Redis with a 60-second TTL. Immediate revocation/suspension supported via cache deletion.

### 4.2 RBAC Matrix Verification
- `requireGlobalRole(['ADMIN', 'SUPER_ADMIN'])` enforced on all `/api/v1/admin/*` routes.
- `requireEventRole(['ORGANIZER', 'MANAGER', 'SCANNER'])` dynamically checks event ownership and event team memberships before allowing attendee listing, check-in scanning, or agenda editing.
- **Privilege Escalation**: Normal users cannot promote themselves or create events if `features.eventCreation` is disabled.

---

## 5. Database Audit

### 5.1 Schema & Integrity
- **Primary Keys**: Auto-incrementing sequences on metadata; `BigInt` on high-volume tables (`registrations`, `activity_scans`).
- **Cascading Constraints**: All child records (`ticket_types`, `event_team`, `event_activities`, `certificates`) set to `ON DELETE CASCADE` or `ON DELETE SET NULL`.
- **Indexes**: Explicit composite indexes on `[event_id, status]`, `[event_id, registered_at DESC]`, `[tran_id]`, and `[qr_token]`.
- **Race Condition Prevention**: `RegistrationService.registerForEvent` uses `SELECT capacity FROM events WHERE id = ${eventId} FOR UPDATE` inside a database transaction to lock the event row during capacity verification.

### 5.2 Database Security & Migration Hazards
- The initialization file `database/init/01-init.sql` contains `DROP TABLE IF EXISTS ... CASCADE`. This script is mounted to `/docker-entrypoint-initdb.d`. In PostgreSQL Docker images, this only runs on an empty data directory, but running it manually or during rebuilds poses catastrophic data destruction risk.
- Default credentials in `docker-compose.yml` (`db_d579e088...`) must be replaced with secret environment variables in production.

---

## 6. Payment System Security Audit

### 6.1 SSLCommerz Integration
- **Transaction Initiation**: Generates unique `RP-<timestamp>-<rand>` transaction ID; saves `PENDING` registration and `PENDING` payment records inside an atomic Prisma transaction.
- **CRITICAL VULNERABILITY (P0)**: In [payment.controller.ts](file:///d:/rong-plan/event-platform/backend/src/controllers/payment.controller.ts), `handleSuccess` and `handleIPN` directly call:
  ```typescript
  await PaymentService.completePayment({ tranId, valId, status: 'SUCCESS' });
  ```
  without calling SSLCommerz's server-to-server order validation API (`validatePayment({ val_id })`).
- **Risk**: An attacker who intercepts or predicts a `tran_id` can craft a malicious HTTP POST request to `/api/v1/payments/success` with an arbitrary `val_id` and have their ticket marked as `CONFIRMED` and `COMPLETED` without sending funds.

---

## 7. Infrastructure, Docker & VPS Audit

### 7.1 Docker Hardening
- **Multi-stage builds**: Both `backend/Dockerfile` and `frontend/Dockerfile` use multi-stage builds (`node:20-alpine`).
- **Non-Root Execution**:
  - Backend runs under system user `expressjs:nodejs` (UID/GID 1001).
  - Frontend runs under system user `nextjs:nodejs` (UID/GID 1001).
- **Port Exposure**:
  - `docker-compose.yml` binds `3001:3001` and `3000:3000` to `127.0.0.1`. Neither is directly accessible from the public internet without going through Nginx.
  - PostgreSQL (`5432`) and Redis (`6379`) have **no published host ports**; accessible solely within `Somavesh-network`.

### 7.2 Nginx & Reverse Proxy
- **Rate Limiting**: `limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s` with burst of 15.
- **Client Body Limits**: Set to `client_max_body_size 10M` to permit image uploads.
- **Connection Keepalive**: `upstream Somavesh_backend` maintains up to 64 idle connections for low latency.
- **Cloudflare Header Trust**: Nginx forwards `X-Real-IP $http_cf_connecting_ip`.

---

## 8. Issue Register

| ID | Severity | Category | Issue Description | Risk | Recommended Fix | Status |
|---|---|---|---|---|---|---|
| **ISS-01** | **P0** | **Security** | SSLCommerz payment callback / IPN does not verify `val_id` via gateway server-to-server validation API | Fake payment confirmation; free tickets issued | Call `sslcz.validate({ val_id })` in `completePayment` before marking status `COMPLETED` | **CONFIRMED** |
| **ISS-02** | **P0** | **Security** | Hardcoded Neon database credentials & exposed Postgres/Redis passwords in `.env` and `docker-compose.yml` | Unauthorized DB access if config leaks | Rotate credentials immediately; inject via server-level environment variables only | **CONFIRMED** |
| **ISS-03** | **P1** | **Data Safety** | `database/init/01-init.sql` has `DROP TABLE IF EXISTS ... CASCADE` and seeded test accounts | Catastrophic data wipe if executed on existing DB | Remove `DROP TABLE` from init scripts; separate test seeds from base DDL | **CONFIRMED** |
| **ISS-04** | **P1** | **Functionality** | Event deletion route parameter mismatch: frontend calls `/api/v1/admin/events/${id}` (int), backend expects `slug` | Admin event deletion fails with 404/500 | Update `AdminService.deleteEvent` to accept either numeric ID or string slug | **CONFIRMED** |
| **ISS-05** | **P1** | **Quality/UX** | Email templates contain corrupted UTF-8 replacement glyphs (``) | Damaged brand trust, unprofessional user emails | Replace corrupted bytes with standard ASCII dashes (`-` or `–`) and bullets (`•`) | **CONFIRMED** |
| **ISS-06** | **P2** | **Performance** | `EmailService` relies on external QR code generator (`api.qrserver.com`) during worker processing | Network latency / dependency failure during ticket generation | Generate QR code SVGs locally using npm package `qrcode` or pre-generate in worker | **CONFIRMED** |
| **ISS-07** | **P2** | **Security** | `/api/v1/events/debug` route is publicly exposed in `event.routes.ts` | Information disclosure regarding internal events | Remove or gate behind `process.env.NODE_ENV !== 'production'` | **CONFIRMED** |
| **ISS-08** | **P2** | **Reliability** | CI/CD GitHub Actions pushes images tagged with branch name (`:main`) without commit SHA versioning | Inability to rollback to exact previous commit image | Add Git SHA tagging (`app:${{ github.sha }}`) in `docker-publish.yml` | **CONFIRMED** |
| **ISS-09** | **P3** | **Architecture** | Admin permissions routes (`/api/v1/admin/permissions/:username`) return 501 Not Implemented | Dead UI endpoints if called by client | Finalize RBAC permission delegation or hide UI triggers | **CONFIRMED** |

---

## 9. Production Readiness Score

| Category | Weight | Score (0-100) | Weighted Score |
|---|---|---|---|
| **Architecture & Structure** | 15% | 94 | 14.1 |
| **Security & Auth** | 20% | 72 | 14.4 |
| **Database & Concurrency** | 15% | 85 | 12.75 |
| **Payment & Financial Integrity**| 15% | 60 | 9.0 |
| **Docker & Infrastructure** | 15% | 92 | 13.8 |
| **Reliability & Resilience** | 10% | 80 | 8.0 |
| **Documentation & Runbooks** | 10% | 90 | 9.0 |
| **Total** | **100%** | — | **81.05 / 100** |

### Launch Decision

> ### **READY AFTER FIXES (YELLOW — CONDITIONAL)**
> Launch is permitted once **P0** (Payment validation & secret rotation) and **P1** (Admin delete ID/slug resolution & email template cleanup) are addressed.

---

## 10. Pre-Launch Action Checklist

- [ ] **Fix Payment Verification**: Implement `sslcz.validate({ val_id })` inside `PaymentService.completePayment` before confirming orders.
- [ ] **Rotate & Secure Database Credentials**:
  - [ ] Rotate Neon / Postgres database passwords.
  - [ ] Rotate Redis auth password.
  - [ ] Ensure `.env` is never committed (verified in `.gitignore`).
- [ ] **Fix Admin Event Deletion**: Support both numeric `id` and `slug` in `AdminService.deleteEvent`.
- [ ] **Fix Email Characters**: Strip corrupted UTF-8 `` characters in all transactional email templates.
- [ ] **Remove Debug Route**: Strip `/api/v1/events/debug` from `event.routes.ts`.
- [ ] **Tag Docker Releases**: Update GitHub Actions workflow to publish `${{ github.sha }}` image tags alongside `:main`.
- [ ] **Set Up Host Automated Backups**: Schedule nightly `cron` dump of PostgreSQL container to encrypted external storage.
