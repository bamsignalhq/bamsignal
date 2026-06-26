# First 30-Day Operations Plan

Operational rhythm for the first month after public launch. Adjust thresholds as traffic grows.

## Week 1 — Stabilize

| Day | Focus | Actions |
|-----|-------|---------|
| 1 | Deploy verification | `smoke:production`, manual login/signup, `/ready?details=1` |
| 1–2 | Monitoring baselines | Record normal `/ready` latency, error rates, login volume |
| 2–3 | Support readiness | Staff `/hard/support`, document top 10 FAQs |
| 3–4 | Payment watch | Monitor Paystack + `payment_webhook_failed` logs hourly |
| 4–5 | Consultant ops | Clear Operations Center queue daily |
| 6–7 | First retrospective | Incidents, near-misses, update runbooks |

**Exit criteria:** 7 consecutive days `/ready` 200, smoke PASS, no open P1.

## Week 2 — Harden

- Run `npm run certify:security` and `certify:dependencies`.
- Verify backup restore to staging (tabletop).
- Review feature flags — disable experimental flags.
- Android closed testing track if mobile launched.
- SEO: `npm run seo:validate` if public content changed.

## Week 3 — Optimize

- Review Performance Center (`/hard/performance`) and real-user metrics.
- Tune remote config limits (signals, messages) based on abuse signals.
- Consultant quality sample review (`/hard/quality`).
- Document capacity plan: `docs/operations/monitoring/capacity-planning.md`.

## Week 4 — Institutionalize

- Complete Founder Certification (`npm run certify:founder`) for board record.
- Publish release history entry for launch month.
- Update emergency contacts in vault.
- Schedule monthly: backup test, drift cert, RC cert before major releases.

## Daily standing tasks (all 30 days)

1. `curl` `/ready` + review Coolify container health.
2. Triage support queue.
3. Operations Center — assignments + consultations today.
4. Scan logs for `payment_webhook_failed`, `ready_check_failed`.
5. Confirm smoke suite PASS after any deploy.

## Weekly leadership review

- Executive Dashboard — 30-day view.
- Subsystem certification scores (RC dashboard).
- Growth vs infrastructure headroom.
- Go/no-go for marketing spend increases.

## End of month deliverables

- [ ] Launch postmortem (if any P1/P2)
- [ ] Updated Founder Launch Book chapter edits if process changed
- [ ] `npm run build:founder-launch-book` → commit version bump if material
- [ ] 30-day metrics snapshot for board
