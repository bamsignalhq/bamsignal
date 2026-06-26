# Emergency Contacts

**Store live contact details in your password manager.** This chapter defines roles and escalation — replace bracketed placeholders with vault entries.

## Internal escalation

| Role | Responsibility | Primary channel | Backup |
|------|----------------|-----------------|--------|
| Founder / CEO | Final go/no-go, P1 comms | [vault: founder phone / Signal] | [vault: email] |
| Release Engineer / On-call | Deploy, rollback, smoke | [vault: on-call rotation] | Secondary engineer |
| Engineering Lead | Architecture, incident commander | [vault] | — |
| Operations Lead | Concierge, support, consultant ops | [vault] | — |
| Safety Lead | Moderation, abuse, legal escalation | [vault] | — |

## Vendor / infrastructure

| Vendor | Use | Access |
|--------|-----|--------|
| Coolify host | Container, env, deploy | https://control.bamsignal.com |
| Supabase | Database, auth, storage | Supabase dashboard + support ticket |
| Paystack | Payments, webhooks | Paystack dashboard + support |
| Resend | Transactional email | Resend dashboard |
| SendChamp | WhatsApp/SMS OTP | SendChamp dashboard |
| Google Play | Android distribution | Play Console |
| GitHub | Source, CI hooks | github.com/bamsignalhq/bamsignal |

## Escalation triggers (call founder)

- P1 outage > 15 minutes
- Suspected data breach or credential leak
- Payment double-charge or widespread fulfillment failure
- Legal / law enforcement request

## Status communication

- Internal: designated incident channel (define in vault).
- External: only founder or delegated comms lead — no engineering Twitter threads during P1.

## Updating this roster

When personnel changes: update vault within 24h, notify on-call rotation, and rebuild this book (`npm run build:founder-launch-book`) if role descriptions change.
