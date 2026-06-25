# Production Environment Report

Generated from the Production Environment Audit™ registry (`src/constants/productionEnvironmentAudit.ts`).  
**Dashboard:** `/hard/production-environment`  
**Verify live:** `GET /ready?details=1` with `x-diagnostics-secret`

---

## Summary

| Status | Count | Meaning |
|--------|-------|---------|
| **Ready** | 11 | Core launch integrations configured in registry with clear env contract |
| **Warning** | 5 | Optional concierge integrations or alias groups needing attention |
| **Critical** | 0 | No registry integration marked critical-missing at code level |

**Overall:** Ready with warnings — core member launch path is gated by `/ready`; concierge scheduling integrations are optional until configured.

---

## Ready

Integrations production-ready at the **code and documentation** level:

| Integration | Status | Notes |
|-------------|--------|-------|
| **Supabase** | Ready | `DATABASE_URL`, `VITE_SUPABASE_*` build, `SUPABASE_SERVICE_ROLE_KEY` runtime, photo buckets |
| **Paystack** | Ready | `PAYSTACK_SECRET_KEY` runtime, `VITE_PAYSTACK_PUBLIC_KEY` build, webhook raw body |
| **Resend** | Ready | `RESEND_API_KEY` + service role + URL for signup email (`isSignupEmailConfigured`) |
| **Storage** | Ready | Supabase `profile-photos` / `cover-photos` via service role |
| **JWT** | Ready | Supabase member bearer tokens — no separate `JWT_SECRET` |
| **Secrets** | Ready | `CRON_SECRET`, `COMMAND_CENTER_PIN`, `COMMAND_CENTER_EMAILS` documented |
| **Deep Links** | Ready | `PUBLIC_APP_URL`, `PAYSTACK_ANDROID_CALLBACK_URL`, assetlinks.json |
| **Android** | Ready | `com.bamsignal.com`, `test:android-app-links` |
| **iOS** | Ready | Capacitor shell, bundled `dist/` — no extra env |
| **PWA** | Ready | Service worker + `CACHE_VERSION` on build |
| **VAPID** | Ready | **Not used** — push via Firebase FCM, not web-push VAPID |
| **Cron Jobs** | Ready | `CRON_SECRET` header-only (`adminAuth.js`) |
| **Webhooks** | Ready | Paystack + Sendchamp verify + optional Telegram identity |

### `/ready` critical gates

Production readiness (`server/services/readiness.js`) requires **all** of:

1. `DATABASE_URL` connected  
2. `PAYSTACK_SECRET_KEY` set  
3. Signup email: `RESEND_API_KEY` + `SUPABASE_SERVICE_ROLE_KEY` + Supabase URL  
4. Photo storage: Supabase service role configured  

---

## Warning

| Integration | Status | Action in Coolify |
|-------------|--------|-------------------|
| **Sendchamp** | Warning | Set `SENDCHAMP_API_KEY`, `SENDCHAMP_SENDER`, `SENDCHAMP_WHATSAPP_SENDER` + 5 WhatsApp template codes for concierge ops |
| **Google Calendar** | Warning | Full OAuth set: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `GOOGLE_CALENDAR_REFRESH_TOKEN` |
| **Google Meet** | Warning | `GOOGLE_MEET_*` vars for standalone Meet links |
| **Zoom** | Warning | `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET`, `ZOOM_ACCOUNT_ID` |
| **Duplicate aliases** | Warning | Use canonical names below — avoid divergent values across aliases |

### Duplicate variable groups (canonical → aliases)

| Canonical | Aliases |
|-----------|---------|
| `VITE_PAYSTACK_PUBLIC_KEY` | `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`, `PAYSTACK_PUBLIC_KEY` |
| `SUPABASE_URL` | `VITE_SUPABASE_URL` (also required at build) |
| `SUPABASE_ANON_KEY` | `VITE_SUPABASE_ANON_KEY` |
| `SUPABASE_SERVICE_ROLE_KEY` | `SUPABASE_SECRET_KEY` (legacy) |
| `COMMAND_CENTER_PIN` | `ADMIN_ACTION_PIN` (deprecated) |
| `COMMAND_CENTER_EMAILS` | `ADMIN_EMAILS` (deprecated) |
| `PAYSTACK_WEBHOOK_SECRET` | falls back to `PAYSTACK_SECRET_KEY` |
| `PUBLIC_APP_URL` | `VITE_PUBLIC_APP_URL` |
| `PHOTO_MODERATION_MODE` | `VITE_PHOTO_MODERATION_MODE` |

---

## Critical

No integration is **critical-fail at registry level** when `.env.example` is complete and Coolify runtime secrets are set.

**Production becomes critical at runtime when:**

| Condition | Symptom | Fix |
|-----------|---------|-----|
| Missing `DATABASE_URL` | `/ready` 503, dry-run DB | Set Postgres URL |
| Missing `PAYSTACK_SECRET_KEY` | Payments 503 | Set Paystack secret |
| Missing signup email stack | `/ready` 503, `signupEmail=false` | `RESEND_API_KEY` + `SUPABASE_SERVICE_ROLE_KEY` + `SUPABASE_URL` |
| Missing photo storage | `/ready` 503 | Service role key + buckets |
| Placeholder secrets in Coolify | Auth/payment failures | Replace `changeme`, `<...>`, empty critical vars |
| Runtime secret in Docker build | Leaked in image history | Rotate secret; buildtime OFF for runtime vars |

---

## Buildtime vs runtime

| Buildtime ON (Docker ARG) | Runtime ON (Coolify) |
|---------------------------|----------------------|
| `VITE_SUPABASE_URL` | `DATABASE_URL` |
| `VITE_SUPABASE_ANON_KEY` | `SUPABASE_SERVICE_ROLE_KEY` |
| `VITE_PAYSTACK_PUBLIC_KEY` | `PAYSTACK_SECRET_KEY` |
| `VITE_PUBLIC_APP_URL` | `RESEND_API_KEY` |
| `VITE_FIREBASE_*` | `SENDCHAMP_*` |
| `VITE_ENABLE_IMAGE_MODERATION` | `CRON_SECRET`, `COMMAND_CENTER_PIN` |
| | `GOOGLE_*`, `ZOOM_*`, `FIREBASE_SERVICE_ACCOUNT_JSON` |

---

## Verification commands

```bash
npm run test:production-environment
npm run test:server-import
curl -s https://bamsignal.com/ready
curl -s -H "x-diagnostics-secret: $CRON_SECRET" "https://bamsignal.com/ready?details=1"
```

---

## Related

- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [SECURITY.md](./SECURITY.md)
- [MONITORING.md](./MONITORING.md)
- `.env.example` — authoritative variable list
