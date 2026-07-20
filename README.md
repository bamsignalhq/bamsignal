# BamSignal

BamSignal is a React + Vite social discovery platform for Nigeria — discover profiles, send signals, chat, and manage premium plans. Signal Concierge™ adds human-led matchmaking. The web app ships with optional Capacitor shells for Android/iOS.

**Production:** https://bamsignal.com

## Engineering documentation

| Document | Description |
|----------|-------------|
| [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) | Platform boundaries, folder structure, data flow |
| [DATABASE_ARCHITECTURE.md](./DATABASE_ARCHITECTURE.md) | Postgres schema and migrations |
| [JOURNEY_ENGINE.md](./JOURNEY_ENGINE.md) | Signal Concierge journey lifecycle |
| [OPERATIONS_CENTER.md](./OPERATIONS_CENTER.md) | Concierge operations pipeline |
| [CRM_ARCHITECTURE.md](./CRM_ARCHITECTURE.md) | Member CRM model |
| [CONSULTANT_WORKFLOW.md](./CONSULTANT_WORKFLOW.md) | Consultant end-to-end workflow |
| [PERMISSIONS.md](./PERMISSIONS.md) | Roles and authorization |
| [SECURITY.md](./SECURITY.md) | Hardening and secrets |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Coolify / Docker deploy |
| [RUNBOOK.md](./RUNBOOK.md) | On-call procedures |
| [BACKUP_RECOVERY.md](./BACKUP_RECOVERY.md) | Backup and restore |
| [MONITORING.md](./MONITORING.md) | Health checks and observability |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Developer workflow |
| [PRODUCTION_ENVIRONMENT_REPORT.md](./PRODUCTION_ENVIRONMENT_REPORT.md) | Env integrations — ready / warning / critical |
| [LAUNCH_INFRASTRUCTURE_REPORT.md](./LAUNCH_INFRASTRUCTURE_REPORT.md) | Deployment artifacts — Docker, SEO, PWA, deep links |
| [FOUNDER_ACCEPTANCE_REPORT.md](./FOUNDER_ACCEPTANCE_REPORT.md) | Founder acceptance — personas, workflows, go/no-go |

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build for production

```bash
npm run build
npm run preview
```

## API server (contact, Paystack, identity)

```bash
npm run server
```

## Environment

Copy `.env.example` to `.env.local` and fill in Supabase, Paystack, and email keys before production deploy.

<!-- Auto-deploy verification after Watch Paths removal. -->

## Mobile (optional)

Capacitor projects live in `android/` and `ios/`. Sync after a web build:

```bash
npm run cap:sync
npm run android   # or npm run ios
```
