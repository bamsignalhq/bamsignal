# Production Smoke Suite™

**Run ID:** smoke-6755a178  
**Target:** https://bamsignal.com  
**Generated:** 2026-06-29T13:12:51.259Z  
**Deployment timestamp:** 2026-06-29T13:12:46.000Z  
**Commit SHA:** 85de8267dff800ccdecdd2261da21cdda6535a68  
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
| Landing Page | PASS | 200 | 1171ms | low | Landing Page: HTTP 200, root=true, brand=true, build=bamsignal-v1.0.15-18-mqx2n4dm |
| Signup | PASS | 200 | 251ms | low | Signup: HTTP 200, root=true, brand=true, build=bamsignal-v1.0.15-18-mqx2n4dm |
| Login | PASS | 200 | 244ms | low | Login: HTTP 200, root=true, brand=true, build=bamsignal-v1.0.15-18-mqx2n4dm |
| Discover | PASS | 200 | 250ms | low | Discover: HTTP 200, root=true, brand=true, build=bamsignal-v1.0.15-18-mqx2n4dm |
| Signals | PASS | 200 | 244ms | low | Signals: HTTP 200, root=true, brand=true, build=bamsignal-v1.0.15-18-mqx2n4dm |
| Chats | PASS | 200 | 285ms | low | Chats: HTTP 200, root=true, brand=true, build=bamsignal-v1.0.15-18-mqx2n4dm |
| Profile | PASS | 200 | 235ms | low | Profile: HTTP 200, root=true, brand=true, build=bamsignal-v1.0.15-18-mqx2n4dm |
| Health Endpoint | PASS | 200 | 288ms | low | GET /health → 200; livenessOnly=true |
| Production Ready | PASS | 200 | 530ms | low | GET /ready → 200; ready=true; database=unknown |
| OTP | PASS | 400 | 313ms | low | POST /api/auth/email-code → 400 (route mounted, non-5xx) |
| Login API | PASS | 401 | 453ms | low | POST /api/auth/pin-login → 401 (auth route mounted) |
| Payments | PASS | 400 | 230ms | low | POST /api/paystack/verify → 400 (Paystack route mounted) |
| Feature Flags | PASS | 200 | 224ms | low | GET /api/feature-flags → 200; flags=11 |
| Remote Config | PASS | 200 | 248ms | low | GET /api/remote-config → 200; signals.free_daily_limit=5 |
| Notifications | PASS | 200 | 242ms | low | Remote config exposes notifications.retry_interval_seconds and notifications.templates |
| Discover API | PASS | 401 | 241ms | low | POST member discover → 401 (expects auth without session) |
| Signals API | PASS | 401 | 229ms | low | POST member signals → 401 (expects auth without session) |
| Chats API | PASS | 401 | 362ms | low | POST member chats → 401 (expects auth without session) |
| Profile API | PASS | 401 | 230ms | low | POST member profile → 401 (expects auth without session) |

## Recommendations

- None

---
Command: `npm run smoke:production`
