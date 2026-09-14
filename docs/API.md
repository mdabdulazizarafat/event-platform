# Somavesh Event Platform — Complete API Specification

Canonical Domain: `https://somavesh.com/`  
Base API Prefix: `/api/v1`

---

## 1. Complete Endpoint Catalog

| Method | Endpoint | Auth | Required Role | Input Parameters / Body | Description |
|--------|----------|------|---------------|-------------------------|-------------|
| **POST** | `/api/v1/auth/send-signup-code` | Public | None | `{ email }` | Send 6-digit OTP code for registration via `hello@mail.somavesh.com`. |
| **POST** | `/api/v1/auth/register` | Public | None | `{ username, name, email, password, code, mobile, org }` | Complete user account registration with OTP code. |
| **POST** | `/api/v1/auth/login` | Public | None | `{ emailOrUsername, password }` | Authenticate user & issue RS256 HTTP-only cookie and JSON token. |
| **POST** | `/api/v1/auth/logout` | Public | None | None | Clear session cookie. |
| **GET** | `/api/v1/auth/me` | Bearer/Cookie | Any authenticated user | None | Return currently logged-in user profile context. |
| **PUT** | `/api/v1/auth/profile` | Bearer/Cookie | Any authenticated user | `{ name, mobile, org, bio, avatar, ... }` | Update user profile metadata. |
| **POST** | `/api/v1/auth/upload-avatar` | Bearer/Cookie | Any authenticated user | Multipart / Buffer | Upload & compress user avatar to WebP (<100KB) on Cloudflare R2. |
| **POST** | `/api/v1/auth/apply-organizer` | Bearer/Cookie | Any authenticated user | `{ orgName, reason, phone }` | Submit organizer application for admin review. |
| **POST** | `/api/v1/auth/reset-password` | Public | None | `{ email, code, newPassword }` | Verify OTP code & reset user password. |
| **GET** | `/api/v1/events` | Optional | None (public list) | Query: `page`, `limit`, `search`, `status`, `category`, `mine` | List events with pagination and Redis query caching. |
| **GET** | `/api/v1/events/my-managed` | Bearer/Cookie | `ORGANIZER` / `MANAGER` | None | Fetch all events managed or hosted by the logged-in user. |
| **GET** | `/api/v1/events/dashboard-stats` | Bearer/Cookie | `ORGANIZER` / `MANAGER` | None | Aggregated organizer statistics (registrations, revenue, check-in rate). |
| **POST** | `/api/v1/events` | Bearer/Cookie | `ORGANIZER` / `ADMIN` | `{ slug, title, date, time, location, capacity, ... }` | Create a new event and initialize default team and activities. |
| **GET** | `/api/v1/events/:slug` | Optional | None (public detail) | None | Get detailed event profile by unique slug. |
| **PUT** | `/api/v1/events/:slug` | Bearer/Cookie | Event `ORGANIZER` | Event fields object | Update event details & registration form toggles. |
| **POST** | `/api/v1/events/:slug/register` | Bearer/Cookie | Any user | `{ ticketTypeId, ticketTypeIds, fullName, phone, transactionId, teamName, teamMembers }` | Register for event using row locking; supports manual bKash transaction ID. |
| **GET** | `/api/v1/events/:slug/registrations` | Bearer/Cookie | Event `ORGANIZER` | Query: `page`, `limit`, `search` | Fetch attendee list for event. |
| **POST** | `/api/v1/events/:slug/ticket-types` | Bearer/Cookie | Event `ORGANIZER` | `{ name, price, capacity, isTeam, maxTeamSize }` | Create ticket tier for event. |
| **GET** | `/api/v1/events/:slug/ticket-types` | Public | None | None | Get active ticket tiers for event. |
| **POST** | `/api/v1/events/:slug/team` | Bearer/Cookie | Event `ORGANIZER` | `{ username, role }` | Invite co-organizer, manager, or door scanner to event team. |
| **GET** | `/api/v1/events/:slug/team` | Bearer/Cookie | Event `ORGANIZER` / `MANAGER` | None | List event team members. |
| **POST** | `/api/v1/events/:slug/activities` | Bearer/Cookie | Event `ORGANIZER` | `{ name, scanLimit }` | Add scanning checkpoint activity. |
| **POST** | `/api/v1/events/:slug/scan` | Bearer/Cookie | Event `ORGANIZER`/`MANAGER`/`SCANNER` | `{ activityId, qrToken }` | Perform single ticket scan validation at checkpoint. |
| **GET** | `/api/v1/events/:slug/scan/logs` | Bearer/Cookie | Event `ORGANIZER`/`MANAGER`/`SCANNER` | Query: `page`, `limit` | Live feed of recent scan logs. |
| **GET** | `/api/v1/tickets/my-registrations` | Bearer/Cookie | Any user | None | Get all registrations and ticket QR codes for logged-in user. |
| **POST** | `/api/v1/tickets/verify` | Bearer/Cookie | Event Host / Organizer | `{ qrToken }` | General door entry check-in scan endpoint. |
| **POST** | `/api/v1/tickets/sync-offline` | Bearer/Cookie | Event Host / Organizer | `{ scans: [{ qrToken, scannedAt }] }` | Sync batch of offline check-ins in batch queries. |
| **POST** | `/api/v1/tickets/:id/resend` | Bearer/Cookie | Event `ORGANIZER` / Admin | `{ email }` | Re-enqueue confirmation ticket email. |
| **POST** | `/api/v1/tickets/:id/cancel` | Bearer/Cookie | Event `ORGANIZER` / Admin | None | Cancel registration ticket and enqueue cancellation email. |
| **GET** | `/api/v1/certificates/my` | Bearer/Cookie | Any user | None | Fetch issued certificates for logged-in user. |
| **GET** | `/api/v1/admin/users` | Bearer/Cookie | `ADMIN` / `SUPER_ADMIN` | Query: `page`, `limit`, `search` | Admin user management list. |
| **DELETE** | `/api/v1/admin/events/:id` | Bearer/Cookie | `ADMIN` / `SUPER_ADMIN` | Route param: numeric ID or slug | Delete / moderate event from platform. |
| **GET** | `/api/v1/admin/queues/status` | Bearer/Cookie | `SUPER_ADMIN` | None | Monitor BullMQ Redis queue metrics and job health. |

---

## 2. Global Error Protocol

All error responses return a standardized JSON structure:

```json
{
  "error": "Descriptive error message"
}
```

- In **development**, detailed error strings and stack traces are logged.
- In **production** (`NODE_ENV=production`), unhandled internal errors return generic `"Internal server error"` to prevent information disclosure.
