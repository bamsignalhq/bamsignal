# Service Inventory & Dependencies

Canonical inventory of BamSignal production services. Each entry defines owner, dependencies, criticality, health checks, failure modes, and recovery steps.

**Criticality:** **P1** (member-facing outage) · **P2** (degraded revenue/trust) · **P3** (internal/admin) · **P4** (non-production / future)

Cross-reference: [health-checks.md](./health-checks.md) · [runbooks.md](./runbooks.md) · [service-dependencies diagram](#dependency-map)

---

## Frontend (Web / PWA)

| Field | Value |
|-------|-------|
| **Owner** | Engineering |
| **Criticality** | P1 |
| **Dependencies** | Backend API, CDN/static `dist/`, Supabase client (anon key), Firebase (push), service worker |
| **Health checks** | `GET /` (public homepage), member routes load, SW cache version |
| **Failure modes** | Stale bundle, SW cache poisoning, member shell on public routes, hydration crash |
| **Recovery** | Redeploy Coolify; verify build hash; [deployment-recovery.md](../../runbooks/deployment-recovery.md) |

**Routes:** `/home`, `/discover`, `/chats`, `/signals`, `/profile`, `/settings`, `/subscription`  
**Rule:** Public routes must not trigger member restore; onboarding only at `/onboarding`.

---

## Backend API

| Field | Value |
|-------|-------|
| **Owner** | Engineering / SRE |
| **Criticality** | P1 |
| **Dependencies** | Node 20, Docker, `DATABASE_URL`, runtime secrets |
| **Health checks** | `GET /health` (liveness), `GET /ready` (readiness) |
| **Failure modes** | Process crash, OOM, migration failure on boot, 502 from reverse proxy |
| **Recovery** | [runbooks.md](./runbooks.md) → API Down, Docker Failure |

**Implementation:** `server/production.js`, `server/app.js`, handlers under `api/` and `server/routes/`.

---

## Supabase (Database + Auth backend)

| Field | Value |
|-------|-------|
| **Owner** | Engineering / DevOps |
| **Criticality** | P1 |
| **Dependencies** | `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, network |
| **Health checks** | `/ready` database ping; schema check with `?details=1`; `node scripts/verify-database.mjs` |
| **Failure modes** | Connection pool exhaustion, missing tables, RLS misconfig, region outage |
| **Recovery** | [runbooks.md](./runbooks.md) → Database Down, Supabase Incident; [database-restore.md](../../runbooks/database-restore.md) |

**Migrations:** `migrations/*.sql` on container boot (`RUN_MIGRATIONS_ON_STARTUP`).

---

## Authentication (Member)

| Field | Value |
|-------|-------|
| **Owner** | Engineering |
| **Criticality** | P1 |
| **Dependencies** | Backend API, Supabase, rate-limit store (DB or memory fallback) |
| **Health checks** | `POST /api/auth/pin-login` smoke; `pin_login_failed` / `pin_login_locked` log rates |
| **Failure modes** | Throttle DB unavailable (`throttle_db_unavailable`), credential stuffing spike, session corruption |
| **Recovery** | [runbooks.md](./runbooks.md) → Authentication Failure |

**UI rule:** Username + PIN only — never email/password login copy.

---

## Payments (Paystack)

| Field | Value |
|-------|-------|
| **Owner** | Engineering / Finance Ops |
| **Criticality** | P1 |
| **Dependencies** | `PAYSTACK_SECRET_KEY`, webhook route, DB ledger, Resend (confirmation email) |
| **Health checks** | `/ready` paystack flag; `GET /api/diagnostics/paystack-connectivity`; webhook success rate |
| **Failure modes** | Webhook signature failure (`payment_webhook_failed`), verify timeout, fulfillment lag |
| **Recovery** | [payment-recovery.md](../../runbooks/payment-recovery.md); [runbooks.md](./runbooks.md) → Payment Failure |

---

## Storage (Supabase Storage)

| Field | Value |
|-------|-------|
| **Owner** | Engineering |
| **Criticality** | P1 |
| **Dependencies** | Supabase, service role, bucket policies |
| **Health checks** | `/ready` photoStorage; upload smoke test |
| **Failure modes** | Bucket misconfig, quota exceeded, orphaned objects |
| **Recovery** | [storage-restore.md](../../runbooks/storage-restore.md); [runbooks.md](./runbooks.md) → Storage Failure |

---

## Signal Concierge

| Field | Value |
|-------|-------|
| **Owner** | Operations / Engineering |
| **Criticality** | P2 |
| **Dependencies** | DB persistence, payments, notifications, consultant assignment |
| **Health checks** | Concierge queue depth; application processing latency; admin `/hard/operations` |
| **Failure modes** | Queue backlog, assignment engine stall, persistence gap |
| **Recovery** | Operations Center triage; `npm run test:operations-center` |

---

## Operations Center

| Field | Value |
|-------|-------|
| **Owner** | Operations |
| **Criticality** | P2 |
| **Dependencies** | Admin auth, DB, internal APIs |
| **Health checks** | Admin login; operations dashboards load |
| **Failure modes** | Admin session expiry, stale assignment data |
| **Recovery** | Admin restart not required — fix underlying API/DB |

---

## Executive Dashboard

| Field | Value |
|-------|-------|
| **Owner** | Founder / Operations |
| **Criticality** | P3 |
| **Dependencies** | Admin auth, aggregated DB views |
| **Health checks** | Dashboard load; data freshness |
| **Failure modes** | View security definer issues; stale aggregates |
| **Recovery** | `/api/diagnostics/view-security`; admin remount |

---

## Notifications (Push)

| Field | Value |
|-------|-------|
| **Owner** | Engineering |
| **Criticality** | P2 |
| **Dependencies** | Firebase (`FIREBASE_*`, service account JSON) |
| **Health checks** | Firebase fields in `/ready?details=1`; push delivery rate |
| **Failure modes** | Invalid FCM credentials, token expiry, silent drop |
| **Recovery** | [runbooks.md](./runbooks.md) → Notification Failure |

---

## Email (Resend)

| Field | Value |
|-------|-------|
| **Owner** | Engineering |
| **Criticality** | P1 (signup) / P2 (transactional) |
| **Dependencies** | `RESEND_API_KEY`, Supabase service role (signup provisioning) |
| **Health checks** | `/ready` signupEmail; `signupEmailTrace` in detailed ready |
| **Failure modes** | API key rotation, domain verification lapse, rate limits |
| **Recovery** | [runbooks.md](./runbooks.md) → Notification Failure |

---

## WhatsApp (SendChamp)

| Field | Value |
|-------|-------|
| **Owner** | Engineering / Operations |
| **Criticality** | P2 |
| **Dependencies** | `SENDCHAMP_API_KEY`, sender config |
| **Health checks** | `sendchamp` / `sendchampTrace` in `/ready?details=1` |
| **Failure modes** | Sender not approved, template rejection, API outage |
| **Recovery** | [runbooks.md](./runbooks.md) → Notification Failure |

---

## Calendar (Google)

| Field | Value |
|-------|-------|
| **Owner** | Engineering |
| **Criticality** | P2 |
| **Dependencies** | Google Calendar OAuth env |
| **Health checks** | Consultation scheduling smoke; calendar env completeness in logs |
| **Failure modes** | OAuth token expiry, scope revocation |
| **Recovery** | [runbooks.md](./runbooks.md) → Calendar Failure |

---

## Zoom

| Field | Value |
|-------|-------|
| **Owner** | Engineering |
| **Criticality** | P2 |
| **Dependencies** | Zoom meeting env vars |
| **Health checks** | Meeting link generation in consultation flow |
| **Failure modes** | API key invalid, rate limits |
| **Recovery** | [runbooks.md](./runbooks.md) → Calendar Failure (shared consultation path) |

---

## Google Meet

| Field | Value |
|-------|-------|
| **Owner** | Engineering |
| **Criticality** | P3 |
| **Dependencies** | Google Meet env |
| **Health checks** | Standalone Meet link generation |
| **Failure modes** | Incomplete env — service-unavailable responses |
| **Recovery** | Fallback to Zoom or manual link (operations) |

---

## Deep Links

| Field | Value |
|-------|-------|
| **Owner** | Engineering |
| **Criticality** | P2 |
| **Dependencies** | `assetlinks.json`, Android manifest, HTTPS cert |
| **Health checks** | [deep-link-verification.md](../../releases/checklists/deep-link-verification.md) |
| **Failure modes** | Domain not associated (Play Console), fingerprint mismatch |
| **Recovery** | [runbooks.md](./runbooks.md) → Deep Link Failure |

---

## Android

| Field | Value |
|-------|-------|
| **Owner** | Engineering |
| **Criticality** | P1 (installed base) |
| **Dependencies** | Capacitor web assets, Play signing, deep links |
| **Health checks** | `npm run android:verify-assets`; Play crash-free rate |
| **Failure modes** | Stale dist in AAB, deep link regression, ANR |
| **Recovery** | [runbooks.md](./runbooks.md) → Android Release Failure |

---

## PWA

| Field | Value |
|-------|-------|
| **Owner** | Engineering |
| **Criticality** | P2 |
| **Dependencies** | Service worker, cache version sync |
| **Health checks** | SW update; `CACHE_VERSION` in build |
| **Failure modes** | Stale cache after deploy |
| **Recovery** | Redeploy; verify `scripts/sync-cache-version.mjs` |

---

## Admin (Command Center)

| Field | Value |
|-------|-------|
| **Owner** | Engineering |
| **Criticality** | P2 |
| **Dependencies** | Supabase admin auth, `/hard/*` routes |
| **Health checks** | `/hard/auth` login; lazy tab load |
| **Failure modes** | Admin PIN throttle; tab import failures |
| **Recovery** | Check server logs; certification suite |

**Entry:** `/hard/auth` → `AdminConsoleRoot`

---

## CRM / Member data sync

| Field | Value |
|-------|-------|
| **Owner** | Engineering / Operations |
| **Criticality** | P2 |
| **Dependencies** | `/api/member/*`, Supabase |
| **Health checks** | Member dashboard hydration; `test:member-data-auth` |
| **Failure modes** | Partial hydration, stale localStorage |
| **Recovery** | Session bootstrap fixes; member re-login |

---

## Consultants (Workspace / Portal)

| Field | Value |
|-------|-------|
| **Owner** | Operations |
| **Criticality** | P2 |
| **Dependencies** | `/consultant` routes, assignment engine |
| **Health checks** | Consultant portal login; workload cards |
| **Failure modes** | Assignment lag, regional team misconfig |
| **Recovery** | Operations Center reassignment |

---

## Journey Engine

| Field | Value |
|-------|-------|
| **Owner** | Engineering |
| **Criticality** | P2 |
| **Dependencies** | DB persistence, journey archives |
| **Health checks** | `npm run audit:journeys`; journey milestone writes |
| **Failure modes** | Persistence gap, archive index drift |
| **Recovery** | Journey integrity audit; DB repair |

---

## Research / Institute / Foundation (Public)

| Field | Value |
|-------|-------|
| **Owner** | Content / Engineering |
| **Criticality** | P4 |
| **Dependencies** | Static routes, SEO |
| **Health checks** | `npm run seo:validate`; public route 200s |
| **Failure modes** | SEO regression, broken internal links |
| **Recovery** | Content fix deploy |

---

## Future AI Workspace

| Field | Value |
|-------|-------|
| **Owner** | Engineering (TBD) |
| **Criticality** | P4 (future) |
| **Dependencies** | TBD — LLM provider, rate limits, audit logging |
| **Health checks** | TBD |
| **Failure modes** | TBD |
| **Recovery** | TBD — feature flag disable |

---

## Dependency map

```text
                    ┌──────────────┐
                    │   Coolify    │
                    │   Docker     │
                    └──────┬───────┘
                           │
              ┌────────────▼────────────┐
              │     Backend API       │
              │  /health  /ready      │
              └─┬───┬───┬───┬───┬────┘
                │   │   │   │   │
     ┌──────────┘   │   │   │   └──────────┐
     ▼              ▼   ▼   ▼              ▼
 Supabase      Paystack Resend SendChamp  Firebase
 (DB+Storage)                              (Push)
     │
     ├──► Auth / Member / Journey / Concierge
     │
     └──► Admin / Operations / Executive Dashboard

 External: Google Calendar · Zoom · Google Meet · DNS · SSL
 Clients:  Web/PWA · Android · Public SEO pages
```

---

## Related

- [health-checks.md](./health-checks.md)
- [alerts.md](./alerts.md)
- [dashboards.md](./dashboards.md)
- [../runbooks/README.md](../../runbooks/README.md)
