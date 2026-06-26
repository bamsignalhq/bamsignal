# Chaos Engineering Certification™

**Run ID:** chaos-aa1eb616  
**Generated:** 2026-06-26T18:03:38.490Z  
**Chaos score:** 100%  
**Release gate:** PASS

## Chaos report summary

| Metric | Value |
|--------|------:|
| Attacks simulated | 15 |
| Attacks passed | 15 |
| Recovery success | 15/15 |
| Avg recovery time | 37 ms |
| Max recovery time | 556 ms |
| Critical weaknesses | 0 |

## Attacks

| Attack | Critical | Gate | Recovered | Time (ms) | Failed checks | Detail |
|--------|----------|------|-----------|----------:|---------------|--------|
| Kill Supabase | yes | PASS | yes | 0 | — | Signup and auth fail closed when Supabase identity cannot be verified. |
| Kill Storage | yes | PASS | yes | 0 | — | Photo upload degrades to pending_review; upload-first preserved when storage fails. |
| Kill Paystack | yes | PASS | yes | 0 | — | Paystack client returns 503 when unconfigured; verify endpoint rejects bad refs. |
| Kill Sendchamp | no | PASS | yes | 0 | — | Sendchamp returns 503 not_configured when API key missing. |
| Kill Resend | yes | PASS | yes | 0 | — | Purchase and concierge email skip gracefully when Resend is unavailable. |
| Kill Firebase | no | PASS | yes | 0 | retry | Push registration skips when Firebase admin is not configured. |
| Kill OpenAI | no | PASS | yes | 0 | — | No server OpenAI dependency — photo moderation uses manual safety patterns and pending_review. |
| Kill Google Calendar | no | PASS | yes | 0 | — | Consultation scheduling returns service-unavailable when Google Calendar is not ready. |
| Kill Webhooks | yes | PASS | yes | 0 | retry | Invalid webhook signatures are rejected and logged — no silent fulfillment. |
| Kill Notification Queue | no | PASS | yes | 0 | — | Notification ops surfaces failed deliveries and supports retry without crashing admin UI. |
| Kill Matching Queue | no | PASS | yes | 0 | — | Assignment/matching queue stalls surface in Operations Center and readiness checks. |
| Kill Database Connection | yes | PASS | yes | 0 | — | Database pool loss alerts and throttle falls back to in-memory store. |
| Kill Session Refresh | yes | PASS | yes | 556 | — | Invalid refresh tokens reject restore; Supabase client auto-refreshes when configured. |
| Kill Feature Flag Endpoint | no | PASS | yes | 0 | — | Feature flag client falls back to offline cache and seed defaults when API is dead. |
| Kill Remote Config Endpoint | no | PASS | yes | 0 | — | Remote config client serves cached defaults when /api/remote-config is unavailable. |

## Critical weaknesses

- None — all attacks survived simulated failure.

## Recommendations

- **[medium]** Maintain chaos baseline: Re-run npm run certify:chaos before each release candidate.

---
Command: `npm run certify:chaos`
