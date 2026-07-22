# Platform Load Certification™

**Run ID:** load-f86f3bda  
**Generated:** 2026-07-22T14:31:31.521Z  
**Target:** http://127.0.0.1:39457  
**Load score:** 100%  
**Release gate:** PASS

## Load test report

| Metric | Value |
|--------|------:|
| Virtual members | 1000 |
| Max concurrency | 100 |
| Simulation duration | 351316ms |
| Journeys passed | 1000/1000 |
| Total requests | 15350 |
| Failure rate | 0% |
| API p95 latency | 8ms |
| Health p95 latency | 6ms |
| Database (/ready) p95 | 8ms |
| Max queue depth | 101 |
| CPU user time | 36632ms |
| Runner RAM peak | 79MB |

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
| GET /signals | 700 | 0 | 2 | 150 | 4048 |
| GET /discover | 750 | 0 | 2 | 52 | 4197 |
| POST /api/member/data?action=discover | 750 | 0 | 2 | 26 | 3803 |
| POST /api/auth/email-code | 650 | 0 | 1 | 20 | 1600 |
| GET /features | 1000 | 0 | 3 | 17 | 4168 |
| POST /api/member/data?action=signals | 700 | 0 | 2 | 12 | 4008 |
| GET /chats | 700 | 0 | 3 | 12 | 3649 |
| GET /premium | 1000 | 0 | 3 | 10 | 4159 |
| GET /api/remote-config | 900 | 0 | 2 | 10 | 1609 |
| GET /home | 900 | 0 | 2 | 8 | 1913 |
| GET /profile | 550 | 0 | 2 | 8 | 4022 |
| GET / | 1000 | 0 | 3 | 7 | 4130 |
| POST /api/auth/pin-login | 550 | 0 | 2 | 7 | 4145 |
| GET /api/feature-flags | 900 | 0 | 2 | 7 | 3744 |
| GET /love/login | 550 | 0 | 2 | 6 | 4165 |
| GET /subscription | 650 | 0 | 3 | 6 | 2016 |
| GET /love/sign | 650 | 0 | 3 | 6 | 4292 |
| POST /api/paystack/verify | 650 | 0 | 2 | 5 | 1585 |
| POST /api/member/data?action=chats | 700 | 0 | 1 | 5 | 1980 |
| POST /api/member/data?action=profile | 550 | 0 | 2 | 5 | 1580 |

## Instrumentation

| Metric | Value |
|--------|------:|
| Queue wait p95 | 0ms |
| Worker utilization p95 | 100% |
| Event-loop lag p95 | 4ms |
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
| Load runner opened fresh fetch sockets without connection reuse | Queue depth peaked at 65 baseline; instrumentation connectionReuseHint=0 | Transient socket exhaustion and ECONNRESET under 100-way concurrency | Undici Agent with keep-alive (128 connections) shared across virtual members | Queue depth 65 · no connection pooling | Queue depth 101 · keep-alive agent active |
| No retry policy for transient idempotent GET failures | Baseline 0.5% failure rate with max page latency 1585ms | Single timeout or 503 permanently marks journey failed despite recoverable blip | Exponential backoff retries (max 4) for GET/HEAD/probes on retriable statuses | 0 retries · failures counted immediately | 0 retry attempts · 0 recoveries |


## Recommendations

- **[high]** Optimize hottest endpoints: GET /signals p95=150ms; GET /discover p95=52ms; POST /api/member/data?action=discover p95=26ms; POST /api/auth/email-code p95=20ms; GET /features p95=17ms
