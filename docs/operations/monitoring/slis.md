# Service Level Indicators (SLIs)

SLIs are **measurable signals** of service behavior. They feed SLOs and error budgets. Each SLI defines measurement method, data source, and aggregation window.

**No vendor required** — SLIs can be measured manually, via logs, admin dashboards, or future metrics pipelines.

---

## SLI catalog

### Availability SLIs

| SLI ID | Name | Definition | Measurement | Window |
|--------|------|------------|-------------|--------|
| SLI-AVAIL-API | API availability | Successful `/ready` probes / total probes | External HTTP probe | 30d rolling |
| SLI-AVAIL-HEALTH | Process liveness | Successful `/health` probes / total | External HTTP probe | 30d rolling |
| SLI-AVAIL-MEMBER | Member app availability | Successful loads of `/home` (auth session) / attempts | Synthetic or RUM | 30d rolling |
| SLI-AVAIL-ADMIN | Admin availability | Successful `/hard/auth` + dashboard load / attempts | Synthetic | 30d rolling |
| SLI-AVAIL-OPS | Operations availability | Operations Center reachable / attempts | Admin probe | 30d rolling |
| SLI-AVAIL-PUBLIC | Public site availability | `GET /` returns 200 / attempts | External probe | 30d rolling |

---

### Latency SLIs

| SLI ID | Name | Definition | Measurement | Window |
|--------|------|------------|-------------|--------|
| SLI-LAT-API-P50 | API latency p50 | 50th percentile server response time | Request logs / APM | 30d |
| SLI-LAT-API-P95 | API latency p95 | 95th percentile server response time | Request logs / APM | 30d |
| SLI-LAT-API-P99 | API latency p99 | 99th percentile server response time | Request logs / APM | 30d |
| SLI-LAT-DB-P95 | Database query p95 | 95th percentile query duration | Supabase / pg_stat | 30d |
| SLI-LAT-PAY-INIT | Payment initialize latency | Time to Paystack init response | Payment logs | 30d |
| SLI-LAT-PAY-VERIFY | Payment verify latency | Init → verified entitlement | Ledger timestamps | 30d |
| SLI-LAT-CONCIERGE | Application processing | Submit → first ops action | Operations timestamps | 30d |
| SLI-LAT-SCHEDULE | Consultation scheduling | Request → confirmed slot | Scheduling engine | 30d |

---

### Error rate SLIs

| SLI ID | Name | Definition | Measurement | Window |
|--------|------|------------|-------------|--------|
| SLI-ERR-API-5XX | API server error rate | 5xx responses / total API requests | Access logs | 30d |
| SLI-ERR-AUTH | Authentication failure rate | Failed pin-login / total attempts | `pin_login_failed` logs | 30d |
| SLI-ERR-PAY-WH | Payment webhook error rate | `payment_webhook_failed` / webhooks received | Structured logs | 30d |
| SLI-ERR-PAY-VERIFY | Payment verify error rate | Failed verifies / total verifies | Payment API logs | 30d |
| SLI-ERR-UPLOAD | Photo upload error rate | Failed uploads / total uploads | API + client | 30d |
| SLI-ERR-NOTIF-EMAIL | Email delivery error rate | Failed sends / attempted | Resend API | 30d |
| SLI-ERR-NOTIF-PUSH | Push delivery error rate | Failed FCM / attempted | Firebase | 30d |
| SLI-ERR-NOTIF-WA | WhatsApp delivery error rate | Failed SendChamp / attempted | SendChamp API | 30d |

---

### Notification delivery SLIs

| SLI ID | Name | Definition | Target direction |
|--------|------|------------|------------------|
| SLI-NOTIF-EMAIL | Email delivery success | Delivered / sent | Higher is better |
| SLI-NOTIF-PUSH | Push delivery success | Delivered / sent | Higher is better |
| SLI-NOTIF-WA | WhatsApp delivery success | Delivered / sent | Higher is better |
| SLI-NOTIF-SIGNUP | Signup email success | Signup emails sent / signups completed | Higher is better |

---

### Payment SLIs

| SLI ID | Name | Definition |
|--------|------|------------|
| SLI-PAY-INIT | Initialize success | Successful Paystack inits / attempts |
| SLI-PAY-VERIFY | Verify success | Successful verifies / callbacks |
| SLI-PAY-FULFILL | Fulfillment success | Entitlements granted / successful payments |
| SLI-PAY-EMAIL | Purchase email success | Confirmation emails sent / fulfillments |

---

### Business / product SLIs

| SLI ID | Name | Definition |
|--------|------|------------|
| SLI-JOURNEY-PERSIST | Journey persistence | Journey writes persisted / attempts |
| SLI-CONCIERGE-QUEUE | Concierge queue age | p95 time in queue before assignment |
| SLI-SIGNUP-COMPLETE | Signup completion | Completed profiles / started signups |
| SLI-DEEP-LINK | Deep link success | App opens / link clicks (Android) |

---

## Measurement methods

### Today (in-repo)

| Method | SLIs covered |
|--------|--------------|
| `GET /ready` external probe | SLI-AVAIL-API |
| `GET /health` probe | SLI-AVAIL-HEALTH |
| Structured logs | SLI-ERR-AUTH, SLI-ERR-PAY-WH |
| Admin Monitoring Center | Concierge, ops aggregates |
| Release metrics template | Manual T+0 / T+24h capture |
| Play Console | Android crash-free (adjacent SLI) |

### Future integration

| Method | SLIs enabled |
|--------|--------------|
| Metrics (Prometheus/Datadog) | All latency + error rate SLIs |
| Log aggregation | Error rates, auth, payments |
| Synthetic monitoring | SLI-AVAIL-MEMBER, SLI-AVAIL-PUBLIC |
| RUM | Real user latency, member availability |
| Distributed tracing | Per-route latency breakdown |

See [observability-architecture.md](./observability-architecture.md).

---

## SLI labeling convention (future metrics)

```text
bamsignal_<sli_id>_<stat>{env="production", service="api", route="/api/auth/pin-login"}
```

Example: `bamsignal_sli_lat_api_p95{env="production"}`

---

## SLI review cadence

| Activity | Frequency |
|----------|-----------|
| Validate SLI still measurable | Quarterly |
| Add SLI for new production service | At service launch |
| Remove obsolete SLI | When service retired |
| Correlate SLI to SLO | Each SLO review |

---

## Related

- [slos.md](./slos.md)
- [error-budget.md](./error-budget.md)
- [dashboards.md](./dashboards.md)
- [alerts.md](./alerts.md)
