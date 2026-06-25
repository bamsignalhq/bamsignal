# Capacity Planning

Growth planning for BamSignal infrastructure across user scales. Estimates are **directional** — validate with Supabase metrics, Coolify monitoring, and quarterly reviews.

**Review cadence:** Quarterly, or when crossing a scale tier boundary.

---

## Scale tiers

| Tier | Active members (est.) | Phase |
|------|----------------------|-------|
| **Seed** | 100 | Launch / early adopters |
| **Growth** | 1,000 | City expansion |
| **Scale** | 10,000 | Multi-city Nigeria |
| **National** | 100,000 | National footprint |

---

## Seed — ~100 users

### Database

| Resource | Estimate | Action threshold |
|----------|----------|------------------|
| Postgres size | < 1 GB | Monitor monthly |
| Connections | < 20 concurrent | Default Supabase pool OK |
| Queries | < 50 QPS peak | Index reviews on hot paths |

### Storage

| Resource | Estimate |
|----------|----------|
| Photos | ~5 GB (avg 3 photos × 100 users × ~15 MB) |
| Voice intros | < 1 GB |

### Compute

| Resource | Estimate |
|----------|----------|
| Docker container | 1 instance, 1 vCPU / 2 GB RAM |
| API throughput | < 10 req/s peak |

### Notifications

| Channel | Volume/day |
|---------|------------|
| Email | < 500 |
| Push | < 1,000 |
| WhatsApp | < 200 |

### Operations

| Resource | Estimate |
|----------|----------|
| Concierge applications | < 10/week |
| Consultants | 2–5 active |

### Bandwidth

| Resource | Estimate |
|----------|----------|
| Egress | < 50 GB/month |

---

## Growth — ~1,000 users

### Database

| Resource | Estimate | Action |
|----------|----------|--------|
| Postgres size | 5–15 GB | Enable connection pooling review |
| Connections | 20–50 | Watch pool saturation alerts |
| Indexes | Hot path indexes on discover, chats | `audit:database` quarterly |

### Storage

| Resource | Estimate |
|----------|----------|
| Photos | 50–150 GB |
| Voice | 5–10 GB |

**Action:** Confirm Supabase storage tier; implement lifecycle policy for orphaned uploads.

### Compute

| Resource | Estimate | Action |
|----------|----------|--------|
| Containers | 1–2 instances | Coolify horizontal scale evaluation |
| CPU | 2 vCPU sustained peaks | Alert at 70% |
| Memory | 2–4 GB | Alert at 80% |

### Queues

| Queue | Estimate |
|-------|----------|
| Notification backlog | < 100 normal |
| Concierge queue | < 20 unassigned |

**Action:** Define backlog alerts in [alerts.md](./alerts.md).

### Notifications

| Channel | Volume/day |
|---------|------------|
| Email | 5,000 |
| Push | 10,000 |
| WhatsApp | 2,000 |

**Action:** Verify Resend/SendChamp rate limits and billing tiers.

### Consultants

| Resource | Estimate |
|----------|----------|
| Active consultants | 10–25 |
| Consultations/day | 20–50 |

### Bandwidth & media

| Resource | Estimate |
|----------|----------|
| Egress | 200–500 GB/month |
| CDN | Evaluate if photo delivery latency > 500ms p95 |

---

## Scale — ~10,000 users

### Database

| Resource | Estimate | Action |
|----------|----------|--------|
| Postgres size | 50–200 GB | Supabase compute upgrade |
| Connections | 50–200 | PgBouncer / pooler mandatory |
| Read replicas | Consider | Analytics off primary |
| Partitioning | Large tables | Journey archives, audit logs |

### Storage

| Resource | Estimate |
|----------|----------|
| Photos | 0.5–2 TB |
| Voice | 50–100 GB |

**Action:** Storage CDN; compress uploads; audit retention policy.

### Compute

| Resource | Estimate | Action |
|----------|----------|--------|
| API instances | 2–4 | Load balancer via Coolify |
| Background workers | Dedicated process (future) | Split cron from web |
| Memory per instance | 4 GB min | OOM monitoring |

### Queues

| Queue | Estimate | Action |
|-------|----------|--------|
| Notifications | Async worker pool | Future queue service |
| Concierge | SLA staffing model | Hire ops proportional |

### Notifications

| Channel | Volume/day |
|---------|------------|
| Email | 50,000 |
| Push | 100,000 |
| WhatsApp | 20,000 |

**Action:** Dedicated IP/domain warming for email; FCM batch optimization.

### Operations

| Resource | Estimate |
|----------|----------|
| Consultants | 50–150 |
| Regional teams | Multi-city |
| Ops staff | 24/7 coverage evaluation |

### Bandwidth

| Resource | Estimate |
|----------|----------|
| Egress | 2–5 TB/month |

---

## National — ~100,000 users

### Database

| Resource | Estimate | Action |
|----------|----------|--------|
| Postgres | 500 GB – 2 TB | Enterprise Supabase / dedicated Postgres |
| Sharding strategy | Evaluate | User-id or region shard |
| Archive strategy | Cold storage | Journey + audit retention |

### Storage

| Resource | Estimate |
|----------|----------|
| Media total | 10–50 TB |

**Action:** Object storage tiering; image optimization pipeline.

### Compute

| Resource | Estimate |
|----------|----------|
| API fleet | 4–10+ instances |
| Auto-scaling | Required |
| Edge caching | Public + static assets |

### Notifications

| Channel | Volume/day |
|---------|------------|
| Email | 500,000+ |
| Push | 1M+ |
| WhatsApp | 200,000+ |

**Action:** Enterprise provider contracts; delivery SLO dashboards mandatory.

### Operations

| Resource | Estimate |
|----------|----------|
| Consultants | 500+ |
| Ops center | 24/7 staffed |
| Incident response | Dedicated on-call rotation |

### Bandwidth

| Resource | Estimate |
|----------|----------|
| Egress | 20–100 TB/month |

---

## Capacity triggers (all tiers)

| Signal | Threshold | Action |
|--------|-----------|--------|
| DB connections | > 80% pool | Scale pool / optimize queries |
| DB disk | > 80% | Upgrade tier / archive |
| API p95 latency | > SLO for 7 days | Profile + scale |
| Storage quota | > 80% | Cleanup + upgrade |
| Notification queue | > SLA backlog | Scale workers / ops surge |
| Error budget red | Tier 1 | Pause features; reliability sprint |

---

## Media growth assumptions

| Asset | Avg size | Per user |
|-------|----------|----------|
| Profile photo | 2 MB | 3 photos ≈ 6 MB |
| Voice intro | 500 KB | 0.5 MB |
| Chat media (future) | TBD | TBD |

---

## Consultant & operations scaling

| Users | Concierge apps/month (est. 5%) | Consultants needed (est. 20 active journeys each) |
|-------|-------------------------------|---------------------------------------------------|
| 100 | 5 | 3 |
| 1,000 | 50 | 15 |
| 10,000 | 500 | 100 |
| 100,000 | 5,000 | 500+ |

Operations hiring should lead demand by 4–8 weeks.

---

## Quarterly capacity review checklist

- [ ] Supabase disk, connections, CPU trends
- [ ] Coolify container resource usage
- [ ] Storage bucket growth rate
- [ ] Notification provider billing headroom
- [ ] Consultant workload vs capacity
- [ ] Error budget trend ([error-budget.md](./error-budget.md))
- [ ] Update tier classification (Seed / Growth / Scale / National)
- [ ] Document investments in release or ops notes

---

## Related

- [slos.md](./slos.md)
- [dashboards.md](./dashboards.md) — Infrastructure panel
- [service-dependencies.md](./service-dependencies.md)
- [../runbooks/database-backup.md](../../runbooks/database-backup.md)
