# Reliability Certification™

**Run ID:** rel-4b00e052  
**Generated:** 2026-06-27T11:11:34.127Z  
**Reliability score:** 100%  
**Release gate:** PASS

## Recovery summary

| Metric | Value |
|--------|------:|
| Recovery success | 10/10 |
| Avg recovery time | 39 ms |
| Max recovery time | 321 ms |
| Failures | 0 |

## Scenarios

| Scenario | Gate | Recovered | Time (ms) | Detail |
|----------|------|-----------|----------:|--------|
| Supabase unavailable | PASS | yes | 0 | Signup and member auth fail closed when Supabase identity cannot be verified. |
| Paystack unavailable | PASS | yes | 0 | Paystack client returns 503 when unconfigured; webhooks reject unsigned payloads. |
| Sendchamp unavailable | PASS | yes | 0 | Sendchamp returns 503 not_configured when API key missing. |
| Resend unavailable | PASS | yes | 0 | Purchase and concierge email skip gracefully when Resend is not configured. |
| Storage unavailable | PASS | yes | 0 | Photo moderation degrades to pending_review when provider fails; upload-first preserved. |
| Network timeout | PASS | yes | 12 | Recovered after 2 attempts (12ms). |
| Slow API | PASS | yes | 58 | Slow upstream recovered in 58ms after retry. |
| Database reconnect | PASS | yes | 0 | Database pool errors alert and throttle falls back to in-memory store. |
| Expired JWT | PASS | yes | 321 | Expired or missing JWT returns 401 without trusting request body identity. |
| Invalid refresh token | PASS | yes | 0 | Invalid refresh tokens reject session restore; Supabase client auto-refreshes when configured. |

## Recommendations

- **Maintain reliability baseline** (medium): Re-run npm run certify:reliability before each release candidate.

---
Command: `npm run certify:reliability`
