# Founder Launch Book™

**Version:** 1.0.0  
**Edition:** P0 Launch Operations  
**Generated:** 2026-06-26T17:56:27.050Z  
**Repository commit:** `a9fd4d4`  
**Production URL:** https://bamsignal.com  
**Control plane:** https://control.bamsignal.com (Coolify)

---

## Table of contents

1. [Architecture Overview](#architecture-overview)
2. [Infrastructure](#infrastructure)
3. [Deployment Process](#deployment-process)
4. [Rollback Procedure](#rollback-procedure)
5. [Production Environments](#production-environments)
6. [Secrets Management](#secrets-management)
7. [Monitoring](#monitoring)
8. [Alert Handling](#alert-handling)
9. [Incident Response](#incident-response)
10. [Support Workflow](#support-workflow)
11. [Consultant Operations](#consultant-operations)
12. [Release Process](#release-process)
13. [Backup and Recovery](#backup-and-recovery)
14. [Database Maintenance](#database-maintenance)
15. [Android Release Process](#android-release-process)
16. [Play Store Process](#play-store-process)
17. [Feature Flags](#feature-flags)
18. [Remote Config](#remote-config)
19. [Operations Dashboard Guide](#operations-dashboard-guide)
20. [Executive Dashboard Guide](#executive-dashboard-guide)
21. [Emergency Contacts](#emergency-contacts)
22. [Launch Checklist](#launch-checklist)
23. [First 30-Day Operations Plan](#first-30-day-operations-plan)

---

<!-- chapter:architecture-overview -->

<a id="architecture-overview"></a>

# Architecture Overview

BamSignal is a Nigerian-first social discovery platform delivered as a **single deployable unit**: a Vite-built React SPA plus an Express API in one Docker container.

## High-level diagram

```
Members / Public web ──► https://bamsignal.com
                              │
                    ┌─────────┴─────────┐
                    │  Express (Node)   │
                    │  server/app.js    │
                    ├─────────┬─────────┤
                    │  SPA    │  API    │
                    │  dist/  │ /api/*  │
                    └────┬────┴────┬────┘
                         │         │
              PostgreSQL (Supabase) │ Paystack, Resend, SendChamp, Firebase
```

## Core layers

| Layer | Location | Responsibility |
|-------|----------|----------------|
| Public marketing | `src/pages`, SEO routes | Homepage, blog, cities, legal — no member restore |
| Member app | `/home`, `/discover`, `/chats`, etc. | Username + PIN auth, compact fintech UI |
| Onboarding | `/onboarding` only | Incomplete users routed here; never inside `/home` |
| Admin / Hard console | `/hard/*` | Operations, certification, executive dashboards |
| Consultant portal | `/consultant/*` | Matchmaker and concierge workflows |
| API | `api/`, `server/routes/` | Auth, member data, payments, diagnostics |
| Android | `android/`, Capacitor | WebView shell over synced `dist/` assets |

## Auth model

- **Login UI:** username + PIN only (never email/password in member login).
- **Signup:** may collect email/phone for verification; PIN is the credential.
- **Sessions:** server-validated member tokens; public routes must not trigger member restore.

## Routing locks (do not break)

- Public routes (`/`, `/blog`, `/premium`, etc.) never show onboarding or member shell.
- Completed users → `/home`; incomplete → `/onboarding`.
- Paystack returns preserve `paymentReturnPath` — never dump users on public homepage after payment.

## Key entrypoints

| File | Role |
|------|------|
| `server/production.js` | Process entry (Docker, Coolify, `npm start`) |
| `server/app.js` | Canonical route mounting |
| `src/main.tsx` | Client bootstrap |
| `Dockerfile` | Build + healthcheck |

---

<!-- chapter:infrastructure -->

<a id="infrastructure"></a>

# Infrastructure

## Production hosting

| Component | Provider | URL / access |
|-----------|----------|--------------|
| Application | Coolify (self-hosted) | https://control.bamsignal.com |
| Public site | Coolify → Docker | https://bamsignal.com |
| Database | Supabase Postgres | Dashboard + `DATABASE_URL` |
| Object storage | Supabase Storage | Profile/cover photos, voice |
| Payments | Paystack | Dashboard + webhooks |
| Email | Resend | Transactional + signup |
| SMS/WhatsApp OTP | SendChamp (optional) | Verification flows |
| Push (optional) | Firebase | `VITE_FIREBASE_*` + service account |
| Source control | GitHub | `github.com/bamsignalhq/bamsignal` |

**Do not use Vercel** — `.vercel/` is legacy.

## Container model

- **Image:** multi-stage `Dockerfile`
  - Builder: `npm run build` + source integrity smoke
  - Runner: `node server/production.js` on port 3000
- **Health:** Docker `HEALTHCHECK` hits `GET /ready` (not `/health` alone).
- **Static assets:** `dist/` served by Express; service worker at `public/sw.js` with `CACHE_VERSION`.

## Network expectations

- TLS terminates at Coolify / reverse proxy.
- `www.bamsignal.com` redirects to apex.
- Paystack webhooks must reach production (`/api/paystack/webhook` and aliases).

## External dependencies (readiness)

`/ready` requires all of:

1. Database connected (`DATABASE_URL`)
2. Paystack secret configured
3. Signup email path (Resend + Supabase service role)
4. Photo storage configured

Until ready, Coolify may mark the container unhealthy — this is intentional.

---

<!-- chapter:deployment-process -->

<a id="deployment-process"></a>

# Deployment Process

Standard path: **push to `main` → Coolify webhook rebuild → verify health.**

## Pre-push checklist (local)

```bash
npm run build
npm run test:server-import
npm run test                    # full certification suite
```

Optional before major releases:

```bash
npm run certify:rc
npm run smoke:production
npm run certify:e2e             # requires DATABASE_URL + DIAGNOSTICS_SECRET
```

## Deploy steps

1. Commit to `main` on `github.com/bamsignalhq/bamsignal`.
2. Coolify rebuilds from `Dockerfile` (webhook). Confirm build logs show:
   - `npm run build` success
   - `test:source-integrity` pass in builder stage
3. Container starts `node server/production.js`.
4. Verify post-deploy:

```bash
curl -s https://bamsignal.com/health
curl -s -o /dev/null -w "%{http_code}\n" https://bamsignal.com/ready
npm run smoke:production
```

5. If webhook missed: **manual redeploy** in Coolify UI.

## Build-time vs runtime env

| Scope | Where | Examples |
|-------|-------|----------|
| Buildtime ON | Docker `ARG`, `VITE_*` | `VITE_SUPABASE_URL`, `VITE_PAYSTACK_PUBLIC_KEY` |
| Runtime only | Coolify env at start | `DATABASE_URL`, `PAYSTACK_SECRET_KEY`, `RESEND_API_KEY` |

Never pass runtime secrets as Docker build args.

## Database migrations

When schema changes:

```bash
# Against production DATABASE_URL from secure shell
npm run migrate
npm run verify:database
```

Run migrations before or immediately after deploy when SQL changed.

## Android (separate track)

See chapters **Android Release Process** and **Play Store Process**. Web deploy does not publish mobile builds.

---

<!-- chapter:rollback-procedure -->

<a id="rollback-procedure"></a>

# Rollback Procedure

BamSignal has **no separate image registry** — rollback means redeploying a known-good git commit.

## Application rollback (preferred)

### Option A — Coolify redeploy

1. Open https://control.bamsignal.com → BamSignal service.
2. **Deployments** → select last known-good deployment.
3. **Redeploy** that artifact.
4. Confirm logs: `[bamsignal] Running on http://0.0.0.0:3000`
5. Verify `GET /ready` → 200 and `npm run smoke:production` PASS.

### Option B — Git revert

```bash
git revert <bad-sha>
git push origin main
```

Wait for Coolify rebuild, then verify health and smoke.

## Environment rollback

If a bad secret was introduced:

1. Coolify → Environment variables → restore previous values from password manager history.
2. Restart container (no code change required).
3. `curl -H "x-diagnostics-secret: $SECRET" "https://bamsignal.com/ready?details=1"`

## Database rollback

Schema rollback is **not automatic**. Options:

1. Restore Supabase backup to a point before migration (see **Backup and Recovery**).
2. Ship forward-fix migration if revert SQL was prepared.

**Stop writes** during data-loss suspicion — escalate P0.

## Payment rollback

- Do not delete Paystack ledger rows.
- Use `docs/runbooks/payment-recovery.md` for webhook replay or manual fulfillment with ops approval.
- Confirm member entitlement flags after any payment fix.

## Communication

- P1+: notify founder within 30 minutes.
- Record incident using `docs/releases/templates/incident-template.md`.

---

<!-- chapter:production-environments -->

<a id="production-environments"></a>

# Production Environments

## Environment matrix

| Environment | URL | Purpose | Data |
|-------------|-----|---------|------|
| **Production** | https://bamsignal.com | Live members | Real Postgres, live Paystack |
| **Staging** (if configured) | Operator-defined | Pre-prod QA | Must not point at production DB |
| **Local dev** | `npm run dev` | Engineering | `.env` local / dry-run |

Full matrix: `docs/operations/environment/environment-matrix.md`

## Production characteristics

- Coolify injects runtime secrets at container start.
- `/health` always 200 when process is up (liveness).
- `/ready` 200 only when DB + Paystack + signup email + photo storage are OK.
- `ADMIN_BOOTSTRAP_ENABLED=false` and `LEGACY_SETUP_ENABLED=false` in production.

## Promotion rules

1. Staging must use **separate** `DATABASE_URL` from production.
2. Paystack keys must be same mode (both live or both test) — never mix.
3. Run `npm run certify:drift` before promoting env changes.
4. Document every Coolify change in release notes.

## Verification after env change

```bash
curl -s -H "x-diagnostics-secret: $DIAGNOSTICS_SECRET" \
  "https://bamsignal.com/ready?details=1" | jq .
```

Checklist: `docs/operations/environment/verification-checklist.md`

## Build identity

Each web build embeds `meta name="bamsignal-build"` (CACHE_VERSION). After deploy, confirm marker changed on homepage HTML to detect stale CDN or service worker issues.

---

<!-- chapter:secrets-management -->

<a id="secrets-management"></a>

# Secrets Management

## Golden rules

1. **Never commit secrets** to git (including `.env`).
2. Store canonical values in a **password manager** + Coolify runtime env.
3. Buildtime Docker args: **public `VITE_*` only**.
4. Rotate using `docs/operations/environment/rotation-policy.md`.

## Canonical secret locations

| Secret | Runtime env | Notes |
|--------|-------------|-------|
| Postgres | `DATABASE_URL` | Supabase connection string |
| Supabase admin | `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL` | Signup email, admin ops |
| Paystack | `PAYSTACK_SECRET_KEY`, webhook secret | Live mode in production |
| Email | `RESEND_API_KEY` | Signup + purchase emails |
| OTP messaging | `SENDCHAMP_*` | WhatsApp/SMS if enabled |
| Firebase admin | `FIREBASE_SERVICE_ACCOUNT_JSON` | Push notifications |
| Diagnostics | `CRON_SECRET`, `DIAGNOSTICS_SECRET` | `/ready?details=1`, cron routes |
| Admin PIN | `COMMAND_CENTER_PIN`, `ADMIN_ACTION_PIN` | Hard console access |

Full list: `.env.example` and `docs/operations/environment/required-secrets.md`

## Duplicate / alias variables

Use canonical names only. Aliases must match or be unset:

- Paystack public: `VITE_PAYSTACK_PUBLIC_KEY`
- Supabase URL: `SUPABASE_URL` at runtime
- Service role: `SUPABASE_SERVICE_ROLE_KEY`

Drift detection: `npm run certify:drift`

## Access control

- Coolify: founder + designated DevOps only.
- Supabase: least-privilege dashboard users.
- Paystack: separate dashboard logins; webhook secret rotated on compromise.

## If a secret leaks

1. Rotate immediately in provider dashboard.
2. Update Coolify runtime env.
3. Restart container.
4. Record security incident (P1 if production exposed).

---

<!-- chapter:monitoring -->

<a id="monitoring"></a>

# Monitoring

## Health endpoints

| Endpoint | Type | Pass criteria |
|----------|------|---------------|
| `GET /health` | Liveness | 200, `{ ok: true, service: "bamsignal" }` — no dependency fields |
| `GET /ready` | Readiness | 200 when DB + Paystack + signup email + photos OK |
| `HEAD /health`, `HEAD /ready` | Probes | Same status codes, no body |

Detailed readiness: `GET /ready?details=1` with `x-diagnostics-secret` or admin session.

## Structured logs

Service: `server/services/observability.js`

| Event | Meaning |
|-------|---------|
| `ready_check_failed` | Container not production-ready |
| `pin_login_failed` | Auth failure |
| `pin_login_locked` | Throttle lockout |
| `payment_webhook_failed` | Paystack webhook issue |
| `throttle_db_unavailable` | Rate limit DB fallback to memory |

Logs include `requestId` / `correlationId`. Sensitive fields redacted.

## Admin monitoring surfaces

| Surface | Path |
|---------|------|
| System Health | `/hard/system-health` |
| Monitoring Center | `/hard/monitoring` |
| Production Observability | `/hard/observability` |
| Platform Health | `/hard/platform-health` |
| Performance Center | `/hard/performance` |
| Institutional Readiness | `/hard/readiness` |

## Automated verification

```bash
npm run test                 # certification suite
npm run smoke:production     # post-deploy HTTP smoke
npm run test:monitoring
npm run test:system-health
```

Coolify health check must target **`/ready`**, not `/health` alone.

See also: `MONITORING.md`, `docs/operations/monitoring/observability-architecture.md`

---

<!-- chapter:alert-handling -->

<a id="alert-handling"></a>

# Alert Handling

## Recommended alert signals

| Signal | Threshold | Severity | First action |
|--------|-----------|----------|--------------|
| `/ready` != 200 | 2 consecutive failures | P0 | Check Coolify + Supabase + secrets |
| `/health` down | Any | P0 | Container crash — restart / rollback |
| `pin_login_failed` spike | >3× baseline 15 min | P1 | DB connectivity, abuse review |
| `payment_webhook_failed` | Any sustained | P1 | Paystack dashboard + webhook secret |
| Error rate 5xx | >1% 10 min | P1 | Logs + recent deploy |
| Disk / memory | Host alerts | P2 | Coolify host capacity |

Full catalog: `docs/operations/monitoring/alerts.md`

## Alert response workflow

1. **Acknowledge** within SLA (15 min for P1).
2. **Triage** using `RUNBOOK.md` quick table.
3. **Mitigate** — rollback, restart, or failover playbook.
4. **Communicate** — founder for P1/P2; status updates every 30 min for P1.
5. **Resolve** — verify `smoke:production` and member smoke paths.
6. **Document** — incident template + postmortem if required.

## Diagnostics commands

```bash
curl -s https://bamsignal.com/health | jq .
curl -s -H "x-diagnostics-secret: $SECRET" \
  "https://bamsignal.com/ready?details=1" | jq .
```

API diagnostics (secret required):

- `/api/diagnostics/paystack-connectivity`
- `/api/diagnostics/view-security`
- `/api/diagnostics/function-security`

## False positives

- `/ready` 503 immediately after deploy: check `start-period` in Dockerfile healthcheck.
- Memory throttle logs during DB blip: restore DB before disabling throttle.

---

<!-- chapter:incident-response -->

<a id="incident-response"></a>

# Incident Response

Severity definitions align with `docs/operations/monitoring/incident-escalation.md`.

## Severity summary

| Level | Name | Example | Acknowledge |
|-------|------|---------|-------------|
| P1 | Critical | Site down, data loss risk | < 15 min |
| P2 | High | Payments broken, signup email down | < 30 min |
| P3 | Medium | Admin tab broken, workaround exists | < 4 hours |
| P4 | Low | Copy typo, log noise | Next business day |

## P1 playbook (site down)

1. Coolify → container status + logs.
2. Check `GET /ready` and `GET /health`.
3. Recent deploy? → rollback (see **Rollback Procedure**).
4. DB issue? → Supabase status + `DATABASE_URL`.
5. Assign Incident Commander; founder notified within 30 min.
6. Post-incident record mandatory within 5 business days.

## P1 playbook (payment incident)

1. Paystack dashboard — transaction state.
2. Query `payment_fulfillments` by reference.
3. Follow `docs/runbooks/payment-recovery.md`.
4. Confirm entitlement + purchase email sent once.

## P1 playbook (auth spike)

1. Search logs: `pin_login_failed`, `pin_login_locked`.
2. Restore DB if `throttle_db_unavailable`.
3. Do **not** disable throttle without security review.

## Incident record

Use `docs/releases/templates/incident-template.md`. Store under `docs/releases/incidents/`.

## Postmortem requirements

P1: required. P2: recommended. Include timeline, root cause, corrective actions, and whether rollback was used.

---

<!-- chapter:support-workflow -->

<a id="support-workflow"></a>

# Support Workflow

## Channels

| Channel | Surface | Owner |
|---------|---------|-------|
| In-app support | Member settings → help paths | Support team |
| Admin Support Center | `/hard/support` | Support + Operations |
| Public help | `/help`, Support Center pages | Content + Support |
| Safety reports | Report/block flows → moderation | Safety team |

## Admin Support Center (`/hard/support`)

Permissions: `ManageOperations`, Support roles (see `permissions.ts`).

Typical workflow:

1. **Triage** incoming tickets — assign severity and category.
2. **Verify** member identity via admin tools (never share PINs).
3. **Resolve** or escalate to Operations / Safety / Engineering.
4. **Close** with internal note; member-facing copy must not expose admin jargon.

## Member-facing rules

- Login support: username + PIN only — never ask for email password.
- Payment issues: preserve `paymentReturnPath`; verify Paystack reference.
- Photo issues: upload-first policy unless true upload failure.

## Escalation matrix

| Issue type | Escalate to |
|------------|-------------|
| Payment not fulfilled | Operations + `payment-recovery` runbook |
| Harassment / safety | `/hard/safety`, moderation queue |
| Account lockout abuse | Security + rate-limit review |
| Bug / outage | Engineering + incident process |
| Concierge journey | Signal Concierge Operations (`/hard/concierge/operations`) |

## SLA guidance

- P1 member-visible outage: communicate via status channel when platform-wide.
- Individual tickets: target first response < 24h business hours at launch.

---

<!-- chapter:consultant-operations -->

<a id="consultant-operations"></a>

# Consultant Operations

Signal Concierge and matchmaker workflows are coordinated through institutional admin surfaces.

## Primary surfaces

| Surface | Path | Purpose |
|---------|------|---------|
| Concierge hub | `/hard/concierge` | Consultant dashboard entry |
| Operations Center | `/hard/concierge/operations` | Consultations, payments, scheduling, assignments |
| Journey Intelligence | `/hard/concierge/intelligence` | Pipeline analytics |
| Consultant portal | `/consultant/*` | Day-to-day consultant UI |
| Workforce | `/hard/workforce` | Staffing and roles |
| Academy | `/hard/academy` | Consultant training content |

## Operations Center sections

1. **Consultations** — scheduled sessions across pipeline.
2. **Payments** — consultation fee lifecycle (Paystack).
3. **Scheduling** — calendar, slots, meeting links (Google Meet / Zoom when configured).
4. **Assignment Queue** — unassigned journeys, workload.
5. **Notifications** — delivery queues for concierge comms.
6. **Introductions** — Introduction Engine™ consent pipeline.
7. **Relationship Follow-up** — stewardship and escalations.
8. **Regional Teams** — director coverage and assignments.

## Daily operations rhythm

- Morning: clear assignment queue, review consultations for today.
- Midday: payment exceptions and scheduling conflicts.
- Evening: follow-up tasks and introduction approvals.

## Permissions

Consultant roles are distinct from member accounts. Hard console access requires explicit permissions — see `src/constants/permissions.ts` and governance engine.

## Quality

Consultant quality reviews: `/hard/quality` (Consultant Quality). Escalations with `executive-review` bucket go to leadership.

## Data integrity

Do not fabricate journeys or profiles in production. Use existing engines only; certification E2E uses `cert.bamsignal.com` test emails with diagnostics peek/cleanup.

---

<!-- chapter:release-process -->

<a id="release-process"></a>

# Release Process

## Release types

| Type | Branch | Approval |
|------|--------|----------|
| Standard web | `main` | Release engineer + certification gates |
| Hotfix | `main` (revert-forward) | Founder for P1 |
| Android | `main` + Play Console | Release engineer + asset verification |
| Schema | `main` + migrations | DBA review + backup |

## Standard web release flow

1. **Freeze** scope — no unrelated commits.
2. **Test** locally: `npm run build`, `npm run test`, `npm run test:server-import`.
3. **Certify** (as applicable):
   - `npm run certify:rc` — aggregate gate
   - `npm run certify:security`, `certify:dependencies`, `certify:accessibility`
   - `npm run smoke:production` after deploy
4. **Document** using `docs/releases/templates/release-template.md`.
5. **Push** to `main` → Coolify deploy.
6. **Verify** health + smoke + manual member paths (login, discover, payment return).
7. **Record** release in `docs/releases/history/`.

## Certification commands (reference)

```bash
npm run certify:launch
npm run certify:performance
npm run certify:security
npm run certify:reliability
npm run certify:dependencies
npm run certify:drift
npm run certify:accessibility
npm run certify:founder
npm run certify:rc
```

## Go / no-go

Founder Launch Certification (`npm run certify:founder`) aggregates subsystem scores for board-level decision. RC certification blocks on critical failures.

## Rollback criteria

Rollback immediately if:

- `/ready` fails > 5 minutes post-deploy
- Payment webhook processing broken
- Auth completely blocked
- Data corruption suspected

See **Rollback Procedure**.

---

<!-- chapter:backup-and-recovery -->

<a id="backup-and-recovery"></a>

# Backup and Recovery

BamSignal does **not** ship automated in-repo backup jobs. Operators manage backups via Supabase and documented playbooks.

**Admin UI:** `/hard/disaster-recovery` (Disaster Recovery Center)

## What to back up

| Layer | Priority | Method |
|-------|----------|--------|
| Postgres (users, chats, payments, CRM) | Critical | Supabase automated + `pg_dump` |
| Supabase Auth | Critical | Included in DB dump |
| Storage (photos, voice) | High | Bucket export / mirror |
| Platform config tables | High | DB dump |
| Application code | Medium | GitHub `main` |
| Coolify secrets | Critical | Password manager (not git) |

## Database backup

### Supabase automated

1. Supabase project → Database → Backups.
2. Confirm daily backups (Pro plan).
3. Manual snapshot before risky migrations.

### Manual dump

```bash
export DATABASE_URL='postgresql://...'   # from vault
pg_dump "$DATABASE_URL" \
  --format=custom \
  --file="bamsignal-$(date +%Y%m%d-%H%M%S).dump" \
  --no-owner --no-acl
```

Retention: 30 daily + 12 monthly off-site.

## Recovery

| Scenario | Playbook |
|----------|----------|
| Full DB restore | `docs/runbooks/database-restore.md` |
| Storage restore | `docs/runbooks/storage-restore.md` |
| Bad deploy | `docs/runbooks/deployment-recovery.md` |
| Payment replay | `docs/runbooks/payment-recovery.md` |

After restore: `npm run verify:database`, `npm run migrate`, redeploy, `smoke:production`.

See `BACKUP_RECOVERY.md` for full detail.

---

<!-- chapter:database-maintenance -->

<a id="database-maintenance"></a>

# Database Maintenance

## Schema sources

| Location | Purpose |
|----------|---------|
| `migrations/*.sql` | Application migrations (primary) |
| `supabase/migrations/*.sql` | Supabase-tracked migrations |
| `server/db.js` | Connection, ping, schema check |

## Routine maintenance

| Task | Frequency | Command / action |
|------|-----------|------------------|
| Verify connectivity | Weekly | `npm run verify:database` |
| Migration apply | On release | `npm run migrate` |
| Index review | Quarterly | Supabase advisors + `certify:database` |
| Backup verify | Monthly | Test restore to staging |
| Orphan photos | Monthly | `node scripts/reconcile-photo-orphans.mjs` |
| Audit | Pre-release | `/hard/audit/database` |

## Migration procedure

1. Review SQL in PR — RLS policies included.
2. Backup production (manual snapshot).
3. Apply: `npm run migrate` against production `DATABASE_URL`.
4. Deploy app if code depends on new schema.
5. Verify: `npm run verify:database`, member API smoke.

## Connection pool

- Use Supabase pooler URL for serverless-style bursts if recommended.
- Watch connection count during deploy windows.

## Read-only diagnostics

With `DIAGNOSTICS_SECRET`, certification E2E supports read/peek/cleanup on `cert.bamsignal.com` emails only — not general SQL access.

## Performance certification

```bash
npm run certify:database
```

Reports under `certification/database/reports/`.

## Never in production

- Ad-hoc `DELETE` without backup and approval.
- Disabling RLS without security review.
- Running unreviewed SQL from chat or tickets.

---

<!-- chapter:android-release-process -->

<a id="android-release-process"></a>

# Android Release Process

Android ships as a **Capacitor WebView** over the same `dist/` assets as web. Stale assets are a common failure mode — always verify before AAB upload.

## Preconditions

- Web release built and tested on production URL.
- Upload signing key documented in password manager.
- `public/.well-known/assetlinks.json` SHA-256 matches release keystore.

## Release commands

```bash
npm run build
npx cap sync android
npm run android:verify-assets
npm run android:release
```

`android:release` runs `scripts/build-android-release.mjs` which:

1. Builds fresh web assets.
2. Syncs Capacitor.
3. Verifies Android assets match `dist/` (including `bamsignal-build` meta).
4. Verifies service worker cache version alignment.
5. Produces AAB/APK for Play upload.

## Version bumps

Edit `android/app/build.gradle`:

- `versionCode` — monotonic integer (required by Play).
- `versionName` — user-visible semver.

Sync `src/buildInfo.ts` / cache version via release script.

## Verification gates

| Check | Command |
|-------|---------|
| Assets fresh | `npm run android:verify-assets` |
| Upload key | `npm run android:verify-upload-key` |
| Source integrity | `npm run test:source-integrity:android` |

## Never

- Upload AAB built before latest `npm run build`.
- Commit `android/app/build/` or `.gradle` caches.
- Skip asset verification after web changes.

See `ANDROID_RELEASE_NOTES.md` for release-specific notes.

---

<!-- chapter:play-store-process -->

<a id="play-store-process"></a>

# Play Store Process

## Tracks

| Track | Use |
|-------|-----|
| Internal testing | Engineering smoke on device |
| Closed testing | Trusted testers pre-launch |
| Open testing | Optional wider beta |
| Production | Public Play listing |

## Upload workflow

1. Complete **Android Release Process** — fresh AAB in hand.
2. Google Play Console → BamSignal app.
3. Create new release on target track.
4. Upload AAB; confirm version code is higher than previous.
5. Complete store listing compliance (content rating, data safety).
6. Roll out; monitor Android vitals.

## Signing

- Play App Signing enabled (recommended).
- Upload certificate registered with Play — verify with `npm run android:verify-upload-key`.
- `play-store/` local artifacts are operator tools — **do not commit** private keys or keystores.

## Deep links and payments

Before payment-related releases:

- Complete `docs/releases/checklists/deep-link-verification.md`
- Test `assetlinks.json` on device
- Test Paystack return to preserved member path (not public homepage)

## Post-publish verification

1. Install from Play track on physical device.
2. Login (username + PIN).
3. Discover loads; payment flow opens Paystack and returns correctly.
4. Push notification (if Firebase configured).

## Rollback on Play

- Halt rollout in Play Console.
- Ship fixed AAB with incremented `versionCode`.
- Web-only hotfixes still require new AAB if bundled assets changed.

---

<!-- chapter:feature-flags -->

<a id="feature-flags"></a>

# Feature Flags

BamSignal uses **two flag systems** — do not confuse them.

## 1. Build-time flags (`VITE_*`)

Documented in `docs/operations/environment/feature-flags.md` and `src/constants/featureFlags.ts`.

| Flag | Default | Notes |
|------|---------|-------|
| `VITE_ENABLE_REFERRALS_UI` | false | Referral widget — enable at campaign launch |
| `VITE_ENABLE_IMAGE_MODERATION` | true | Client moderation UX |
| `PHOTO_MODERATION_MODE` | upload_first | Server wins over client |
| `VITE_STORE_SCREENSHOTS` | false | **Never production** |

Changes require rebuild + redeploy (Coolify build args).

## 2. Enterprise Feature Flag Platform (runtime API)

| Item | Location |
|------|----------|
| Admin UI | `/hard/feature-flags` |
| Public API | `GET /api/feature-flags` |
| Server seed | `server/services/featureFlagPlatform.js` |

Key product flags include: `trusted_member`, `signal_concierge`, `voice_vibe`, `communities`, `events`, `ai_matching`, `executive_dashboard`.

### Operations

1. Review flag in admin UI before enabling rollout.
2. Prefer percentage / city scoping over global enable for risky features.
3. Audit trail stored in `feature_flag_audits` table.
4. Post-deploy: confirm `smoke:production` feature-flags check passes.

### Certification

```bash
npm run certify:drift    # env + flag drift
npm run smoke:production # API returns flags array
```

## Governance

- New flags must be documented before merge to `main`.
- Removing a flag requires cleanup of dead code paths.
- Never enable `future_experiments` in production without founder approval.

---

<!-- chapter:remote-config -->

<a id="remote-config"></a>

# Remote Config

Remote configuration supplies tunable product parameters without redeploying client bundles.

## Surfaces

| Surface | Path / endpoint |
|---------|-----------------|
| Admin UI | `/hard/configuration` (Configuration Platform) |
| Public API | `GET /api/remote-config` |
| Server defaults | `server/services/remoteConfig.js` → `REMOTE_CONFIG_SERVER_DEFAULTS` |

## Default keys (examples)

| Key | Purpose |
|-----|---------|
| `signals.free_daily_limit` | Daily signal allowance |
| `messaging.max_messages_per_day` | Chat throttle |
| `discovery.max_profile_photos` | Photo cap |
| `payments.boost_pricing_ngn` | Boost price |
| `verification.otp_cooldown_seconds` | OTP rate limit |
| `notifications.retry_interval_seconds` | Notification retry |
| `notifications.templates` | Template map |

## Change procedure

1. Edit in Configuration Platform admin (or DB `platform_settings` if migrated).
2. Confirm active status and revision.
3. API cache TTL ~60s — allow one minute for propagation.
4. Verify: `curl -s https://bamsignal.com/api/remote-config | jq '.config["signals.free_daily_limit"]'`
5. Run `npm run smoke:production` notifications + remote-config checks.

## Drift detection

```bash
npm run certify:drift
```

Compares Coolify env, remote config, and documented defaults.

## Safety

- Do not set extreme limits in production without staged rollout.
- Payment amounts must match Paystack product configuration.
- Document every production config change in release notes.

---

<!-- chapter:operations-dashboard-guide -->

<a id="operations-dashboard-guide"></a>

# Operations Dashboard Guide

Institutional operations run from the **Hard console** at `/hard/command` (Command Center tab hub).

## Entry and auth

- URL: https://bamsignal.com/hard/auth → `/hard/command`
- Auth: admin username + PIN (`COMMAND_CENTER_PIN` ecosystem)
- Permissions: role-based via `src/constants/permissions.ts`

## Daily operations map

| Need | Go to |
|------|-------|
| Command overview | `/hard/command` |
| Concierge pipeline | `/hard/concierge/operations` |
| Support tickets | `/hard/support` |
| User lookup / moderation | `/hard/users`, `/hard/safety` |
| Payments / finance | `/hard/finance` |
| System health | `/hard/system-health` |
| Live monitoring | `/hard/monitoring` |
| Logs / observability | `/hard/observability` |
| Launch gates | `/hard/rc-certification`, `/hard/launch-certification` |
| Post-deploy smoke | Run `npm run smoke:production`; review failures in terminal |
| Disaster recovery | `/hard/disaster-recovery` |
| Configuration | `/hard/configuration` |
| Feature flags | `/hard/feature-flags` |

## Signal Concierge Operations Center

Path: `/hard/concierge/operations`

Use sections: Consultations → Payments → Scheduling → Assignment Queue → Introductions → Follow-up.

## Certification dashboards

| Dashboard | Path |
|-----------|------|
| Security Cert | `/hard/security-certification` |
| Reliability Cert | `/hard/reliability-certification` |
| Dependency Cert | `/hard/dependency-certification` |
| Accessibility Cert | `/hard/accessibility-certification` |
| RC Cert | `/hard/rc-certification` |
| Founder Cert | `/hard/founder-certification` |

## Tips for new ops leads

1. Start each day with `/ready` and `/hard/system-health`.
2. Keep Coolify and Supabase dashboards pinned.
3. Never share diagnostics secret in Slack — use vault links.
4. Use search in Hard console (keywords on each tab).

---

<!-- chapter:executive-dashboard-guide -->

<a id="executive-dashboard-guide"></a>

# Executive Dashboard Guide

The Executive Dashboard™ provides founder and board-level strategic visibility.

## Access

| Item | Value |
|------|-------|
| Path | `/hard/executive` |
| Brand | Executive Dashboard™ |
| Permission | `ViewExecutiveDashboard` (and related executive roles) |
| Feature flag | `executive_dashboard` (enabled in production seed) |

## Time horizons

Switch views across:

- Today
- 30 days
- 90 days
- 12 months
- Lifetime

## Strategic areas

| Area | Focus |
|------|-------|
| Institution health | Platform stability and readiness scores |
| Growth | Applications, city expansion |
| Journey outcomes | Introductions, relationships, engagements |
| Consultant health | Workforce capacity and quality |
| Communities & events | Community programs |
| Research | Institute and archive metrics |
| Finance | Revenue and payment health |
| Legacy | Long-horizon family / legacy programs |

## Key metrics

Applications, consultations, introductions, relationships, engagements, marriages, legacy families, success stories, cities active, consultants active, revenue.

## How executives should use it

1. **Weekly review** — 30-day view, note `attention` statuses.
2. **Board prep** — export or screenshot lifetime + finance areas; pair with Founder Certification report (`npm run certify:founder`).
3. **Do not** use executive dashboard as real-time incident tool — use `/hard/monitoring` for outages.

## Related surfaces

| Surface | Path |
|---------|------|
| Founder Certification | `/hard/founder-certification` |
| Founder Acceptance (FAT) | `/hard/founder-acceptance` |
| Launch Command | `/hard/launch-command` |
| Business / Finance | `/hard/business`, `/hard/finance` |

Future capabilities documented in `EXECUTIVE_DASHBOARD_FUTURE_KINDS` are not yet implemented — do not promise them externally.

---

<!-- chapter:emergency-contacts -->

<a id="emergency-contacts"></a>

# Emergency Contacts

**Store live contact details in your password manager.** This chapter defines roles and escalation — replace bracketed placeholders with vault entries.

## Internal escalation

| Role | Responsibility | Primary channel | Backup |
|------|----------------|-----------------|--------|
| Founder / CEO | Final go/no-go, P1 comms | [vault: founder phone / Signal] | [vault: email] |
| Release Engineer / On-call | Deploy, rollback, smoke | [vault: on-call rotation] | Secondary engineer |
| Engineering Lead | Architecture, incident commander | [vault] | — |
| Operations Lead | Concierge, support, consultant ops | [vault] | — |
| Safety Lead | Moderation, abuse, legal escalation | [vault] | — |

## Vendor / infrastructure

| Vendor | Use | Access |
|--------|-----|--------|
| Coolify host | Container, env, deploy | https://control.bamsignal.com |
| Supabase | Database, auth, storage | Supabase dashboard + support ticket |
| Paystack | Payments, webhooks | Paystack dashboard + support |
| Resend | Transactional email | Resend dashboard |
| SendChamp | WhatsApp/SMS OTP | SendChamp dashboard |
| Google Play | Android distribution | Play Console |
| GitHub | Source, CI hooks | github.com/bamsignalhq/bamsignal |

## Escalation triggers (call founder)

- P1 outage > 15 minutes
- Suspected data breach or credential leak
- Payment double-charge or widespread fulfillment failure
- Legal / law enforcement request

## Status communication

- Internal: designated incident channel (define in vault).
- External: only founder or delegated comms lead — no engineering Twitter threads during P1.

## Updating this roster

When personnel changes: update vault within 24h, notify on-call rotation, and rebuild this book (`npm run build:founder-launch-book`) if role descriptions change.

---

<!-- chapter:launch-checklist -->

<a id="launch-checklist"></a>

# Launch Checklist

Condensed from `docs/releases/checklists/production-release-checklist.md`. Copy results into release record.

**Release:** v________ @ commit `________`  
**Date:** __________  
**Release Engineer:** __________

## Code freeze

- [ ] `main` only; no unrelated commits
- [ ] Release record from `docs/releases/templates/release-template.md`
- [ ] Rollback commit documented

## Tests

- [ ] `npm run build` — PASS
- [ ] `npm run lint` — PASS
- [ ] `npm run test:server-import` — PASS
- [ ] `npm run test` — PASS (certification suite)
- [ ] `npm run certify:rc` — PASS (major releases)

## Security

- [ ] No secrets in diff
- [ ] Auth UI: username + PIN only
- [ ] Admin routes separate from member routes
- [ ] `/ready?details=1` gated by diagnostics secret

## Environment

- [ ] `.env.example` matches Coolify
- [ ] `DATABASE_URL`, Paystack, Resend, photo storage set
- [ ] `ADMIN_BOOTSTRAP_ENABLED=false`

## Database

- [ ] Migrations reviewed
- [ ] Backup < 24h old
- [ ] `npm run migrate` plan documented

## Payments

- [ ] Paystack **live** keys in production
- [ ] Webhook reachable
- [ ] Purchase confirmation email path tested
- [ ] Payment return path preserved (not public homepage)

## Notifications

- [ ] Firebase push (if used) build + runtime configured
- [ ] Email templates reviewed if changed

## Android (if release includes mobile)

- [ ] `npm run android:verify-assets` — PASS
- [ ] `versionCode` bumped
- [ ] Fresh AAB built
- [ ] Deep link checklist complete
- [ ] `assetlinks.json` SHA matches keystore

## Post-deploy

- [ ] `GET /health` → 200
- [ ] `GET /ready` → 200
- [ ] `npm run smoke:production` — PASS
- [ ] Manual: login, discover, payment return
- [ ] Coolify logs clean (no `ready_check_failed` storm)

## Sign-off

| Role | Name | Date | Approved |
|------|------|------|----------|
| Release Engineer | | | ☐ |
| Operations | | | ☐ |
| Founder | | | ☐ |

---

<!-- chapter:first-30-day-operations-plan -->

<a id="first-30-day-operations-plan"></a>

# First 30-Day Operations Plan

Operational rhythm for the first month after public launch. Adjust thresholds as traffic grows.

## Week 1 — Stabilize

| Day | Focus | Actions |
|-----|-------|---------|
| 1 | Deploy verification | `smoke:production`, manual login/signup, `/ready?details=1` |
| 1–2 | Monitoring baselines | Record normal `/ready` latency, error rates, login volume |
| 2–3 | Support readiness | Staff `/hard/support`, document top 10 FAQs |
| 3–4 | Payment watch | Monitor Paystack + `payment_webhook_failed` logs hourly |
| 4–5 | Consultant ops | Clear Operations Center queue daily |
| 6–7 | First retrospective | Incidents, near-misses, update runbooks |

**Exit criteria:** 7 consecutive days `/ready` 200, smoke PASS, no open P1.

## Week 2 — Harden

- Run `npm run certify:security` and `certify:dependencies`.
- Verify backup restore to staging (tabletop).
- Review feature flags — disable experimental flags.
- Android closed testing track if mobile launched.
- SEO: `npm run seo:validate` if public content changed.

## Week 3 — Optimize

- Review Performance Center (`/hard/performance`) and real-user metrics.
- Tune remote config limits (signals, messages) based on abuse signals.
- Consultant quality sample review (`/hard/quality`).
- Document capacity plan: `docs/operations/monitoring/capacity-planning.md`.

## Week 4 — Institutionalize

- Complete Founder Certification (`npm run certify:founder`) for board record.
- Publish release history entry for launch month.
- Update emergency contacts in vault.
- Schedule monthly: backup test, drift cert, RC cert before major releases.

## Daily standing tasks (all 30 days)

1. `curl` `/ready` + review Coolify container health.
2. Triage support queue.
3. Operations Center — assignments + consultations today.
4. Scan logs for `payment_webhook_failed`, `ready_check_failed`.
5. Confirm smoke suite PASS after any deploy.

## Weekly leadership review

- Executive Dashboard — 30-day view.
- Subsystem certification scores (RC dashboard).
- Growth vs infrastructure headroom.
- Go/no-go for marketing spend increases.

## End of month deliverables

- [ ] Launch postmortem (if any P1/P2)
- [ ] Updated Founder Launch Book chapter edits if process changed
- [ ] `npm run build:founder-launch-book` → commit version bump if material
- [ ] 30-day metrics snapshot for board

---

*End of Founder Launch Book™ v1.0.0*

