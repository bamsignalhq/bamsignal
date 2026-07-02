# Production Smoke Suite™

**Run ID:** smoke-30720b2d  
**Target:** https://bamsignal.com  
**Generated:** 2026-07-02T11:13:24.880Z  
**Deployment timestamp:** 2026-07-02T11:13:17.000Z  
**Commit SHA:** fb96e2c532815bb5e56c28ddd399e97ebc1b8f75  
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
| Landing Page | PASS | 200 | 1373ms | low | Landing Page: HTTP 200, root=true, brand=true, build=bamsignal-v1.0.15-18-mqx2n4dm |
| Signup | PASS | 200 | 313ms | low | Signup: HTTP 200, root=true, brand=true, build=bamsignal-v1.0.15-18-mqx2n4dm |
| Login | PASS | 200 | 309ms | low | Login: HTTP 200, root=true, brand=true, build=bamsignal-v1.0.15-18-mqx2n4dm |
| Discover | PASS | 200 | 368ms | low | Discover: HTTP 200, root=true, brand=true, build=bamsignal-v1.0.15-18-mqx2n4dm |
| Signals | PASS | 200 | 507ms | low | Signals: HTTP 200, root=true, brand=true, build=bamsignal-v1.0.15-18-mqx2n4dm |
| Chats | PASS | 200 | 758ms | low | Chats: HTTP 200, root=true, brand=true, build=bamsignal-v1.0.15-18-mqx2n4dm |
| Profile | PASS | 200 | 289ms | low | Profile: HTTP 200, root=true, brand=true, build=bamsignal-v1.0.15-18-mqx2n4dm |
| Health Endpoint | PASS | 200 | 307ms | low | GET /health → 200; livenessOnly=true |
| Production Ready | PASS | 200 | 1023ms | low | GET /ready → 200; ready=true; database=unknown |
| OTP | PASS | 400 | 426ms | low | POST /api/auth/email-code → 400 (route mounted, non-5xx) |
| Login API | PASS | 401 | 416ms | low | POST /api/auth/pin-login → 401 (auth route mounted) |
| Payments | PASS | 400 | 254ms | low | POST /api/paystack/verify → 400 (Paystack route mounted) |
| Feature Flags | PASS | 200 | 522ms | low | GET /api/feature-flags → 200; flags=11 |
| Remote Config | PASS | 200 | 318ms | low | GET /api/remote-config → 200; signals.free_daily_limit=5 |
| Notifications | PASS | 200 | 253ms | low | Remote config exposes notifications.retry_interval_seconds and notifications.templates |
| Discover API | PASS | 401 | 439ms | low | POST member discover → 401 (expects auth without session) |
| Signals API | PASS | 401 | 582ms | low | POST member signals → 401 (expects auth without session) |
| Chats API | PASS | 401 | 254ms | low | POST member chats → 401 (expects auth without session) |
| Profile API | PASS | 401 | 175ms | low | POST member profile → 401 (expects auth without session) |

## Recommendations

- None

---
Command: `npm run smoke:production`
