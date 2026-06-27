# Production Smoke Suite™

**Run ID:** smoke-242bec1c  
**Target:** https://bamsignal.com  
**Generated:** 2026-06-27T23:02:14.999Z  
**Deployment timestamp:** 2026-06-26T09:18:49.000Z  
**Commit SHA:** 72a687a0793d9fa3a7b9e0f3cbb3dc2143014600  
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
| Landing Page | PASS | 200 | 344ms | low | Landing Page: HTTP 200, root=true, brand=true, build=bamsignal-v1.0.14-17-mqupx88v |
| Signup | PASS | 200 | 151ms | low | Signup: HTTP 200, root=true, brand=true, build=bamsignal-v1.0.14-17-mqupx88v |
| Login | PASS | 200 | 180ms | low | Login: HTTP 200, root=true, brand=true, build=bamsignal-v1.0.14-17-mqupx88v |
| Discover | PASS | 200 | 156ms | low | Discover: HTTP 200, root=true, brand=true, build=bamsignal-v1.0.14-17-mqupx88v |
| Signals | PASS | 200 | 154ms | low | Signals: HTTP 200, root=true, brand=true, build=bamsignal-v1.0.14-17-mqupx88v |
| Chats | PASS | 200 | 173ms | low | Chats: HTTP 200, root=true, brand=true, build=bamsignal-v1.0.14-17-mqupx88v |
| Profile | PASS | 200 | 212ms | low | Profile: HTTP 200, root=true, brand=true, build=bamsignal-v1.0.14-17-mqupx88v |
| Health Endpoint | PASS | 200 | 163ms | low | GET /health → 200; livenessOnly=true |
| Production Ready | PASS | 200 | 525ms | low | GET /ready → 200; ready=true; database=unknown |
| OTP | PASS | 400 | 157ms | low | POST /api/auth/email-code → 400 (route mounted, non-5xx) |
| Login API | PASS | 401 | 393ms | low | POST /api/auth/pin-login → 401 (auth route mounted) |
| Payments | PASS | 400 | 148ms | low | POST /api/paystack/verify → 400 (Paystack route mounted) |
| Feature Flags | FAIL | 404 | 153ms | critical | GET /api/feature-flags → 404; flags=0 |
| Remote Config | FAIL | 404 | 160ms | critical | GET /api/remote-config → 404; signals.free_daily_limit=undefined |
| Notifications | FAIL | 404 | 165ms | high | Remote config exposes notifications.retry_interval_seconds and notifications.templates |
| Discover API | PASS | 401 | 166ms | low | POST member discover → 401 (expects auth without session) |
| Signals API | PASS | 401 | 155ms | low | POST member signals → 401 (expects auth without session) |
| Chats API | PASS | 401 | 146ms | low | POST member chats → 401 (expects auth without session) |
| Profile API | PASS | 401 | 225ms | low | POST member profile → 401 (expects auth without session) |

## Recommendations

- [critical] Feature Flags: GET /api/feature-flags → 404; flags=0
- [critical] Remote Config: GET /api/remote-config → 404; signals.free_daily_limit=undefined
- [high] Notifications: Remote config exposes notifications.retry_interval_seconds and notifications.templates

---
Command: `npm run smoke:production`
