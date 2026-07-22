# Production Smoke Suite™

**Run ID:** smoke-dd9aab70  
**Target:** https://bamsignal.com  
**Generated:** 2026-07-22T15:39:21.732Z  
**Deployment timestamp:** 2026-07-22T15:39:15.000Z  
**Commit SHA:** e574d50fdd31073bc7354315e33d3e07bee03daf  
**Deployment build:** bamsignal-v1.0.17-20-mrw8he3r  
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
| Landing Page | PASS | 200 | 1541ms | low | Landing Page: HTTP 200, root=true, brand=true, build=bamsignal-v1.0.17-20-mrw8he3r |
| Signup | PASS | 200 | 244ms | low | Signup: HTTP 200, root=true, brand=true, build=bamsignal-v1.0.17-20-mrw8he3r |
| Login | PASS | 200 | 234ms | low | Login: HTTP 200, root=true, brand=true, build=bamsignal-v1.0.17-20-mrw8he3r |
| Discover | PASS | 200 | 240ms | low | Discover: HTTP 200, root=true, brand=true, build=bamsignal-v1.0.17-20-mrw8he3r |
| Signals | PASS | 200 | 368ms | low | Signals: HTTP 200, root=true, brand=true, build=bamsignal-v1.0.17-20-mrw8he3r |
| Chats | PASS | 200 | 324ms | low | Chats: HTTP 200, root=true, brand=true, build=bamsignal-v1.0.17-20-mrw8he3r |
| Profile | PASS | 200 | 267ms | low | Profile: HTTP 200, root=true, brand=true, build=bamsignal-v1.0.17-20-mrw8he3r |
| Health Endpoint | PASS | 200 | 242ms | low | GET /health → 200; livenessOnly=true |
| Production Ready | PASS | 200 | 644ms | low | GET /ready → 200; ready=true; database=connected |
| OTP | PASS | 400 | 239ms | low | POST /api/auth/email-code → 400 (route mounted, non-5xx) |
| Login API | PASS | 401 | 1229ms | low | POST /api/auth/pin-login → 401 (auth route mounted) |
| Payments | PASS | 400 | 229ms | low | POST /api/paystack/verify → 400 (Paystack route mounted) |
| Feature Flags | PASS | 200 | 259ms | low | GET /api/feature-flags → 200; flags=11 |
| Remote Config | PASS | 200 | 237ms | low | GET /api/remote-config → 200; signals.free_daily_limit=5 |
| Notifications | PASS | 200 | 244ms | low | Remote config exposes notifications.retry_interval_seconds and notifications.templates |
| Discover API | PASS | 401 | 239ms | low | POST member discover → 401 (expects auth without session) |
| Signals API | PASS | 401 | 240ms | low | POST member signals → 401 (expects auth without session) |
| Chats API | PASS | 401 | 234ms | low | POST member chats → 401 (expects auth without session) |
| Profile API | PASS | 401 | 265ms | low | POST member profile → 401 (expects auth without session) |

## Recommendations

- None

---
Command: `npm run smoke:production`
