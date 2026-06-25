# Configuration Drift Detection

Rules and tooling to detect when environments diverge from documented standards.

---

## What is configuration drift?

Drift occurs when runtime configuration differs from documented expectations without a tracked change. Examples:

- Staging `DATABASE_URL` accidentally points at production
- `VITE_SUPABASE_URL` rebuilt with wrong project while runtime `SUPABASE_URL` is correct
- Test Paystack keys in production Coolify
- Callback URLs still pointing at old domain
- Missing `CRON_SECRET` after container clone
- Feature flag enabled in production that should be dev-only

---

## Automated detection

### `npm run env:validate`

| Check | Code | Description |
|-------|------|-------------|
| Missing critical vars | `missing` | Required var unset for target environment |
| Empty values | `missing` | Whitespace-only treated as missing |
| Placeholder values | `placeholder` | `REPLACE_ME`, `<secret>`, `changeme` |
| Invalid format | `invalid` | URL, Paystack prefix, boolean, etc. |
| Test keys in production | `invalid` | `sk_test_` / `pk_test_` when target=production |
| Localhost in production URLs | `drift` | `localhost` in URL vars |
| Wrong production domain | `drift` | `PUBLIC_APP_URL` not `bamsignal.com` |
| Duplicate conflicts | `duplicate-conflict` | Alias vars set to different values |
| Supabase project mismatch | `drift` | `VITE_SUPABASE_URL` ≠ `SUPABASE_URL` |
| Undocumented vars | `unknown` | Key in `.env` not in `.env.example` |

Report: `play-store/environment-validation-report.json` (names only, no values)

---

## Manual drift checks

Run weekly or before production release:

| Check | Method |
|-------|--------|
| Coolify staging vs prod var names | Side-by-side Coolify UI |
| Paystack dashboard webhook URL | Compare to `PAYSTACK_WEBHOOK_URL` |
| Supabase project ID | Match URL in dashboard vs env |
| Google OAuth redirect URIs | Match `GOOGLE_REDIRECT_URI` |
| Android package ID | `android/app/build.gradle` vs Play Console |
| Deep link assetlinks SHA-256 | vs Play signing cert |
| Docker build args | `Dockerfile` vs Coolify buildtime vars |
| `.env.example` vs registry | New code vars documented |

---

## Drift severity

| Severity | Example | Response |
|----------|---------|----------|
| **Critical** | Prod DB URL on staging | Immediate fix + incident |
| **Critical** | `sk_test_` in production | Immediate fix |
| **High** | Supabase URL client/server mismatch | Fix before next deploy |
| **High** | Missing `CRON_SECRET` | Fix before deploy |
| **Medium** | Optional integration unset | Track in ops backlog |
| **Low** | Undocumented env key | Update `.env.example` |

---

## Prevention controls

| Control | Location |
|---------|----------|
| Env validate script | `npm run env:validate` |
| Pre-push hook | `test:server-import`, `test:source-integrity` |
| Release checklist | [verification-checklist.md](./verification-checklist.md) |
| Readiness gate | `/ready` 503 when critical deps missing |
| Source integrity | Dockerfile must not embed runtime secrets |
| Admin audit UI | `/hard/production-environment` |
| Duplicate group docs | `shared/environmentRegistry.mjs` |

---

## CI integration (future)

Recommended pipeline steps (not yet wired):

```yaml
# Example — architecture only
- run: ENV_TARGET=staging npm run env:validate -- --strict
- run: npm run test:configuration
```

---

## Drift remediation workflow

1. Run `npm run env:validate` — capture report
2. Classify severity (table above)
3. Fix Coolify / `.env` — **never commit secrets**
4. Rebuild if `VITE_*` changed
5. Restart if runtime-only changed
6. Verify `/ready` + smoke tests
7. Document in release or incident record if production-impacting

---

## Related

- [environment-promotion.md](./environment-promotion.md)
- [../monitoring/alerts.md](../monitoring/alerts.md) — `ready_check_failed`
- [../../releases/templates/incident-template.md](../../releases/templates/incident-template.md)
