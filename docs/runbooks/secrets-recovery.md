# Secrets recovery runbook

**Scope:** API keys, database URLs, auth secrets — recovery without exposing values in git.

---

## Secret inventory (names only)

Reference: `docs/operations/environment/required-secrets.md` and `.env.example`.

| Category | Examples (names only) |
|----------|------------------------|
| Database | `DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| Auth | `AUTH_SECRET`, `JWT_SECRET` |
| Payments | `PAYSTACK_SECRET_KEY`, `PAYSTACK_WEBHOOK_SECRET` |
| Email | `RESEND_API_KEY` |
| Platform | `STANKINGS_PLATFORM_URL`, `STANKINGS_PLATFORM_SERVICE_KEY` |
| Ops | `DIAGNOSTICS_SECRET` |

---

## Storage rules

1. **Production values:** Coolify + founder encrypted password manager only.
2. **Rotation:** per [rotation-policy.md](../operations/environment/rotation-policy.md).
3. **Never:** Slack, email body, git, screenshots.

---

## Recovery — secret lost or rotated

1. Regenerate at provider (Paystack, Resend, Supabase, etc.).
2. Update Coolify env → redeploy.
3. Update webhook URLs if Paystack secret rotated.
4. Verify `/ready` all green.
5. Smoke: login, wallet home, test payment in staging.

---

## Recovery — Coolify host lost

1. Rebuild host per [deployment-recovery.md](./deployment-recovery.md).
2. Restore env from latest [configuration-backup.md](./configuration-backup.md) export.
3. If export lost — reconstruct from password manager + provider dashboards.

---

## Compromise suspected

1. Rotate **all** secrets immediately.
2. Review Paystack + Supabase audit logs.
3. Founder escalation — [support-escalation.md](./support-escalation.md).
4. Document in incident template.

---

## Quarterly drill

- [ ] Confirm password manager export decrypts
- [ ] Confirm `.env.example` matches Coolify keys (names)
- [ ] One test rotation in staging
