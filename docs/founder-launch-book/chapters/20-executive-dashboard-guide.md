# Executive Dashboard Guide

The Executive Dashboard™ provides founder and board-level strategic visibility.

## Access

| Item | Value |
|------|-------|
| Path | `/hard/executive` |
| Brand | Executive Dashboard™ |
| Permission | `ViewExecutiveDashboard` (and related executive roles) |
| Feature flag | `executive_dashboard` (enabled in production seed) |

## Time horizons

Switch views across:

- Today
- 30 days
- 90 days
- 12 months
- Lifetime

## Strategic areas

| Area | Focus |
|------|-------|
| Institution health | Platform stability and readiness scores |
| Growth | Applications, city expansion |
| Journey outcomes | Introductions, relationships, engagements |
| Consultant health | Workforce capacity and quality |
| Communities & events | Community programs |
| Research | Institute and archive metrics |
| Finance | Revenue and payment health |
| Legacy | Long-horizon family / legacy programs |

## Key metrics

Applications, consultations, introductions, relationships, engagements, marriages, legacy families, success stories, cities active, consultants active, revenue.

## How executives should use it

1. **Weekly review** — 30-day view, note `attention` statuses.
2. **Board prep** — export or screenshot lifetime + finance areas; pair with Founder Certification report (`npm run certify:founder`).
3. **Do not** use executive dashboard as real-time incident tool — use `/hard/monitoring` for outages.

## Related surfaces

| Surface | Path |
|---------|------|
| Founder Certification | `/hard/founder-certification` |
| Founder Acceptance (FAT) | `/hard/founder-acceptance` |
| Launch Command | `/hard/launch-command` |
| Business / Finance | `/hard/business`, `/hard/finance` |

Future capabilities documented in `EXECUTIVE_DASHBOARD_FUTURE_KINDS` are not yet implemented — do not promise them externally.
