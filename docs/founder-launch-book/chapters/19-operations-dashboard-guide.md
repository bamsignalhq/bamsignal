# Operations Dashboard Guide

Institutional operations run from the **Hard console** at `/hard/command` (Command Center tab hub).

## Entry and auth

- URL: https://bamsignal.com/hard/auth → `/hard/command`
- Auth: admin username + PIN (`COMMAND_CENTER_PIN` ecosystem)
- Permissions: role-based via `src/constants/permissions.ts`

## Daily operations map

| Need | Go to |
|------|-------|
| Command overview | `/hard/command` |
| Concierge pipeline | `/hard/concierge/operations` |
| Support tickets | `/hard/support` |
| User lookup / moderation | `/hard/users`, `/hard/safety` |
| Payments / finance | `/hard/finance` |
| System health | `/hard/system-health` |
| Live monitoring | `/hard/monitoring` |
| Logs / observability | `/hard/observability` |
| Launch gates | `/hard/rc-certification`, `/hard/launch-certification` |
| Post-deploy smoke | Run `npm run smoke:production`; review failures in terminal |
| Disaster recovery | `/hard/disaster-recovery` |
| Configuration | `/hard/configuration` |
| Feature flags | `/hard/feature-flags` |

## Signal Concierge Operations Center

Path: `/hard/concierge/operations`

Use sections: Consultations → Payments → Scheduling → Assignment Queue → Introductions → Follow-up.

## Certification dashboards

| Dashboard | Path |
|-----------|------|
| Security Cert | `/hard/security-certification` |
| Reliability Cert | `/hard/reliability-certification` |
| Dependency Cert | `/hard/dependency-certification` |
| Accessibility Cert | `/hard/accessibility-certification` |
| RC Cert | `/hard/rc-certification` |
| Founder Cert | `/hard/founder-certification` |

## Tips for new ops leads

1. Start each day with `/ready` and `/hard/system-health`.
2. Keep Coolify and Supabase dashboards pinned.
3. Never share diagnostics secret in Slack — use vault links.
4. Use search in Hard console (keywords on each tab).
