# Platform Load Certification™

**Run ID:** load-fa95f840  
**Generated:** 2026-06-26T23:25:10.621Z  
**Target:** http://127.0.0.1:39457  
**Load score:** 94%  
**Release gate:** PASS

## Load test report

| Metric | Value |
|--------|------:|
| Virtual members | 1000 |
| Max concurrency | 100 |
| Simulation duration | 364638ms |
| Journeys passed | 895/1000 |
| Total requests | 15350 |
| Failure rate | 1.6% |
| API p95 latency | 110ms |
| Health p95 latency | 93ms |
| Database (/ready) p95 | 72ms |
| Max queue depth | 101 |
| CPU user time | 29125ms |
| Runner RAM peak | 141MB |

## Member journeys

| Journey | Members | Passed | Failed |
|---------|--------:|-------:|-------:|
| Full member session | 550 | 479 | 71 |
| Browse + discover | 200 | 180 | 20 |
| Signals + chats | 150 | 136 | 14 |
| Payments + OTP | 100 | 100 | 0 |

## Bottlenecks

| Area | Critical | Metric | Value | Threshold | Detail |
|------|----------|--------|------:|----------:|--------|
| Member journey failures | no | journeysFailed | 105 | 0 | 105 member journeys reported unexpected step outcomes |

## API latency (top endpoints)

| Endpoint | Requests | Failures | p50 | p95 | max |
|----------|--------:|---------:|----:|----:|----:|
| GET /profile | 550 | 6 | 2 | 263 | 5058 |
| GET /discover | 750 | 35 | 2 | 251 | 5008 |
| GET /chats | 700 | 12 | 2 | 250 | 4808 |
| GET /signals | 700 | 17 | 2 | 215 | 4950 |
| POST /api/member/data?action=profile-patch | 550 | 0 | 2 | 173 | 6745 |
| POST /api/member/data?action=signals | 700 | 0 | 2 | 158 | 4913 |
| GET /home | 900 | 0 | 2 | 149 | 7419 |
| GET /features | 1000 | 41 | 2 | 148 | 5068 |
| POST /api/member/data?action=chats | 700 | 0 | 2 | 144 | 2765 |
| POST /api/member/data?action=discover | 750 | 0 | 2 | 124 | 4381 |
| POST /api/member/data?action=profile | 550 | 0 | 2 | 124 | 3510 |
| GET /premium | 1000 | 38 | 2 | 106 | 5027 |
| GET /subscription | 650 | 5 | 2 | 103 | 7575 |
| GET /api/remote-config | 900 | 0 | 1 | 100 | 6746 |
| GET /api/feature-flags | 900 | 0 | 1 | 88 | 6751 |
| GET /love/sign | 650 | 16 | 2 | 85 | 7614 |
| POST /api/auth/email-code | 650 | 0 | 2 | 63 | 6747 |
| GET /love/login | 550 | 34 | 2 | 56 | 825 |
| POST /api/paystack/verify | 650 | 0 | 2 | 43 | 3923 |
| GET / | 1000 | 37 | 2 | 38 | 5003 |

## Recommendations

- **[high]** Optimize hottest endpoints: GET /profile p95=263ms; GET /discover p95=251ms; GET /chats p95=250ms; GET /signals p95=215ms; POST /api/member/data?action=profile-patch p95=173ms
