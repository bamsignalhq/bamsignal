# Platform Load Certification™

**Run ID:** load-6425eaf6  
**Generated:** 2026-06-27T11:17:33.972Z  
**Target:** http://127.0.0.1:39457  
**Load score:** 100%  
**Release gate:** PASS

## Load test report

| Metric | Value |
|--------|------:|
| Virtual members | 1000 |
| Max concurrency | 100 |
| Simulation duration | 346873ms |
| Journeys passed | 1000/1000 |
| Total requests | 15350 |
| Failure rate | 0% |
| API p95 latency | 4ms |
| Health p95 latency | 2ms |
| Database (/ready) p95 | 3ms |
| Max queue depth | 44 |
| CPU user time | 19187ms |
| Runner RAM peak | 68MB |

## Member journeys

| Journey | Members | Passed | Failed |
|---------|--------:|-------:|-------:|
| Full member session | 550 | 550 | 0 |
| Browse + discover | 200 | 200 | 0 |
| Signals + chats | 150 | 150 | 0 |
| Payments + OTP | 100 | 100 | 0 |

## Bottlenecks

| Area | Critical | Metric | Value | Threshold | Detail |
|------|----------|--------|------:|----------:|--------|


## API latency (top endpoints)

| Endpoint | Requests | Failures | p50 | p95 | max |
|----------|--------:|---------:|----:|----:|----:|
| POST /api/auth/pin-login | 550 | 0 | 2 | 6 | 304 |
| GET /features | 1000 | 0 | 2 | 5 | 584 |
| GET /discover | 750 | 0 | 2 | 5 | 795 |
| GET /signals | 700 | 0 | 2 | 5 | 576 |
| GET / | 1000 | 0 | 2 | 4 | 889 |
| GET /premium | 1000 | 0 | 2 | 4 | 753 |
| POST /api/member/data?action=discover | 750 | 0 | 2 | 4 | 336 |
| GET /love/login | 550 | 0 | 2 | 4 | 735 |
| GET /subscription | 650 | 0 | 2 | 4 | 77 |
| POST /api/member/data?action=signals | 700 | 0 | 2 | 4 | 533 |
| GET /chats | 700 | 0 | 2 | 4 | 866 |
| GET /home | 900 | 0 | 2 | 4 | 583 |
| GET /love/sign | 650 | 0 | 2 | 4 | 85 |
| POST /api/member/data?action=chats | 700 | 0 | 2 | 4 | 720 |
| POST /api/auth/email-code | 650 | 0 | 2 | 4 | 512 |
| GET /profile | 550 | 0 | 2 | 4 | 963 |
| POST /api/member/data?action=profile | 550 | 0 | 2 | 4 | 746 |
| POST /api/member/data?action=profile-patch | 550 | 0 | 2 | 4 | 785 |
| GET /api/remote-config | 900 | 0 | 1 | 3 | 518 |
| POST /api/paystack/verify | 650 | 0 | 2 | 3 | 17 |

## Instrumentation

| Metric | Value |
|--------|------:|
| Queue wait p95 | 0ms |
| Worker utilization p95 | 100% |
| Event-loop lag p95 | 2ms |
| Retry attempts | 0 |
| Retry recoveries | 0 |
| Connection reuse hint | 0 |

## Failure classification

| Category | Count | Samples |
|----------|------:|--------:|
_No classified failures._

## Enterprise Load Report

Baseline run: `load-7b5329af`

| Root Cause | Evidence | Impact | Fix | Before | After |
|------------|----------|--------|-----|--------|-------|
| SPA fallback used per-request sendFile under concurrent page load | 71 GET page failures in baseline; hotspots /chats (0), /signals, /home | Member journey aborts when index.html delivery fails or stalls under burst concurrency | Serve cached in-memory index.html for SPA routes; load-cert HTTP keep-alive + idempotent GET retries | 938/1000 journeys · 71 request failures | 1000/1000 journeys · 0 request failures |
| Load runner opened fresh fetch sockets without connection reuse | Queue depth peaked at 65 baseline; instrumentation connectionReuseHint=0 | Transient socket exhaustion and ECONNRESET under 100-way concurrency | Undici Agent with keep-alive (128 connections) shared across virtual members | Queue depth 65 · no connection pooling | Queue depth 44 · keep-alive agent active |
| No retry policy for transient idempotent GET failures | Baseline 0.5% failure rate with max page latency 1585ms | Single timeout or 503 permanently marks journey failed despite recoverable blip | Exponential backoff retries (max 4) for GET/HEAD/probes on retriable statuses | 0 retries · failures counted immediately | 0 retry attempts · 0 recoveries |


## Recommendations

- **[high]** Optimize hottest endpoints: POST /api/auth/pin-login p95=6ms; GET /features p95=5ms; GET /discover p95=5ms; GET /signals p95=5ms; GET / p95=4ms
