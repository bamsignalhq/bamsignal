# Configuration backup runbook

**Scope:** Coolify environment variables, feature flags, non-secret config exports.

**Never commit secrets to git** — do not commit configuration exports to the repository (never commit secrets or env exports).

---

## What to back up

| Item | Location | Frequency |
|------|----------|-----------|
| Coolify env vars | control.bamsignal.com | On every production change |
| Feature flags | DB + `feature_flag_platform` | Weekly snapshot |
| Remote config | `platform_settings` keys | Weekly |
| DNS / Cloudflare | Cloudflare dashboard export | Monthly |

---

## Coolify export procedure

1. Coolify → BamSignal service → Environment.
2. Export to password manager secure note (encrypted).
3. Label: `bamsignal-production-YYYY-MM-DD`.
4. Include variable **names** and values — store offline encrypted.

---

## Feature flags

```sql
select key, enabled, payload, updated_at
from feature_flags
order by updated_at desc;
```

Export JSON to secure storage — not git.

---

## Restore

1. New Coolify service or disaster host.
2. Paste env from latest encrypted export.
3. Deploy tagged release.
4. `GET /ready?details=1` — all required deps true.
5. Compare feature flag dump to production baseline.

---

## Verification

- [ ] Latest config export < 7 days old (or immediately after any prod change)
- [ ] Founder has access to password manager vault
- [ ] `.env.example` in repo matches required variable names

**Related:** [secrets-recovery.md](./secrets-recovery.md) · [deployment-recovery.md](./deployment-recovery.md)
