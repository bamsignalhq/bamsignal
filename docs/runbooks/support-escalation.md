# Support escalation runbook

**Scope:** Member support tickets, engineering escalation, founder escalation, emergency contacts.

---

## Tier 1 — Support inbox

| Field | Value |
|-------|--------|
| Channel | support@bamsignal.com |
| Response | Within 4 business hours |
| Owns | Account questions, how-to, non-urgent bugs |

**Triage checklist:**

1. Reproduce on latest app / bamsignal.com
2. Collect: email, approximate time, product (premium/boost/wallet), Paystack reference if payment
3. Route to runbook before engineering

| Symptom | Runbook |
|---------|---------|
| Paid, no premium/boost | [payment-recovery.md](./payment-recovery.md) |
| Wallet / BayGold issue | [wallet-recovery.md](./wallet-recovery.md) |
| Can't log in | [deployment-recovery.md](./deployment-recovery.md) + auth logs |
| Harassment / safety | [moderation-incidents.md](./moderation-incidents.md) |

---

## Tier 2 — Engineering on-call

| Field | Value |
|-------|--------|
| Trigger | P2+ per [incident-escalation.md](../operations/monitoring/incident-escalation.md) |
| Owns | Coolify, logs, database, payment replay |

**Handoff must include:** severity, symptoms, references, steps already tried, member impact count.

---

## Tier 3 — Founder escalation

| Field | Value |
|-------|--------|
| Trigger | P1, revenue blocked platform-wide, safety/legal, data loss suspected |
| Channel | Founder direct + Launch War Room `/energy/launch` |

**Founder decides:** public communication, rollback, pause signups, law enforcement liaison.

---

## Emergency contacts

| Situation | Contact |
|-----------|---------|
| P0 > 1 hour | Founder + Supabase support + Cloudflare status |
| Data breach suspected | Founder + legal counsel — preserve logs, no mass delete |
| Paystack outage | Paystack status page — communicate to members if checkout down |

---

## Ticket escalation template

```
Subject: [P?] Short title
Member: email (no passwords)
Reference: Paystack bs_... if applicable
Impact: one user / many users / all users
Runbook: link
Status: investigating / mitigated / resolved
Next update: time
```

---

## Verification

Quarterly drill: simulate "paid not active" ticket through Tier 1 → payment-recovery → close.
