# Production Smoke Suite™

**Run ID:** smoke-1c6931c1  
**Target:** https://bamsignal.com  
**Generated:** 2026-06-28T05:23:47.327Z  
**Deployment timestamp:** 2026-06-28T05:23:43.000Z  
**Commit SHA:** dba48e439120d93616ba85d2c6c76a7c17def2ae  
**Deployment build:** bamsignal-v1.0.15-18-mqx2n4dm  
**Smoke score:** 100%  
**Result:** PASS

## Summary

| Metric | Value |
|--------|------:|
| Checks run | 19 |
| Passed | 19 |
| Failed | 0 |
| Critical failures | 0 |

## Checks

| Surface | Result | HTTP | Time | Severity | Detail |
|---------|--------|-----:|-----:|----------|--------|
| Landing Page | PASS | 200 | 789ms | low | Landing Page: HTTP 200, root=true, brand=true, build=bamsignal-v1.0.15-18-mqx2n4dm |
| Signup | PASS | 200 | 169ms | low | Signup: HTTP 200, root=true, brand=true, build=bamsignal-v1.0.15-18-mqx2n4dm |
| Login | PASS | 200 | 147ms | low | Login: HTTP 200, root=true, brand=true, build=bamsignal-v1.0.15-18-mqx2n4dm |
| Discover | PASS | 200 | 144ms | low | Discover: HTTP 200, root=true, brand=true, build=bamsignal-v1.0.15-18-mqx2n4dm |
| Signals | PASS | 200 | 153ms | low | Signals: HTTP 200, root=true, brand=true, build=bamsignal-v1.0.15-18-mqx2n4dm |
| Chats | PASS | 200 | 187ms | low | Chats: HTTP 200, root=true, brand=true, build=bamsignal-v1.0.15-18-mqx2n4dm |
| Profile | PASS | 200 | 149ms | low | Profile: HTTP 200, root=true, brand=true, build=bamsignal-v1.0.15-18-mqx2n4dm |
| Health Endpoint | PASS | 200 | 142ms | low | GET /health → 200; livenessOnly=true |
| Production Ready | PASS | 200 | 522ms | low | GET /ready → 200; ready=true; database=unknown |
| OTP | PASS | 400 | 387ms | low | POST /api/auth/email-code → 400 (route mounted, non-5xx) |
| Login API | PASS | 401 | 364ms | low | POST /api/auth/pin-login → 401 (auth route mounted) |
| Payments | PASS | 400 | 149ms | low | POST /api/paystack/verify → 400 (Paystack route mounted) |
| Feature Flags | PASS | 200 | 149ms | low | GET /api/feature-flags → 200; flags=11 |
| Remote Config | PASS | 200 | 232ms | low | GET /api/remote-config → 200; signals.free_daily_limit=5 |
| Notifications | PASS | 200 | 154ms | low | Remote config exposes notifications.retry_interval_seconds and notifications.templates |
| Discover API | PASS | 401 | 150ms | low | POST member discover → 401 (expects auth without session) |
| Signals API | PASS | 401 | 152ms | low | POST member signals → 401 (expects auth without session) |
| Chats API | PASS | 401 | 155ms | low | POST member chats → 401 (expects auth without session) |
| Profile API | PASS | 401 | 150ms | low | POST member profile → 401 (expects auth without session) |

## Recommendations

- None

---
Command: `npm run smoke:production`
