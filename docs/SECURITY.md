# Somavesh Event Platform — Security Audit & Controls

This document details the security architecture, OWASP compliance audit, authorization matrix, sensitive data redaction, and cryptography implementation for **Somavesh** (`https://somavesh.com/`).

---

## 1. Authentication & Token Architecture

### 1.1 Asymmetric RS256 JWT
- Tokens are signed using **2048-bit RSA Private Keys** and verified using **Public Keys** (`RS256` algorithm).
- Statistically stateless with a **24-hour expiration** (`expiresIn: '24h'`).
- The JWT is stored in an `httpOnly` cookie (`session_token`) with `secure: true` in production and `sameSite: 'lax'`, mitigating XSS token exfiltration and CSRF risks.

### 1.2 Session Caching & Immediate Revocation
- Active session states (`status` and `role`) are cached in Redis under `user:session:<username>` with a 60-second TTL.
- When an administrator suspends a user, the Redis key is deleted, triggering an immediate database lookup on the user's next request and returning `403 Forbidden` (`Your account has been suspended`).

---

## 2. Authorization & Role-Based Access Control (RBAC)

### 2.1 Platform Global Roles
- `SUPER_ADMIN`: Full access across all system resources, settings, impersonation, queue metrics, and partners.
- `ADMIN`: Access to user moderation, event approval/rejection, global settings viewing, and organizer reviews.
- `ORGANIZER`: Access to create events, manage tickets, invite event team members, configure check-in checkpoints, and view event analytics.
- `USER`: Regular participant account capable of browsing public events, registering, viewing QR tickets, and receiving certificates.

### 2.2 Granular Event Team Roles
- Enforced dynamically via `requireEventRole(['ORGANIZER', 'MANAGER', 'SCANNER'])` middleware:
  - `ORGANIZER`: Full management of the specific event.
  - `MANAGER`: Agenda/schedule management, attendee listing, and scan statistics.
  - `SCANNER`: Restricted strictly to ticket verification (`/scan`) and scan log viewing.

---

## 3. Input Security & OWASP Top 10 Mitigation

- **SQL Injection**: All database queries are executed using **Prisma ORM** parameterized queries or parameterized raw queries (`$queryRaw`).
- **Cross-Site Scripting (XSS)**: Next.js automatically escapes React JSX outputs. API responses render JSON. Security headers include `Content-Security-Policy`, `X-XSS-Protection: 1; mode=block`, and `X-Content-Type-Options: nosniff`.
- **Race Conditions & Overselling**: Event capacity check utilizes `SELECT capacity FROM events WHERE id = ${eventId} FOR UPDATE` row-level locks inside PostgreSQL interactive transactions.
- **Duplicate Scanning**: Check-in checkpoint scans enforce database unique constraints on `@@unique([registrationId, activityId])` with atomic transaction logging.
- **Sensitive Data Logging Redaction**: The logger utility automatically redacts sensitive keys: `password`, `password_hash`, `session_token`, `qr_token`, `authorization`, and `cookie`.
