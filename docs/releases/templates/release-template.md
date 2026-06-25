# BamSignal Release Record

> Copy this file to `docs/releases/history/YYYY-MM-DD-vX.Y.Z.md` (or `docs/releases/rc/` for release candidates).  
> Complete **Release Information** and **Rollback Plan** before production deploy.  
> See [Release Management System](../README.md) for lifecycle and naming conventions.

---

## Release Information

| Field | Value |
|-------|-------|
| **Release Name** | |
| **Release Version** | |
| **Release Candidate** | RC-0 / N/A |
| **Release Date** | YYYY-MM-DD |
| **Build Timestamp** | ISO-8601 UTC |
| **Git Commit** | `<full-sha>` |
| **Git Branch** | `main` |
| **Docker Image** | Coolify build from commit SHA (see [deployment recovery](../../runbooks/deployment-recovery.md)) |
| **Supabase Project** | |
| **Database Schema Version** | Latest applied migration in `migrations/` (e.g. `0020_institutional_readiness_verification.sql`) |
| **Android Version** | `versionName` from `android/app/build.gradle` |
| **Android Version Code** | `versionCode` from `android/app/build.gradle` |
| **Web Version** | `package.json` version + Vite build hash |
| **API Version** | Server bundle commit / `/ready` schema payload |
| **Environment** | Production / Staging |
| **Production URL** | https://bamsignal.com |
| **Staging URL** | |
| **Release Engineer** | |
| **Deployment Window** | |
| **Maintenance Window** | None / YYYY-MM-DD HH:MM–HH:MM WAT |

---

## Executive Summary

### Purpose

<!-- Why this release exists -->

### Business Impact

<!-- Revenue, growth, compliance, or operational impact -->

### Engineering Summary

<!-- High-level technical changes (2–5 sentences) -->

### User Impact

<!-- What members, admins, or public visitors will notice -->

### Risk Level

<!-- Low / Medium / High / Critical — with one-line justification -->

---

## Features

### Major Features

-

### Enhancements

-

### Performance

-

### Security

-

### Infrastructure

-

### Architecture

-

---

## Bug Fixes

### Critical

-

### Major

-

### Minor

-

### UI

-

### Backend

-

### Database

-

### Infrastructure

-

---

## Migration

### Database

- [ ] Migrations reviewed (`migrations/*.sql`)
- [ ] Supabase migrations reviewed (`supabase/migrations/*.sql`) if applicable
- [ ] Rollback SQL documented (if irreversible)

### Environment Variables

- [ ] `.env.example` updated
- [ ] Coolify buildtime vs runtime vars verified (see [deployment rules](../../../.cursor/rules/deployment.mdc))

### Secrets

- [ ] No secrets in git
- [ ] Coolify runtime secrets present for `/ready`

### Docker

- [ ] `Dockerfile` changes reviewed
- [ ] `HEALTHCHECK` / start-period adequate for migrations

### Supabase

- [ ] RLS policies reviewed
- [ ] Storage buckets unchanged or migration documented

### Indexes

-

### Storage

-

### Breaking Changes

<!-- None, or list with migration path -->

---

## Testing

| Check | Command / Method | Result | Notes |
|-------|------------------|--------|-------|
| Build | `npm run build` | ☐ Pass ☐ Fail | |
| Lint | `npm run lint` | ☐ Pass ☐ Fail | |
| Typecheck | `tsc` (via build) | ☐ Pass ☐ Fail | |
| Unit | | ☐ Pass ☐ Fail ☐ N/A | |
| Integration | | ☐ Pass ☐ Fail ☐ N/A | |
| Server Import | `npm run test:server-import` | ☐ Pass ☐ Fail | |
| Source Integrity | `npm run test:source-integrity` | ☐ Pass ☐ Fail | |
| SEO | `npm run seo:validate` | ☐ Pass ☐ Fail ☐ N/A | |
| Android | `npm run android:verify-assets` | ☐ Pass ☐ Fail ☐ N/A | |
| PWA | Manual / Lighthouse | ☐ Pass ☐ Fail ☐ N/A | |
| Manual QA | See Production Verification | ☐ Pass ☐ Fail | |
| Smoke Tests | Post-deploy curl / browser | ☐ Pass ☐ Fail | |
| Regression | | ☐ Pass ☐ Fail ☐ N/A | |

---

## Production Verification

Verify after deploy. Use `GET /ready` for readiness (200 when dependencies configured).

| Surface | Verified | Notes |
|---------|----------|-------|
| Homepage | ☐ | https://bamsignal.com |
| Login | ☐ | Username + PIN only |
| Signup | ☐ | |
| Payments | ☐ | Paystack return path preserved |
| Signal Concierge | ☐ | |
| Operations | ☐ | |
| Notifications | ☐ | Push / email / WhatsApp as applicable |
| Admin | ☐ | |
| Executive Dashboard | ☐ | |
| Database | ☐ | Schema matches migration list |
| Storage | ☐ | Photo upload |
| Android | ☐ | Fresh AAB if shipped |
| iOS (future) | ☐ N/A | |
| Deep Links | ☐ | [Deep link checklist](../checklists/deep-link-verification.md) |
| PWA | ☐ | Service worker cache version bumped |

---

## Rollback Plan

| Field | Value |
|-------|-------|
| **Previous Stable Release** | |
| **Previous Git Commit** | `<full-sha>` |
| **Previous Docker Image** | Redeploy prior Coolify deployment SHA |

### Rollback Procedure

1. Coolify → BamSignal → Deployments → redeploy last successful deployment, **or** `git revert` + push to `main`.
2. Confirm `/health` → 200 and `/ready` → 200.
3. Run smoke tests (homepage, login, payment callback path).
4. Document in `docs/releases/rollback/` using [rollback template](./rollback-template.md).

### Database Rollback

<!-- Forward-only migrations: document manual reversal or restore from backup -->

### Expected Downtime

<!-- e.g. 0–5 minutes container restart -->

### Verification Steps

- [ ] `/ready` returns 200
- [ ] Member login works
- [ ] No elevated error rate (see metrics)

### Emergency Contacts

| Role | Contact |
|------|---------|
| Release Engineer | |
| DevOps / Coolify | control.bamsignal.com |
| Founder | |

Full playbook: [deployment-recovery.md](../../runbooks/deployment-recovery.md)

---

## Operational Metrics

Capture at T+0, T+24h, T+48h, T+7d. Use [metrics template](./metrics-template.md) for detail.

| Metric | T+0 | T+24h | T+48h | T+7d |
|--------|-----|-------|-------|------|
| CPU | | | | |
| Memory | | | | |
| Response Time (p95) | | | | |
| API Latency | | | | |
| Database Connections | | | | |
| Queue Status | | | | |
| Worker Health | | | | |
| Error Rate | | | | |
| Success Rate | | | | |
| Storage Usage | | | | |
| Bandwidth | | | | |

---

## Known Issues

### Open Issues

-

### Deferred Issues

-

### Future Improvements

-

### Monitoring Notes

-

---

## Incident Log

| Time (WAT) | Issue | Severity | Resolution | Owner | Lessons Learned |
|------------|-------|----------|------------|-------|-----------------|
| | | | | | |

For full incidents, use [incident template](./incident-template.md) in `docs/releases/incidents/`.

---

## Risk Register

| Risk | Level | Mitigation |
|------|-------|------------|
| | Low / Medium / High / Critical | |

---

## Approval

| Role | Name | Date | Sign-off |
|------|------|------|----------|
| Engineering | | | ☐ |
| QA | | | ☐ |
| DevOps | | | ☐ |
| Security | | | ☐ |
| Founder | | | ☐ |

**Release Status:** ☐ Draft ☐ Ready ☐ Approved ☐ Released ☐ Hotfix ☐ Rolled Back ☐ Archived

---

## Appendix

### Commits

```text
<!-- git log --oneline <previous-tag>..<this-commit> -->
```

### Pull Requests

-

### Database Scripts

<!-- List migration files applied -->

### Artifacts

| Artifact | Location |
|----------|----------|
| Web build | Coolify container `dist/` |
| Android AAB | Google Play Console upload |
| Docker image | Coolify deployment for commit SHA |

### Deployment Logs

<!-- Coolify deployment ID / link -->

### Screenshots

<!-- Post-deploy verification captures -->

### Monitoring Links

| System | URL |
|--------|-----|
| Production | https://bamsignal.com |
| Readiness | https://bamsignal.com/ready |
| Coolify | https://control.bamsignal.com |
| Supabase | Dashboard project URL |
