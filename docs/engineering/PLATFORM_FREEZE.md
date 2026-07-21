# Platform Freeze — Stankings Ecosystem

**Effective:** Sprint 0.7 (2026-07-21)  
**Status:** Infrastructure baseline **frozen**

After this document, infrastructure engineering is **complete**. Future work should prioritize **product features, reliability, and launch readiness** — not platform redesign.

## Approved stack

| Layer | Technology |
|-------|------------|
| Source control | GitHub |
| CI | GitHub Actions (lint, typecheck, build) |
| Hosting | Hetzner |
| Orchestration | Coolify (`https://control.stankings.com`) |
| Edge & DNS | Cloudflare |
| Database & auth | Supabase (per product project) |
| Email | Resend (+ Sendchamp where applicable) |
| Monitoring | Standard health endpoints + Coolify |

## Approved deployment

- Push to `main` → Coolify webhook → Docker build → container
- **No Vercel.** No alternate production hosts without founder approval.

## Approved engineering standards

| Document | Purpose |
|----------|---------|
| [PLATFORM_STANDARD.md](./PLATFORM_STANDARD.md) | Canonical stack |
| [DEPLOYMENT_STANDARD.md](./DEPLOYMENT_STANDARD.md) | Deploy workflow (see also root `DEPLOYMENT_STANDARD.md`) |
| [ENVIRONMENT_STANDARD.md](./ENVIRONMENT_STANDARD.md) | Shared env vars |
| [HEALTH_STANDARD.md](./HEALTH_STANDARD.md) | Health envelope |
| [LOGGING_STANDARD.md](./LOGGING_STANDARD.md) | Startup logging |
| [PROJECT_IDENTITY.md](./PROJECT_IDENTITY.md) | Application identity |

## What changes require founder approval

- New deployment platform or hosting provider
- New production database or auth provider
- Changes to auth model (username + PIN on BamSignal)
- Member UI redesign (frozen)
- Breaking changes to health endpoint core fields

## What does NOT require platform work

- Product features, bug fixes, performance, SEO content
- Supabase migrations for product schema
- Provider integration updates (Paystack, Squad, etc.)
- Android release builds (follow existing release runbooks)

## Remaining manual ops (not code)

- Supabase Auth redirect cleanup — see Stankings repo `docs/engineering/SUPABASE_REDIRECT_AUDIT.md`
- Coolify env secret parity per product
- DNS/TLS verification after deploy

---

**Platform migration is finished.** Ship product.
