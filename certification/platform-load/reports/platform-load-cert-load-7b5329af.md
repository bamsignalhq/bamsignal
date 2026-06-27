# Platform Load Certification™

**Run ID:** load-7b5329af  
**Generated:** 2026-06-26T22:34:16.578Z  
**Target:** http://127.0.0.1:39457  
**Load score:** 94%  
**Release gate:** PASS

## Load test report

| Metric | Value |
|--------|------:|
| Virtual members | 1000 |
| Max concurrency | 100 |
| Simulation duration | 340460ms |
| Journeys passed | 938/1000 |
| Total requests | 15350 |
| Failure rate | 0.5% |
| API p95 latency | 5ms |
| Health p95 latency | 3ms |
| Database (/ready) p95 | 4ms |
| Max queue depth | 65 |
| CPU user time | 22601ms |
| Runner RAM peak | 91MB |

## Member journeys

| Journey | Members | Passed | Failed |
|---------|--------:|-------:|-------:|
| Full member session | 550 | 521 | 29 |
| Browse + discover | 200 | 191 | 9 |
| Signals + chats | 150 | 135 | 15 |
| Payments + OTP | 100 | 91 | 9 |

## Bottlenecks

| Area | Critical | Metric | Value | Threshold | Detail |
|------|----------|--------|------:|----------:|--------|
| Member journey failures | no | journeysFailed | 62 | 0 | 62 member journeys reported unexpected step outcomes |

## API latency (top endpoints)

| Endpoint | Requests | Failures | p50 | p95 | max |
|----------|--------:|---------:|----:|----:|----:|
| GET /love/login | 550 | 0 | 2 | 8 | 1115 |
| GET / | 1000 | 6 | 3 | 6 | 1441 |
| GET /premium | 1000 | 6 | 2 | 6 | 1529 |
| GET /features | 1000 | 5 | 2 | 6 | 1560 |
| GET /signals | 700 | 13 | 2 | 6 | 144 |
| POST /api/auth/pin-login | 550 | 0 | 3 | 6 | 296 |
| GET /subscription | 650 | 2 | 2 | 5 | 1066 |
| GET /discover | 750 | 2 | 2 | 5 | 851 |
| POST /api/member/data?action=discover | 750 | 0 | 2 | 5 | 280 |
| GET /chats | 700 | 17 | 2 | 5 | 125 |
| GET /love/sign | 650 | 0 | 2 | 5 | 1358 |
| GET /home | 900 | 11 | 2 | 5 | 1585 |
| POST /api/auth/email-code | 650 | 0 | 2 | 5 | 65 |
| GET /profile | 550 | 9 | 2 | 5 | 967 |
| POST /api/member/data?action=signals | 700 | 0 | 2 | 4 | 79 |
| POST /api/paystack/verify | 650 | 0 | 2 | 4 | 472 |
| GET /api/remote-config | 900 | 0 | 2 | 4 | 68 |
| POST /api/member/data?action=chats | 700 | 0 | 2 | 4 | 28 |
| POST /api/member/data?action=profile | 550 | 0 | 2 | 4 | 926 |
| POST /api/member/data?action=profile-patch | 550 | 0 | 2 | 4 | 577 |

## Recommendations

- **[high]** Optimize hottest endpoints: GET /love/login p95=8ms; GET / p95=6ms; GET /premium p95=6ms; GET /features p95=6ms; GET /signals p95=6ms
