# BamSignal Release Metrics Snapshot

> Copy to `docs/releases/metrics/YYYY-MM-DD-vX.Y.Z-metrics.md` at T+0, T+24h, T+48h, and T+7d.  
> Attach summary rows to the parent [release record](./release-template.md#operational-metrics).

---

## Snapshot Metadata

| Field | Value |
|-------|-------|
| **Release Version** | vX.Y.Z |
| **Git Commit** | `<sha>` |
| **Capture Time** | YYYY-MM-DD HH:MM WAT |
| **Capture Window** | T+0 / T+24h / T+48h / T+7d |
| **Environment** | Production |
| **Captured By** | |

---

## API

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Request rate (req/min) | | | ☐ OK ☐ Warn ☐ Critical |
| p50 latency (ms) | | | |
| p95 latency (ms) | | | |
| p99 latency (ms) | | | |
| 5xx rate (%) | | < 0.1% | |
| 4xx rate (%) | | | |
| `/health` uptime | | 100% | |
| `/ready` uptime | | 100% | |

**Notes:**

---

## Database

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Active connections | | | |
| Connection pool utilization (%) | | < 80% | |
| Slow queries (>1s) / hour | | | |
| Migration lag | | 0 pending | |
| Disk usage (%) | | < 80% | |
| Replication lag (if applicable) | | | |

**Schema version:** Latest file in `migrations/`

---

## Infrastructure

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| CPU utilization (%) | | < 70% | |
| Memory utilization (%) | | < 80% | |
| Container restarts (24h) | | 0 | |
| Disk I/O | | | |
| Network bandwidth (Mbps) | | | |
| Coolify deploy status | | Success | |

**Docker image:** Coolify deployment SHA `<commit>`

---

## Payments

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Paystack initialize success rate | | > 99% | |
| Paystack verify success rate | | > 99% | |
| Webhook delivery success | | > 99% | |
| Failed fulfillments (24h) | | 0 | |
| Payment return path errors | | 0 | |

Runbook: [payment-recovery.md](../../runbooks/payment-recovery.md)

---

## Notifications

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Email delivery rate | | > 98% | |
| Push notification success | | > 95% | |
| WhatsApp delivery (SendChamp) | | > 95% | |
| Notification queue backlog | | 0 | |

---

## Operations

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Signal Concierge queue depth | | | |
| Assignment engine latency | | | |
| Admin action errors (24h) | | | |
| Cron job success rate | | 100% | |

---

## Concierge

| Metric | Value | Notes |
|--------|-------|-------|
| Active sessions | | |
| Avg response time | | |
| Escalations (24h) | | |

---

## Android

| Metric | Value | Notes |
|--------|-------|-------|
| Version name | | `android/app/build.gradle` |
| Version code | | |
| Crash-free sessions (%) | | Play Console |
| ANR rate | | Play Console |
| Deep link verification | | [checklist](../checklists/deep-link-verification.md) |

---

## Web

| Metric | Value | Notes |
|--------|-------|-------|
| Lighthouse performance | | |
| Service worker cache version | | `scripts/sync-cache-version.mjs` |
| Core Web Vitals LCP | | |
| PWA install success | | |

---

## Error Budget

| SLO | Budget (30d) | Consumed | Remaining | Status |
|-----|--------------|----------|-----------|--------|
| API availability | 99.9% | | | ☐ OK ☐ At risk ☐ Exhausted |
| Payment success | 99.5% | | | |
| Readiness (`/ready`) | 99.9% | | | |

---

## SLO

| Service | Objective | Measurement Window | Current |
|---------|-----------|-------------------|---------|
| Public homepage | 99.9% available | 30d | |
| Member auth | 99.5% login success | 30d | |
| Payment flow | 99% end-to-end | 30d | |

---

## SLA

| Tier | Commitment | This Release |
|------|------------|--------------|
| Production uptime | 99.9% monthly | |
| Incident response (SEV-1) | < 15 min acknowledge | |
| Incident resolution (SEV-1) | < 4 hours | |

---

## Anomalies & Actions

| Anomaly | Severity | Action Taken | Follow-up |
|---------|----------|--------------|-----------|
| | | | |
