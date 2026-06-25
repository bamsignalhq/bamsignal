# BamSignal Environment Configuration & Secrets Management

Permanent framework for environment validation, secrets inventory, promotion workflows, and configuration drift prevention.

**Source of truth for variable names:** [`.env.example`](../../../.env.example)  
**Validation tooling:** `npm run env:validate`  
**Code registry (admin audit):** `src/constants/productionEnvironmentAudit.ts`

Do **not** rotate secrets or change production credentials through this framework — documentation and validation only.

---

## Purpose

Configuration drift causes silent production incidents: missing `/ready` dependencies, wrong Supabase project, test Paystack keys in production, stale callback URLs, or Android package mismatches. This system ensures development, staging, and production **cannot drift apart undetected**.

---

## Document map

| Document | Purpose |
|----------|---------|
| [environment-matrix.md](./environment-matrix.md) | Per-environment services, URLs, domains |
| [required-secrets.md](./required-secrets.md) | Full variable inventory by service |
| [rotation-policy.md](./rotation-policy.md) | Rotation cadence and procedures (no auto-rotation) |
| [verification-checklist.md](./verification-checklist.md) | Pre-deploy env verification |
| [environment-promotion.md](./environment-promotion.md) | Local → preview → staging → production |
| [feature-flags.md](./feature-flags.md) | Build-time and runtime flags |
| [configuration-drift.md](./configuration-drift.md) | Drift detection rules |
| [disaster-recovery.md](./disaster-recovery.md) | Lost or compromised secrets recovery |

---

## Validation commands

```bash
# Default: validate against production rules (uses .env if present)
npm run env:validate

# Explicit target
ENV_TARGET=staging npm run env:validate
ENV_TARGET=local npm run env:validate

# Strict: treat warning-level vars as required
npm run env:validate -- --strict

# Custom report path
npm run env:validate -- --report /tmp/env-report.json
```

**Safety:** The validator prints **variable names and issue codes only** — never secret values.

---

## Coolify / Docker policy

| Layer | Variables | Coolify setting |
|-------|-----------|-----------------|
| **Buildtime** | `VITE_*`, public Paystack `pk_*` | Available at Buildtime = **ON** |
| **Runtime** | `DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `PAYSTACK_SECRET_KEY`, etc. | Available at Runtime = **ON**, Buildtime = **OFF** |

See [`.cursor/rules/deployment.mdc`](../../../.cursor/rules/deployment.mdc).

---

## Readiness integration

Production `/ready` requires:

- `DATABASE_URL` connected
- `PAYSTACK_SECRET_KEY` set
- Signup email (`RESEND_API_KEY` + Supabase service role)
- Photo storage configured

Validation should pass **before** deploy. Post-deploy: `GET /ready` → 200.

---

## Related systems

| System | Link |
|--------|------|
| Release Management | [../releases/README.md](../releases/README.md) |
| Monitoring | [../monitoring/README.md](../monitoring/README.md) |
| Deployment recovery | [../../runbooks/deployment-recovery.md](../../runbooks/deployment-recovery.md) |
| Payment recovery | [../../runbooks/payment-recovery.md](../../runbooks/payment-recovery.md) |

---

## Governance

| Role | Responsibility |
|------|----------------|
| Engineering | `.env.example`, registry, validation scripts |
| Security | Rotation policy, secret classification |
| DevOps | Coolify env parity, promotion sign-off |
| Operations | Concierge integration vars (Calendar, Zoom, SendChamp) |

Review this framework when adding new integrations or env vars.
