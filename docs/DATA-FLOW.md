# Somavesh Event Platform — Data Flow Architecture

This document defines the data flow architecture of the **Somavesh Event Platform** (`https://somavesh.com/`). Every diagram maps the actual current implementation across the Frontend (Next.js 16 / React 19), Express REST API, Middleware, Controllers, Services, Prisma ORM, PostgreSQL, Redis, BullMQ Queue, and External Integrations.

---

## 1. System Topology Overview

```mermaid
flowchart TD
    User([User / Browser / Mobile]) -->|HTTPS Port 443| Edge[Cloudflare Edge CDN / WAF]
    Edge -->|Proxy Port 80/443| HostNginx[Host Nginx Reverse Proxy]
    HostNginx -->|/* Traffic Port 3000| NextFrontend[Next.js 16 Frontend App]
    HostNginx -->|/api/v1/ Traffic Port 3001| ExpressAPI[Express REST API Cluster]
    
    ExpressAPI --> AuthMW[RS256 JWT & RBAC Middleware]
    AuthMW --> Controllers[Controllers & Business Services]
    
    Controllers --> PrismaORM[(Prisma ORM)]
    PrismaORM --> PostgresDB[(PostgreSQL 15 Database)]
    
    Controllers --> RedisCache[(Redis 7 Cache / Session Store)]
    Controllers --> BullMQ[BullMQ Queue Manager]
    BullMQ --> EmailWorker[BullMQ Email Worker]
    
    EmailWorker --> ResendAPI[Resend API - hello@mail.somavesh.com]
    Controllers --> R2Storage[Cloudflare R2 Asset Storage]
```

---

## 2. User Authentication & OTP Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant FE as Next.js Frontend
    participant API as Express API (/api/v1/auth)
    participant DB as PostgreSQL (Prisma)
    participant Redis as Redis Cache
    participant Queue as BullMQ Email Queue
    participant Mail as Resend Mailer

    %% Signup Code Request
    User->>FE: Enter Email for Registration
    FE->>API: POST /send-signup-code { email }
    API->>DB: Save VerificationCode (6-digit OTP, 10m TTL)
    API->>Queue: Enqueue 'sendVerificationCode'
    Queue->>Mail: Deliver OTP via hello@mail.somavesh.com
    API-->>FE: 200 OK { message: 'Verification code sent' }

    %% Complete Registration
    User->>FE: Submit Details + OTP Code
    FE->>API: POST /register { username, email, password, code }
    API->>DB: Query VerificationCode & verify attempts <= 5
    API->>DB: Hash password (Bcrypt) & Create User (Role: USER)
    API->>DB: Delete VerificationCode
    API->>Queue: Enqueue 'sendWelcomeEmail'
    API-->>FE: 201 Created { user }

    %% Login
    User->>FE: Submit Credentials
    FE->>API: POST /login { emailOrUsername, password }
    API->>DB: Find User by Email / Username
    API->>API: Verify Password Match & Account Status (ACTIVE)
    API->>API: Sign Asymmetric RS256 JWT Token (24h TTL)
    API->>FE: Set HTTP-Only Cookie ('session_token') + Return JSON { token, user }
```

---

## 3. Event Creation & Organizer Provisioning

```mermaid
sequenceDiagram
    autonumber
    actor Organizer
    participant FE as Next.js Frontend
    participant API as Express API (/api/v1/events)
    participant RBAC as requireGlobalRole(['ORGANIZER','ADMIN'])
    participant DB as PostgreSQL
    participant Redis as Redis Cache

    Organizer->>FE: Fill Event Details (Title, Capacity, Dates, Forms, bKash Info)
    FE->>API: POST /api/v1/events (Bearer Token / Cookie)
    API->>RBAC: Validate RS256 JWT & Check Role permissions
    RBAC->>API: Proceed to EventController.create
    API->>DB: Begin Prisma Transaction
    DB->>DB: 1. INSERT INTO events (status: DRAFT / UNDER_REVIEW)
    DB->>DB: 2. INSERT INTO event_team (role: ORGANIZER)
    DB->>DB: 3. INSERT INTO event_activities (Check-in, Food, Gift, Certificate)
    DB-->>API: Transaction Committed
    API->>Redis: Invalidate 'cache:events:*' keys
    API-->>FE: 201 Created { eventId }
```

---

## 4. Free / Manual bKash Event Registration Flow

```mermaid
sequenceDiagram
    autonumber
    actor Participant
    participant FE as Next.js Frontend
    participant API as Express API (/api/v1/events/:slug/register)
    participant RegSvc as RegistrationService
    participant DB as PostgreSQL
    participant Queue as BullMQ

    Participant->>FE: Select Ticket & Enter Details (+ bKash Transaction ID if paid)
    FE->>API: POST /api/v1/events/:slug/register
    API->>RegSvc: registerForEvent(eventId, userId, ticketTypeIds, details)
    
    RegSvc->>DB: Begin Prisma Transaction
    DB->>DB: 1. Lock Event Row: SELECT capacity FROM events WHERE id = $id FOR UPDATE
    DB->>DB: 2. Check Capacity & Ticket Availability
    DB->>DB: 3. Check Duplicate Registration / Team Membership
    RegSvc->>RegSvc: 4. Generate Cryptographically Secure QR Token (UUIDv4)
    DB->>DB: 5. INSERT INTO registrations (status: CONFIRMED, paymentStatus: COMPLETED/NOT_REQUIRED, qrToken)
    DB->>DB: 6. INSERT INTO registration_ticket_types & registration_teams (if team)
    DB-->>API: Transaction Committed
    
    API->>Queue: Enqueue 'sendConfirmationEmail' { email, eventId, registrationId, qrToken }
    API-->>FE: 201 Created { registrationId, qrToken }
```

---

## 5. QR Code Ticket Verification & Check-in Flow

```mermaid
sequenceDiagram
    autonumber
    actor Scanner as Event Scanner / Host
    participant FE as Scanner App (Frontend)
    participant API as Express API (/api/v1/tickets/verify or /events/:slug/scan)
    participant RBAC as requireEventRole(['ORGANIZER','MANAGER','SCANNER'])
    participant DB as PostgreSQL

    Scanner->>FE: Scan Attendee QR Code
    FE->>API: POST /api/v1/tickets/verify { qrToken }
    API->>RBAC: Validate Session & Event Host / Team Authorization
    RBAC->>API: Proceed to TicketController.verifyScan
    
    API->>DB: Find Registration by qrToken & Include Event Details
    alt Ticket Invalid / Cancelled
        DB-->>API: Registration Not Found OR Status == CANCELLED
        API-->>FE: 400 Bad Request { error: 'Ticket invalid / cancelled' }
    else Already Checked In
        DB-->>API: Registration Status == CHECKED_IN
        API-->>FE: 200 OK { message: 'Already checked in', alreadyCheckedIn: true }
    else Valid Check-in
        API->>DB: Begin Prisma Transaction
        DB->>DB: UPDATE registrations SET status = 'CHECKED_IN' WHERE id = regId
        DB->>DB: UPSERT INTO activity_scans (registrationId, activityId, scannedBy)
        DB-->>API: Transaction Committed
        API-->>FE: 200 OK { message: 'Ticket verified successfully', alreadyCheckedIn: false }
    end
```

---

## 6. Offline Check-in Synchronization Flow

```mermaid
sequenceDiagram
    autonumber
    actor Scanner as Event Scanner
    participant FE as Scanner App (IndexedDB Offline Queue)
    participant API as Express API (/api/v1/tickets/sync-offline)
    participant DB as PostgreSQL

    Note over FE: Network Restored after Offline Scanning
    FE->>API: POST /api/v1/tickets/sync-offline { scans: [{ qrToken, scannedAt }] }
    
    API->>DB: 1. Batch Query: SELECT * FROM registrations WHERE qrToken IN (tokens)
    API->>API: 2. Filter Authorized Events & Active Registrations
    
    API->>DB: 3. Batch Update: UPDATE registrations SET status = 'CHECKED_IN' WHERE id IN (validRegIds)
    API->>DB: 4. Batch Insert: INSERT INTO activity_scans (skipDuplicates: true)
    
    API-->>FE: 200 OK { syncedCount, syncedTokens, errors }
```

---

## 7. Background Worker & Transactional Email Processing

```mermaid
sequenceDiagram
    autonumber
    participant App as Express Backend Process
    participant Redis as Redis (BullMQ Queue: email-notifications)
    participant Worker as BullMQ Worker Process
    participant Mail as Resend Transactional API

    App->>Redis: Queue.add('sendConfirmationEmail', { email, eventId, registrationId, qrToken })
    
    loop Worker Polling
        Worker->>Redis: Fetch Next Job
        Redis-->>Worker: Job Data { email, eventId, registrationId, qrToken }
        Worker->>Worker: Generate Dynamic QR Image URL & Render HTML Template
        Worker->>Mail: POST https://api.resend.com/emails (From: hello@mail.somavesh.com)
        
        alt Delivery Successful
            Mail-->>Worker: 200 OK { id: 'msg_12345' }
            Worker->>Redis: Mark Job Completed
        else Delivery Failed (Max Attempts Reached)
            Mail-->>Worker: 500 / Error
            Worker->>Worker: Exponential Backoff Retry (Up to 3 attempts)
            Worker->>App: Update Registration Status to 'DELIVERY_FAILED'
        end
    end
```

---

## 8. File Upload & Asset Compression Flow (Cloudflare R2)

```mermaid
sequenceDiagram
    autonumber
    actor User as Organizer / User
    participant FE as Next.js Frontend
    participant API as Express API (/upload-avatar /upload-image)
    participant Sharp as Sharp Image Processing Engine
    participant R2 as Cloudflare R2 Bucket (rong-plan-assets)

    User->>FE: Select Image File (PNG / WebP / JPEG)
    FE->>API: POST Multipart / Buffer Data
    API->>Sharp: Resize to target bounds (Avatar: 500x500, Banner: 1200x630)
    Sharp->>Sharp: Convert to WebP format & compress quality (Target < 100KB)
    API->>R2: PutObjectCommand to R2 Endpoint
    R2-->>API: Upload Confirmed
    API-->>FE: 200 OK { url: 'https://assets.rong-plan.com/avatars/user.webp?v=timestamp' }
```

---

## 9. Admin Platform Moderation Flow

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Platform Super Admin
    participant FE as Admin Dashboard
    participant API as Express API (/api/v1/admin/*)
    participant RBAC as requireGlobalRole(['SUPER_ADMIN','ADMIN'])
    participant DB as PostgreSQL

    Admin->>FE: Moderate Event / Suspend User / Review Organizers
    FE->>API: DELETE /api/v1/admin/events/:id OR POST /organizers/:username/approve
    API->>RBAC: Verify RS256 JWT Role == SUPER_ADMIN / ADMIN
    RBAC->>API: Proceed to AdminController
    
    API->>DB: Perform Target Operation (Delete Event / Update User Status)
    API->>DB: INSERT INTO admin_logs (adminUsername, action, targetType, targetId, details)
    DB-->>API: Operation & Audit Log Saved
    API-->>FE: 200 OK { message: 'Admin action recorded successfully' }
```
