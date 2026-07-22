# Security Checklist

## Authentication

- [ ] Login is username + PIN only (no password/email login copy)
- [ ] PIN auth throttle active with memory fallback
- [ ] Session lifecycle audited via `member_auth_sessions`
- [ ] Account lifecycle transitions logged

## Authorization

- [ ] Admin routes require `requireAdmin` (Supabase session or automation secret)
- [ ] Operations API permission-controlled
- [ ] Diagnostics require `DIAGNOSTICS_SECRET` header
- [ ] Passport contributor API requires contributor key

## Secrets

- [ ] `ADMIN_SECRET`, `CRON_SECRET`, `DIAGNOSTICS_SECRET` are unique values
- [ ] No placeholder secrets in production (`changeme`, etc.)
- [ ] Runtime secrets not in Docker build args
- [ ] `.env` not committed

Run validation:

```bash
npm run test:production-readiness
npm run certify:security
```

## Database

- [ ] Passport tables have RLS enabled
- [ ] Server uses `DATABASE_URL` (bypasses RLS appropriately)
- [ ] Supabase project ref matches `nswiwxmavuqpuzlsascs`

## Headers & Transport

- [ ] HTTPS enforced in production (Coolify TLS)
- [ ] Security headers via production middleware
- [ ] CORS restricted to app origins

## Dependencies

```bash
npm audit
npm run certify:dependencies
```

## Pre-Launch Sign-Off

- [ ] No high-risk findings in `runSecurityAudit()`
- [ ] Penetration certification reviewed (`npm run certify:production-penetration`)
