# System Architecture

BamSignal is a Nigerian-first social discovery platform with a human-led Signal Concierge™ matchmaking layer, institutional admin tooling, and optional Capacitor mobile shells.

**Production URL:** https://bamsignal.com  
**Deploy platform:** Coolify (self-hosted Docker) — not Vercel  
**Canonical server entry:** `node server/production.js`

---

## High-level topology

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser / Capacitor                       │
│  React 18 + Vite SPA (dist/) — single bundle, client routing     │
└───────────────┬───────────────────────────────┬─────────────────┘
                │ static assets + SPA fallback   │ /api/* JSON
                ▼                                ▼
┌───────────────────────────┐    ┌──────────────────────────────┐
│  Express (server/app.js)  │───▶│  Postgres via DATABASE_URL   │
│  security headers, CORS   │    │  (Supabase-managed Postgres) │
│  observability middleware │    └──────────────────────────────┘
└───────────────┬───────────┘
                │
    ┌───────────┼───────────┬──────────────┬─────────────┐
    ▼           ▼           ▼              ▼             ▼
 Paystack    Resend     Sendchamp    Supabase       Firebase
 (payments)  (email)    (WhatsApp)   Storage        (push, opt)
```

---

## Repository layout

| Path | Responsibility |
|------|----------------|
| `src/` | React SPA — member app, public marketing, admin (`/hard`), consultant portal |
| `server/` | Express app factory (`app.js`), production bootstrap (`production.js`), domain services |
| `api/` | HTTP handlers mounted by Express (`mountHandler`) — auth, member, admin, diagnostics |
| `shared/` | Code shared between client build and server where needed |
| `public/` | Static assets, service worker (`sw.js`), robots, generated sitemap |
| `migrations/` | Numbered SQL migrations applied via `npm run migrate` |
| `supabase/migrations/` | Supabase-targeted SQL (security fixes, parity with `migrations/`) |
| `scripts/` | Build, audit, certification tests (`test:*`), Android release |
| `android/`, `ios/` | Capacitor native projects |
| `docs/runbooks/` | Operational playbooks (backup, restore, deployment recovery) |

### `src/` conventions

| Area | Location |
|------|----------|
| Pages | `src/pages/` |
| Member components | `src/components/` |
| Admin / institutional UI | `src/components/admin/<center>/` |
| Route constants | `src/constants/` |
| Pure business logic | `src/utils/*Logic.ts`, `*Engine.ts` |
| Types | `src/types/` |
| Member design tokens | `src/styles/member-fintech.css` (`--bs-*`) |
| Institutional dashboards | `src/styles/institutional-page.css` |

---

## System boundaries

### 1. Public marketing surface

**Routes:** `/`, `/blog`, `/cities`, `/nigeria`, `/help`, `/safety`, `/features`, `/premium`, `/faq`, `/guides`, `/compare`, legal pages, BamSignal Institute, Signal Events, careers, support.

**Rules (locked):**

- Must **not** trigger member session restore or onboarding.
- Must **not** render member shell (bottom nav, `/home` dashboard).
- SEO layout only — lazy-loaded via `LazyPublicMarketingRoutes` in `src/App.tsx`.

### 2. Member application

**Routes:** `/home`, `/discover`, `/chats`, `/signals`, `/profile`, `/settings`, `/subscription`, onboarding at **`/onboarding` only**.

**Auth:** Username + PIN (never email/password in login UI).

**Data:** Supabase client for profiles; server APIs for photos, voice, member data sync, Paystack verification.

### 3. Admin command center (`/hard`)

**Entry:** `/hard/auth` → `AdminConsoleRoot` (lazy-loaded).

**Tabs:** Defined by `HardTab` in `src/components/admin/adminConsoleNav.ts`, slugged in `src/constants/hardRoutes.ts`.

**Auth:** Operator email + password via Supabase/admin session; destructive actions require `COMMAND_CENTER_PIN`.

**Performance:** Institutional tab panels are lazy-loaded via `src/components/admin/lazyAdminHubTabs.ts` — admin hub must not eagerly import all centers.

### 4. Consultant portal

**Route prefix:** `/consultant` — `LazyConsultantPortalRoot`.

Consultants see assigned journeys, workload, regional teams — separate from full admin hub.

### 5. HTTP API (`/api/*`)

Mounted in `server/app.js`. Handlers live in `api/` and `server/routes/`.

Key groups:

| Prefix | Purpose |
|--------|---------|
| `/api/auth/*` | PIN login, reset, email codes, identity |
| `/api/member/*` | Member data, photos, voice |
| `/api/paystack/*` | Payment verify + webhook router |
| `/api/consultation-*` | Concierge payments, scheduling, meetings |
| `/api/concierge-*` | Email, WhatsApp, persistence |
| `/api/admin/*` | City home, members, moderation, bootstrap |
| `/api/verify/*` | WhatsApp phone verification, submissions |
| `/api/diagnostics/*` | Paystack connectivity, DB view/function security |

### 6. Health endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /health` | Liveness — process alive |
| `GET /ready` | Readiness — DB, Paystack secret, signup email, photo storage |

Detailed `/ready` requires `x-diagnostics-secret` or admin session (`?details=1`).

---

## Request lifecycle (production)

1. Coolify runs Docker image → `CMD node server/production.js`.
2. `createApp({ distDir })` mounts middleware, APIs, static `dist/`, SPA fallback.
3. `initDatabase()` connects Postgres; optional security view/function fixes run on startup.
4. Client loads `index.html` → React router resolves public vs member vs admin vs consultant.
5. Authenticated calls hit `/api/*` with session/JWT as required per handler.

---

## Data flow (simplified)

### Member signup → discover

1. Signup collects username, PIN, optional email/phone for verification.
2. Server provisions user (`signup` flow) when `RESEND_API_KEY` + Supabase service role configured.
3. Onboarding at `/onboarding` — photos upload-first to Supabase Storage via `/api/member/photos`.
4. Completed users route to `/home`; incomplete to `/onboarding`.

### Premium payment

1. Client preserves `paymentReturnPath`, `paymentProductType`, `paymentProductId`, `paymentReference` before Paystack redirect.
2. Paystack callback → `/api/paystack/verify` or webhook → `payment_fulfillments` ledger.
3. On success: activate product, send purchase email once, redirect to preserved return path.

### Signal Concierge journey

1. Application at public/member Signal Concierge routes.
2. Journey ID assigned (`BS-JR-YYYY-NNNN`) — see [JOURNEY_ENGINE.md](./JOURNEY_ENGINE.md).
3. Consultation payment → scheduling → consultant assignment → introductions → follow-up → archive.
4. Persisted in `concierge_*` Postgres tables via `/api/concierge-persistence`.

---

## Build and artifacts

```bash
npm run build          # sitemap + cache version + tsc + vite build → dist/
npm run test:server-import   # smoke import without runtime secrets
```

Docker builder stage runs `npm run build` and `npm run test:source-integrity`. Runtime secrets are **not** baked into the image.

---

## Related documents

- [DATABASE_ARCHITECTURE.md](./DATABASE_ARCHITECTURE.md)
- [JOURNEY_ENGINE.md](./JOURNEY_ENGINE.md)
- [OPERATIONS_CENTER.md](./OPERATIONS_CENTER.md)
- [PERMISSIONS.md](./PERMISSIONS.md)
- [SECURITY.md](./SECURITY.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [RUNBOOK.md](./RUNBOOK.md)
