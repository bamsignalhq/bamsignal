# Deployment recovery runbook

**Platform:** Coolify ([control.bamsignal.com](https://control.bamsignal.com)) — self-hosted Docker. **Not Vercel.**

**Production URL:** https://bamsignal.com

---

## Health signals

| Endpoint | Meaning | Use |
|----------|---------|-----|
| `GET /health` | Liveness — Node process up | Quick ping |
| `GET /ready` | Readiness — DB, Paystack, signup email, photo storage | Docker `HEALTHCHECK`, Coolify |
| Detailed `/ready` | Dependency booleans | Requires `x-diagnostics-secret` or admin session |

Failed readiness logs: `ready_check_failed` (rate-limited). Fix dependencies before redeploying repeatedly.

---

## Bad deployment recovery

### 1. Identify bad release

- Coolify → BamSignal service → **Deployments** — note failing commit SHA.
- GitHub `main` history — last known good commit.
- Symptoms: 502/503, `/ready` failing, build failed, smoke test failed in CI/pre-push.

### 2. Roll back application (Coolify)

1. Open Coolify → BamSignal app → **Deployments**.
2. Select last **successful** deployment → **Redeploy** / **Rollback** (terminology varies by Coolify version).
3. Alternatively: revert commit on `main`, push, wait for webhook rebuild:

   ```bash
   git revert <bad-commit-sha>
   git push origin main
   ```

4. Confirm container starts: logs show `[bamsignal] Running on http://0.0.0.0:3000`.
5. Verify `curl -s -o /dev/null -w "%{http_code}" https://bamsignal.com/ready` → `200` (when deps configured).

### 3. Docker image rollback

Coolify rebuilds from `Dockerfile` on each deploy. There is **no separate image tag registry** in-repo — rollback = redeploy older git SHA.

**Never** run production from stale local `dist/` without matching git commit.

---

## Service restart (no code change)

Use when process hung, memory leak, or transient upstream errors:

1. Coolify → **Restart** container (rolling restart if multiple instances).
2. Watch logs for:
   - `db_unavailable` — check Supabase / `DATABASE_URL`
   - `ready_check_failed` — missing secrets
3. Confirm `/health` 200 and `/ready` 200.

---

## Build-time vs runtime mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Secret in Docker build arg | Leaked in image history | Rotate secret; fix Coolify buildtime OFF for runtime vars |
| Missing `VITE_*` at build | Client can't reach Supabase | Rebuild with buildtime vars per `Dockerfile` |
| Missing runtime secret | `/ready` 503 | Coolify runtime env from `.env.example` |
| Stale web assets | Old UI after deploy | Ensure Coolify ran full `npm run build` in Docker builder stage |

See `.cursor/rules/deployment.mdc` and `Dockerfile` comments.

---

## Server rebuild (full machine loss)

1. Provision new host; install Coolify.
2. Restore secrets from **password manager** (see Environment recovery below).
3. Point DNS `bamsignal.com` to new host.
4. Connect GitHub repo; set build/runtime env matching `.env.example`.
5. Deploy `main`.
6. Restore **database** and **storage** per database/storage runbooks — app alone is not enough.
7. Run verification checklist.

---

## Environment recovery (required secrets)

Store in Coolify runtime (never in git). **Do not paste real values into tickets or runbooks.**

| Category | Variables |
|----------|-----------|
| Database | `DATABASE_URL`, optional `PGSSLMODE` |
| Supabase | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| Paystack | `PAYSTACK_SECRET_KEY`, callback/webhook URLs |
| Email | `RESEND_API_KEY`, `SIGNUP_EMAIL_FROM`, `SUPPORT_EMAIL_*` |
| WhatsApp OTP | `SENDCHAMP_*` |
| Firebase push | `FIREBASE_SERVICE_ACCOUNT_JSON` or discrete Firebase vars |
| Admin / ops | `COMMAND_CENTER_EMAILS`, `COMMAND_CENTER_PIN`, `CRON_SECRET`, `DIAGNOSTICS_SECRET` |
| Telegram (optional) | `TELEGRAM_BOT_TOKEN`, channel/group IDs |

Build-time (public): `VITE_SUPABASE_*`, `VITE_PAYSTACK_PUBLIC_KEY`, `VITE_PUBLIC_APP_URL`, etc.

After secret rotation: restart container; verify `/ready`.

---

## Post-recovery verification

```bash
npm run test:server-import   # from operator machine with .env, or rely on deploy smoke
curl -s https://bamsignal.com/health
curl -s https://bamsignal.com/ready
```

Member flows (manual): login, home load, profile view. Payment: read-only Paystack dashboard check.

---

## Related runbooks

- [database-restore.md](./database-restore.md)
- [storage-restore.md](./storage-restore.md)
- [payment-recovery.md](./payment-recovery.md)
