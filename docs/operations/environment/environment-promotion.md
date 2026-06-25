# Environment Promotion Workflow

How configuration moves from local development to production without drift.

---

## Promotion pipeline

```text
Local → Preview → Staging → Production
  │        │          │           │
  dev      branch     pre-prod    Coolify main
  .env     Coolify    full parity  bamsignal.com
```

---

## Local → Preview

| Step | Action |
|------|--------|
| 1 | Copy `.env.example` → `.env`; fill dev values only |
| 2 | `ENV_TARGET=local npm run env:validate` |
| 3 | Never use production `DATABASE_URL` locally |
| 4 | Push branch → Coolify preview (if configured) |
| 5 | Preview uses **isolated** Supabase + test Paystack |

**Gate:** No production secrets on developer machines unless encrypted vault.

---

## Preview → Staging

| Step | Action |
|------|--------|
| 1 | Merge to staging branch or promote preview deploy |
| 2 | Copy env template from password manager → Coolify staging |
| 3 | `ENV_TARGET=staging npm run env:validate -- --strict` |
| 4 | Update callback URLs to staging domain |
| 5 | Run integration tests + manual QA |
| 6 | Complete [verification-checklist.md](./verification-checklist.md) |

**Gate:** Engineering sign-off on staging `/ready` 200.

---

## Staging → Production

| Step | Action |
|------|--------|
| 1 | Complete [production release checklist](../../releases/checklists/production-release-checklist.md) |
| 2 | Diff Coolify staging vs production var **names** (not values in git) |
| 3 | `ENV_TARGET=production npm run env:validate -- --strict` against production template |
| 4 | Confirm live Paystack keys (`pk_live_`, `sk_live_`) |
| 5 | Confirm production Supabase project IDs |
| 6 | Merge to `main` → Coolify webhook rebuild |
| 7 | Post-deploy: `/ready`, smoke tests, T+24h monitoring |

**Gate:** Release approval in [release template](../../releases/templates/release-template.md).

---

## Rollback

| Scenario | Action |
|----------|--------|
| Bad deploy, env unchanged | Coolify redeploy previous SHA ([deployment-recovery.md](../../runbooks/deployment-recovery.md)) |
| Bad env var change | Revert Coolify env to password manager snapshot → restart |
| Wrong Supabase project | **Stop** — assess data writes; restore from backup if needed |
| Wrong Paystack mode | Revert keys immediately; reconcile ledger ([payment-recovery.md](../../runbooks/payment-recovery.md)) |

Env rollback does **not** require git revert if only Coolify vars changed.

---

## Verification at each stage

| Stage | Command / check |
|-------|-----------------|
| Local | `npm run env:validate` (target=local) |
| Preview | Manual var review |
| Staging | `env:validate --strict` + `/ready` |
| Production | `env:validate --strict` + `/ready` + release checklist |

---

## Approvals

| Promotion | Approver |
|-------------|----------|
| Local → Preview | Engineer |
| Preview → Staging | Engineering lead |
| Staging → Production | Engineering + DevOps + Founder (per release checklist) |
| Production env hotfix | Engineering lead + DevOps (document in incident record) |

---

## Coolify promotion checklist

When copying vars between services:

1. Export var **names** from staging Coolify UI (not values to git)
2. Compare against `.env.example`
3. Update production Coolify one integration at a time
4. Restart / rebuild as needed (VITE = rebuild)
5. Verify `/ready` after each critical integration

---

## Related

- [environment-matrix.md](./environment-matrix.md)
- [configuration-drift.md](./configuration-drift.md)
- [../releases/README.md](../releases/README.md)
