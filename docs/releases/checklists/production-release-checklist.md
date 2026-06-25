# Production Release Checklist

Complete before every production deployment. Copy checklist results into the [release record](../templates/release-template.md) **Testing** and **Approval** sections.

**Release:** v________ @ commit `________`  
**Date:** YYYY-MM-DD  
**Release Engineer:** ________________

---

## Code Freeze

- [ ] Release branch locked (`main` only for production)
- [ ] No unrelated commits in release scope
- [ ] Release record created from [release-template.md](../templates/release-template.md)
- [ ] Rollback plan filled (previous stable commit + Coolify deployment)

---

## Dependencies

- [ ] `package-lock.json` committed and reviewed
- [ ] No critical npm advisories unaddressed (or documented in risk register)
- [ ] Node 20 aligned with `Dockerfile`

---

## Tests

- [ ] `npm run build` — pass
- [ ] `npm run lint` — pass
- [ ] `npm run test:server-import` — pass
- [ ] `npm run test:source-integrity` — pass
- [ ] Domain-specific tests run for touched subsystems (see `package.json` scripts)
- [ ] Manual QA on staging (if available)

---

## Security Scan

- [ ] No secrets in diff
- [ ] Admin routes remain separate from member routes
- [ ] Auth copy: username + PIN only (no email/password login UI)
- [ ] `/ready` detailed payload requires diagnostics secret or admin session
- [ ] RLS / permission changes reviewed

---

## Environment Variables

- [ ] `.env.example` matches Coolify configuration
- [ ] Buildtime: `VITE_*` only in Docker build args
- [ ] Runtime: secrets injected at container start (not Docker `ARG`)
- [ ] `RUN_MIGRATIONS_ON_STARTUP` set appropriately

---

## Secrets

- [ ] `DATABASE_URL` present
- [ ] `SUPABASE_SERVICE_ROLE_KEY` present
- [ ] `PAYSTACK_SECRET_KEY` present
- [ ] Signup email provider configured (`RESEND_API_KEY` or equivalent)
- [ ] Photo storage credentials configured
- [ ] `CRON_SECRET`, `ADMIN_ACTION_PIN` as applicable

---

## Supabase

- [ ] Migrations reviewed (`migrations/*.sql`)
- [ ] Supabase dashboard migrations synced if dual-track
- [ ] Connection pool adequate for deploy window
- [ ] Backup taken within 24h ([database-backup.md](../../runbooks/database-backup.md))

---

## Storage

- [ ] Supabase Storage buckets unchanged or migration documented
- [ ] Photo upload smoke path verified on staging
- [ ] CDN / public URL paths unchanged or documented

---

## Payments

- [ ] Paystack live keys (not test) in production Coolify
- [ ] `paymentReturnPath` preservation verified
- [ ] Webhook URL reachable from Paystack
- [ ] Purchase confirmation email path tested
- [ ] `/payment/success` does not dump users on public homepage

---

## Notifications

- [ ] Firebase push config (`VITE_FIREBASE_*` build + admin JSON runtime)
- [ ] Email templates render (`npm run preview:emails` if changed)
- [ ] SendChamp WhatsApp/SMS vars if used

---

## Deep Links

- [ ] [Deep link verification checklist](./deep-link-verification.md) complete (required for Android / payment changes)
- [ ] `assetlinks.json` SHA-256 matches release keystore
- [ ] Custom scheme `com.bamsignal.com://payment-success` tested on device

---

## Android

- [ ] `npm run build` before Capacitor sync
- [ ] `npx cap sync android`
- [ ] `npm run android:verify-assets` — pass
- [ ] `versionCode` / `versionName` bumped in `android/app/build.gradle`
- [ ] Fresh AAB built (`npm run android:release`) — not stale dist
- [ ] Service worker cache version synced

---

## SEO

- [ ] `npm run seo:validate` — pass (if SEO content touched)
- [ ] Sitemap generated (`npm run generate:sitemap`)
- [ ] Public routes do not trigger member restore
- [ ] Meta / structured data unchanged or validated

---

## Robots

- [ ] `robots.txt` correct for production
- [ ] Staging blocked from indexing (if applicable)

---

## Sitemap

- [ ] `sitemap.xml` generated and reachable
- [ ] New public routes included

---

## Analytics

- [ ] Analytics tags unchanged or verified
- [ ] Conversion events fire on signup / payment (if applicable)

---

## Monitoring

- [ ] `/health` and `/ready` endpoints documented for on-call
- [ ] Error rate baseline captured pre-deploy
- [ ] Coolify health check uses `GET /ready`
- [ ] Alerts configured for 503 / deploy failure

---

## Backups

- [ ] Database backup within 24h
- [ ] Storage backup policy confirmed ([storage-backup.md](../../runbooks/storage-backup.md))
- [ ] Restore drill date noted (quarterly recommendation)

---

## Rollback Ready

- [ ] Previous stable git SHA recorded
- [ ] Previous Coolify deployment ID noted
- [ ] [Rollback template](../templates/rollback-template.md) accessible
- [ ] Database rollback strategy documented (forward-only awareness)

---

## Release Approval

| Role | Name | Date | Approved |
|------|------|------|----------|
| Engineering | | | ☐ |
| QA | | | ☐ |
| DevOps | | | ☐ |
| Security | | | ☐ |
| Founder | | | ☐ |

**Status:** ☐ Draft ☐ Ready ☐ Approved

---

## Production Verification

Post-deploy — complete within 30 minutes of go-live.

- [ ] `curl` `/health` → 200
- [ ] `curl` `/ready` → 200
- [ ] Homepage loads (public, no member shell)
- [ ] Login (username + PIN)
- [ ] Signup flow
- [ ] Payment initialize + return path
- [ ] Member home (completed user → `/home`, not onboarding)
- [ ] Admin login (if changed)
- [ ] Photo upload
- [ ] Deep links (if Android release)

Document in release record **Production Verification** table.

---

## Post Deployment Verification

- [ ] Coolify deployment logs clean
- [ ] No spike in 5xx errors
- [ ] Migrations applied (`/ready` schema ok)
- [ ] Metrics snapshot T+0 filed ([metrics-template.md](../templates/metrics-template.md))

---

## 24 Hour Monitoring

- [ ] Error rate within baseline
- [ ] Payment success rate normal
- [ ] No member session hydration regressions
- [ ] Support tickets reviewed
- [ ] Metrics snapshot T+24h filed

---

## 48 Hour Monitoring

- [ ] Android crash-free rate stable (if AAB shipped)
- [ ] Cron jobs executed successfully
- [ ] Metrics snapshot T+48h filed

---

## 7 Day Review

- [ ] Release record marked **Released** or **Archived**
- [ ] [history/index.md](../history/index.md) updated
- [ ] Known issues triaged
- [ ] Metrics snapshot T+7d filed
- [ ] Lessons learned added to release record
- [ ] Move to [archive/](../archive/) if release cycle complete

---

## Quick commands

```bash
npm run build
npm run test:server-import
npm run test:source-integrity
npm run seo:validate          # if SEO touched
npx cap sync android          # if Android touched
npm run android:verify-assets # if Android touched
```

Deploy: push to `main` → Coolify rebuilds from `Dockerfile`. See [deployment rules](../../../.cursor/rules/deployment.mdc).
