# Somavesh Event Platform — Technical Documentation Sitemap & Summary

This directory contains the authoritative technical documentation suite for the **Somavesh Event Platform** (`https://somavesh.com/`).

---

## Technical Documentation Sitemap

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](file:///d:/rong-plan/event-platform/docs/ARCHITECTURE.md) | Complete system topology diagram, VPS container layout, component responsibility matrix, technology dependencies, and network boundaries. |
| [DATA-FLOW.md](file:///d:/rong-plan/event-platform/docs/DATA-FLOW.md) | Ground-truth data flow architecture diagrams (using Mermaid) covering User Auth & OTP, Event Creation, bKash Manual Registration, QR Check-in, Offline Sync, Email Processing, File Uploads, and Admin Operations. |
| [API.md](file:///d:/rong-plan/event-platform/docs/API.md) | Comprehensive API endpoint catalog listing HTTP methods, route paths, authentication requirements, RBAC roles, input parameters, and response schemas. |
| [SECURITY.md](file:///d:/rong-plan/event-platform/docs/SECURITY.md) | Security audit report covering RS256 JWT asymmetric signatures, Redis session caching & immediate revocation, RBAC matrices, OWASP mitigations, SQL injection protection, capacity row locking (`FOR UPDATE`), and log redaction. |
| [DEPLOYMENT.md](file:///d:/rong-plan/event-platform/docs/DEPLOYMENT.md) | Production Docker Compose configuration, Host Nginx reverse proxy settings, production environment variable checklist, and disaster recovery / backup runbooks. |
| [PRODUCTION-AUDIT.md](file:///d:/rong-plan/event-platform/docs/PRODUCTION-AUDIT.md) | Final release audit report with Git commit SHA `5a81ac07800d17284a2168660ccd17016fd97b82`, scorecard (98/100), findings, fixes implemented, and official **GO** production release decision. |
