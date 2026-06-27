# Production Smoke Suite™

**Run ID:** smoke-4a01a635  
**Target:** https://bamsignal.com  
**Generated:** 2026-06-26T23:13:05.723Z  
**Deployment timestamp:** 2026-06-26T09:18:49.000Z  
**Commit SHA:** 7df0bb484922deec7c8412f8494d98c0f0d78654  
**Deployment build:** bamsignal-v1.0.14-17-mqupx88v  
**Smoke score:** 50%  
**Result:** FAIL

## Summary

| Metric | Value |
|--------|------:|
| Checks run | 19 |
| Passed | 16 |
| Failed | 3 |
| Critical failures | 2 |

## Checks

| Surface | Result | HTTP | Time | Severity | Detail |
|---------|--------|-----:|-----:|----------|--------|
| Landing Page | PASS | 200 | 692ms | low | Landing Page: HTTP 200, root=true, brand=true, build=bamsignal-v1.0.14-17-mqupx88v |
| Signup | PASS | 200 | 317ms | low | Signup: HTTP 200, root=true, brand=true, build=bamsignal-v1.0.14-17-mqupx88v |
| Login | PASS | 200 | 301ms | low | Login: HTTP 200, root=true, brand=true, build=bamsignal-v1.0.14-17-mqupx88v |
| Discover | PASS | 200 | 313ms | low | Discover: HTTP 200, root=true, brand=true, build=bamsignal-v1.0.14-17-mqupx88v |
| Signals | PASS | 200 | 306ms | low | Signals: HTTP 200, root=true, brand=true, build=bamsignal-v1.0.14-17-mqupx88v |
| Chats | PASS | 200 | 295ms | low | Chats: HTTP 200, root=true, brand=true, build=bamsignal-v1.0.14-17-mqupx88v |
| Profile | PASS | 200 | 358ms | low | Profile: HTTP 200, root=true, brand=true, build=bamsignal-v1.0.14-17-mqupx88v |
| Health Endpoint | PASS | 200 | 301ms | low | GET /health → 200; livenessOnly=true |
| Production Ready | PASS | 200 | 549ms | low | GET /ready → 200; ready=true; database=unknown |
| OTP | PASS | 400 | 365ms | low | POST /api/auth/email-code → 400 (route mounted, non-5xx) |
| Login API | PASS | 401 | 421ms | low | POST /api/auth/pin-login → 401 (auth route mounted) |
| Payments | PASS | 400 | 302ms | low | POST /api/paystack/verify → 400 (Paystack route mounted) |
| Feature Flags | FAIL | 404 | 287ms | critical | GET /api/feature-flags → 404; flags=0 |
| Remote Config | FAIL | 404 | 393ms | critical | GET /api/remote-config → 404; signals.free_daily_limit=undefined |
| Notifications | FAIL | 404 | 298ms | high | Remote config exposes notifications.retry_interval_seconds and notifications.templates |
| Discover API | PASS | 401 | 308ms | low | POST member discover → 401 (expects auth without session) |
| Signals API | PASS | 401 | 293ms | low | POST member signals → 401 (expects auth without session) |
| Chats API | PASS | 401 | 308ms | low | POST member chats → 401 (expects auth without session) |
| Profile API | PASS | 401 | 365ms | low | POST member profile → 401 (expects auth without session) |

## Recommendations

- [critical] Feature Flags: GET /api/feature-flags → 404; flags=0
- [critical] Remote Config: GET /api/remote-config → 404; signals.free_daily_limit=undefined
- [high] Notifications: Remote config exposes notifications.retry_interval_seconds and notifications.templates

---
Command: `npm run smoke:production`
