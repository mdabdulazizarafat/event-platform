# Somavesh Event Platform — System Architecture & Topology

This document details the production architecture, components, external boundaries, and operational layers of the **Somavesh Event Platform** (`https://somavesh.com/`).

---

## 1. System Topology Overview

```
                                [ Public Internet Users ]
                                            │
                                            ▼ (HTTPS Port 443)
                                 [ Cloudflare Edge CDN & WAF ]
                                  (SSL Termination / Proxy)
                                            │
                                            ▼ (HTTP / HTTPS)
                                 [ Hostinger KVM VPS: Ubuntu ]
                                            │
                                            ▼
                                       [ Host Nginx ]
                            (Domain: somavesh.com / www.somavesh.com)
                               ├── /api/v1/ ──► Port 3001
                               ├── /health  ──► Port 3001
                               └── /*       ──► Port 3000
                                            │
            ┌───────────────────────────────┴───────────────────────────────┐
            ▼ (127.0.0.1:3000)                                              ▼ (127.0.0.1:3001)
      [ Somavesh-frontend ]                                           [ Somavesh-backend ]
      - Next.js 16 (App Router)                                       - Express + TypeScript
      - Node 20 Alpine Container                                      - Node.js Cluster Master/Worker
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

---

## 2. Component Responsibility Matrix

| Component | Technology | Responsibilities | Access Boundary |
|-----------|------------|------------------|-----------------|
| **Frontend** | Next.js 16 / React 19 / Ant Design / Tailwind v4 | UI rendering, client-side routing, offline IndexedDB scan queuing, responsive dashboards, SEO metadata | Publicly accessible via Nginx reverse proxy |
| **Backend API** | Node.js / Express / TypeScript | REST API endpoints, asymmetric RS256 JWT auth, RBAC authorization, business logic, validation | Loopback bound (127.0.0.1:3001) via Nginx |
| **Database** | PostgreSQL 15 / Prisma ORM | Relational data persistence, row-level capacity locking (`FOR UPDATE`), multi-table transactions, indexes | Isolated Docker bridge network only |
| **Cache & Session** | Redis 7 | User session caching (60s TTL), event list query caching (15s TTL), BullMQ job queue backend | Isolated Docker bridge network only |
| **Background Workers** | BullMQ Workers | Asynchronous email dispatch, backoff retries, delivery failure handling | Internal Node.js cluster process |
| **File Storage** | Cloudflare R2 / Sharp | Avatar, event banner, partner logo optimization (<100KB WebP target) and presigned storage | Outbound S3 API via HTTPS |
| **Email Gateway** | Resend API | Transactional emails (welcome, OTP, ticket confirmation, cancellations) | Outbound HTTPS API via `hello@mail.somavesh.com` |
| **Payments** | bKash / Manual Verification Workflow | Mobile banking transaction ID input, manual organizer audit, status tracking | Manual / bKash transaction workflow |

---

## 3. Technology Stack & Dependencies

- **Node.js**: v20.x LTS
- **Frontend Framework**: Next.js 16.2.9 with React 19.2.4
- **UI Library**: Ant Design v6 (`@ant-design/nextjs-registry`), Tailwind CSS v4, Lucide React icons
- **Backend Framework**: Express 4.19.2, TypeScript 5.4.5, `ts-node`
- **Database Client**: Prisma ORM 5.14.0, `pg` driver pool
- **Cache / Queues**: `ioredis`, BullMQ 5.8.5
- **Security & Crypto**: `jsonwebtoken` (RS256 asymmetric), `bcryptjs`, native Node `crypto` (UUIDv4 tokens)
- **Image Processing**: `sharp` 0.33.3, `@aws-sdk/client-s3` (R2)
- **Containerization**: Docker 3.8 multi-stage Alpine builds
