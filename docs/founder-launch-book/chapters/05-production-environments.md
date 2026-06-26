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
