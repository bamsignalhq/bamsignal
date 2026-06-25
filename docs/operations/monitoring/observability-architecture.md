# Observability Architecture

**Status:** Architecture and preparation only — **no vendor implementation.**

Defines how BamSignal will integrate metrics, logs, tracing, synthetic monitoring, RUM, and APM in the future. The operational model in this directory remains authoritative; vendors are **adapters**, not replacements.

---

## Design principles

| Principle | Rationale |
|-----------|-----------|
| Model-first | SLIs/SLOs defined before tooling |
| Open telemetry | Prefer OpenTelemetry-compatible exporters |
| No secret leakage | Redact via existing `logRedaction.js` patterns |
| Non-blocking | Observability failures must not break app |
| Release-aware | Tag all telemetry with `release_version`, `commit_sha` |
| Cost-conscious | Sample traces; aggregate metrics; tier retention |

---

## Architecture overview

```text
┌─────────────────────────────────────────────────────────────────┐
│                        BamSignal Production                      │
│  Web/PWA · Android · Node API · Admin · Background jobs          │
└────────────┬───────────────────────────────┬────────────────────┘
             │                               │
             ▼                               ▼
    ┌────────────────┐              ┌────────────────┐
    │  Logs (stdout) │              │ Health probes  │
    │  structured    │              │ /health /ready │
    └────────┬───────┘              └────────┬───────┘
             │                               │
             ▼                               ▼
┌────────────────────────────────────────────────────────────────┐
│              Observability Collector Layer (future)             │
│  OTel SDK · log shipper · metric scraper · trace exporter       │
└────────────┬───────────────────┬───────────────────┬───────────┘
             │                   │                   │
             ▼                   ▼                   ▼
      ┌────────────┐      ┌────────────┐      ┌────────────┐
      │   Metrics  │      │    Logs    │      │  Traces    │
      │  (reserved)│      │  (reserved)│      │ (reserved) │
      └────────────┘      └────────────┘      └────────────┘
             │                   │                   │
             └───────────────────┼───────────────────┘
                                 ▼
                    ┌────────────────────────┐
                    │  Dashboards & Alerts   │
                    │  (maps to dashboards.md│
                    │   and alerts.md)       │
                    └────────────────────────┘
```

---

## Pillars

### 1. Metrics (reserved)

**Purpose:** Time-series SLI measurement at low cardinality.

| Metric class | Examples | Maps to |
|--------------|----------|---------|
| Counter | `http_requests_total`, `payment_webhook_failed_total` | SLI-ERR-* |
| Gauge | `db_connections_active`, `queue_depth` | Capacity, alerts |
| Histogram | `http_request_duration_seconds` | SLI-LAT-* |

**Instrumentation points (future):**

- Express middleware — request duration, status code
- `/ready` evaluator — dependency boolean gauges
- Payment webhook handler — success/failure counters
- Notification senders — delivery counters

**Labels (mandatory):** `env`, `service`, `route`, `release_version`

**Not integrated:** Prometheus, Datadog, CloudWatch, Grafana Cloud

---

### 2. Logs (reserved)

**Purpose:** Structured events for debugging and alert aggregation.

**Today:** `server/services/observability.js` → stdout JSON-ish events

**Future pipeline:**

1. Container stdout → log shipper (Fluent Bit / Vector)
2. Parse known events (`ready_check_failed`, etc.)
3. Index with `requestId`, `correlationId`
4. Retention: 30d hot, 90d warm, 1y cold archive

**Rules:**

- Extend `logRedaction.js` — never ship PINs, tokens, PII
- Correlate logs to traces via `trace_id` (future)

**Not integrated:** ELK, Loki, Datadog Logs, CloudWatch Logs

---

### 3. Tracing (reserved)

**Purpose:** Request path latency breakdown across API → DB → external APIs.

**Future scope:**

- OpenTelemetry Node SDK in `server/app.js`
- Spans: Paystack call, Supabase query, Resend send, SendChamp send
- Sample rate: 10% normal, 100% on error

**Maps to:** SLI-LAT-API-P95, payment latency SLIs

**Not integrated:** Jaeger, Tempo, Datadog APM, X-Ray

---

### 4. Synthetic monitoring (reserved)

**Purpose:** Proactive availability outside user traffic.

**Future checks:**

| Check | Frequency | SLI |
|-------|-----------|-----|
| `GET /ready` | 60s | SLI-AVAIL-API |
| `GET /` public homepage | 5 min | SLI-AVAIL-PUBLIC |
| Login flow (test account) | 15 min | SLI-AVAIL-MEMBER |
| Paystack init (test mode/staging) | 30 min | SLI-PAY-INIT |
| assetlinks.json | 1 hour | Deep link SLI |

**Not integrated:** Pingdom, UptimeRobot, Checkly, Datadog Synthetics

---

### 5. RUM — Real User Monitoring (reserved)

**Purpose:** Member-facing latency and error experience.

**Future scope:**

- Web Vitals (LCP, INP, CLS) from PWA
- Client error boundary captures (sanitized)
- Route transition timing for `/home`, `/discover`, payments

**Privacy:** No PIN, message content, or photos in RUM payloads.

**Not integrated:** Datadog RUM, Sentry Session Replay, Google Analytics 4 (performance only)

---

### 6. APM — Application Performance Monitoring (reserved)

**Purpose:** Code-level performance — slow routes, N+1 queries, memory.

**Future scope:**

- Node CPU/memory profiling on demand
- Slow query log correlation from Supabase
- Admin tab load performance

**Not integrated:** New Relic, Datadog APM, Elastic APM

---

### 7. Distributed tracing (reserved)

**Purpose:** Cross-service flows — payment webhook → DB fulfill → email send.

**Future trace IDs:**

- Propagate `x-request-id` (existing) → W3C `traceparent`
- Link Android Capacitor WebView requests to API spans

**Not integrated:** Any vendor — OTel standard first

---

## Integration adapter pattern

When selecting a vendor:

```text
SLI definition (slis.md)
        ↓
Instrument in code (OTel)
        ↓
Exporter adapter (vendor-specific)
        ↓
Dashboard panel (dashboards.md)
        ↓
Alert rule (alerts.md)
        ↓
Runbook (runbooks.md)
```

**Do not** let vendor defaults redefine SLO targets.

---

## Release & deploy correlation

| Signal | Tag |
|--------|-----|
| Docker deploy | `commit_sha`, `build_timestamp` |
| Android AAB | `android_version_code` |
| Schema | `migration_version` |
| Cache | `sw_cache_version` |

Future: Coolify webhook → annotate metrics at deploy boundary for [Release Health dashboard](./dashboards.md).

Links: [Release Management System](../../releases/README.md), [automation-architecture.md](../../releases/automation-architecture.md)

---

## Admin surfaces (today)

In-repo institutional dashboards remain until external dashboards mature:

| Surface | Path |
|---------|------|
| System Health | `/hard/system-health` |
| Monitoring Center | `/hard/monitoring` |
| Performance Center | `/hard/performance` |
| Launch Certification | `/hard/launch-certification` |

External dashboards should **mirror**, not duplicate, admin-only institutional data.

---

## Security & compliance

| Requirement | Implementation |
|-------------|----------------|
| PII redaction | `logRedaction.js` |
| Diagnostics access | `x-diagnostics-secret` / admin session |
| Secret exclusion | No env values in metrics labels |
| Retention policy | Document per pillar when vendor chosen |
| Nigeria data residency | Evaluate vendor region on selection |

---

## Implementation phases

| Phase | Scope | Exit criteria |
|-------|-------|---------------|
| **0 (complete)** | This framework + in-repo logs + `/ready` | Ops can triage without vendor |
| **1** | External uptime on `/ready`; log aggregation | SLI-AVAIL-API automated |
| **2** | OTel metrics + request histograms | SLI-LAT-API on dashboard |
| **3** | Distributed tracing on payment path | Payment latency debuggable |
| **4** | RUM + synthetic login | Member SLI automated |
| **5** | Full APM + anomaly detection | Tier 1 SLOs auto-tracked |

---

## Reserved — explicit non-goals

The following are **not** part of this implementation:

- Datadog agent installation
- Grafana stack deployment
- Prometheus scrape configs
- Sentry DSN in production client
- New Relic license
- CloudWatch agent on Coolify host
- PagerDuty account setup

Document vendor selection in a future ADR when Phase 1 begins.

---

## Related

- [README.md](./README.md)
- [slis.md](./slis.md)
- [slos.md](./slos.md)
- [dashboards.md](./dashboards.md)
- [alerts.md](./alerts.md)
- [MONITORING.md](../../../MONITORING.md) (legacy in-repo reference)
