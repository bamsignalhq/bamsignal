# Platform Load Certification™

**Run ID:** load-9d971926  
**Generated:** 2026-06-26T23:00:33.642Z  
**Target:** http://127.0.0.1:39457  
**Load score:** 100%  
**Release gate:** PASS

## Load test report

| Metric | Value |
|--------|------:|
| Virtual members | 24 |
| Max concurrency | 8 |
| Simulation duration | 7923ms |
| Journeys passed | 24/24 |
| Total requests | 504 |
| Failure rate | 0% |
| API p95 latency | 5ms |
| Health p95 latency | 4ms |
| Database (/ready) p95 | 3ms |
| Max queue depth | 4 |
| CPU user time | 1149ms |
| Runner RAM peak | 19MB |

## Member journeys

| Journey | Members | Passed | Failed |
|---------|--------:|-------:|-------:|
| Full member session | 24 | 24 | 0 |
| Browse + discover | 0 | 0 | 0 |
| Signals + chats | 0 | 0 | 0 |
| Payments + OTP | 0 | 0 | 0 |

## Bottlenecks

| Area | Critical | Metric | Value | Threshold | Detail |
|------|----------|--------|------:|----------:|--------|


## API latency (top endpoints)

| Endpoint | Requests | Failures | p50 | p95 | max |
|----------|--------:|---------:|----:|----:|----:|
| POST /api/auth/pin-login | 24 | 0 | 3 | 9 | 16 |
| GET /premium | 24 | 0 | 3 | 7 | 10 |
| GET /features | 24 | 0 | 2 | 7 | 8 |
| GET / | 24 | 0 | 3 | 6 | 17 |
| GET /love/login | 24 | 0 | 3 | 6 | 8 |
| GET /chats | 24 | 0 | 3 | 6 | 7 |
| GET /profile | 24 | 0 | 3 | 6 | 6 |
| GET /discover | 24 | 0 | 2 | 5 | 5 |
| GET /signals | 24 | 0 | 3 | 5 | 7 |
| POST /api/member/data?action=chats | 24 | 0 | 2 | 5 | 5 |
| GET /api/feature-flags | 24 | 0 | 2 | 5 | 5 |
| POST /api/member/data?action=discover | 24 | 0 | 2 | 4 | 6 |
| POST /api/member/data?action=profile | 24 | 0 | 2 | 4 | 5 |
| POST /api/member/data?action=profile-patch | 24 | 0 | 2 | 4 | 4 |
| GET /home | 24 | 0 | 3 | 4 | 5 |
| GET /subscription | 24 | 0 | 2 | 4 | 5 |
| GET /love/sign | 24 | 0 | 3 | 4 | 5 |
| POST /api/auth/email-code | 24 | 0 | 2 | 4 | 5 |
| POST /api/member/data?action=signals | 24 | 0 | 2 | 3 | 4 |
| GET /api/remote-config | 24 | 0 | 2 | 3 | 5 |

## Recommendations

- **[high]** Optimize hottest endpoints: POST /api/auth/pin-login p95=9ms; GET /premium p95=7ms; GET /features p95=7ms; GET / p95=6ms; GET /love/login p95=6ms
