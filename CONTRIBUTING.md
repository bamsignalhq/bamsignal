# Contributing

Guidelines for engineers joining BamSignal. Read [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) first.

---

## Prerequisites

- Node.js 20+
- npm (lockfile: `package-lock.json`)
- Postgres or Supabase project for full features (dry-run works without `DATABASE_URL`)

```bash
npm install
cp .env.example .env.local   # fill secrets locally — never commit
npm run dev                  # http://localhost:5173
npm run dev:server           # API on PORT (default 3000) — separate terminal
```

---

## Project rules (mandatory)

Production rules live in `.cursor/rules/bamsignal.mdc`. Summary:

| Rule | Detail |
|------|--------|
| Member UI frozen | No redesign of `/home`, discover, chats, profile — bug fixes only |
| Auth | Username + PIN login UI — never email/password login |
| Onboarding | Only at `/onboarding` — never inside `/home` |
| Public routes | Never trigger member restore or onboarding |
| Payments | Preserve return path; never dump users on public homepage after Paystack |
| Admin vs member | `/hard` is separate from member routes |
| Smallest safe diff | Inspect first, patch minimally, run tests |
| No unrelated files | Do not stage dist/, APK, generated cache in commits |

---

## Folder conventions

| Pattern | Use |
|---------|-----|
| `src/pages/` | Route-level components |
| `src/components/admin/<center>/` | Institutional admin centers |
| `src/constants/<feature>.ts` | Domain constants |
| `src/constants/<feature>Admin.ts` | Route path + brand strings |
| `src/types/<feature>.ts` | TypeScript types |
| `src/utils/<feature>Logic.ts` | Pure transforms |
| `src/utils/<feature>Engine.ts` | Orchestration / report builders |
| `server/services/<feature>.js` | Server verification mirrors for tests |
| `scripts/test-<feature>.mjs` | Certification tests |

**Naming:**

- `HardTab` ids: camelCase (`launchcertification`)
- URL slugs: kebab-case (`/hard/launch-certification`)
- Components: PascalCase file = export name

---

## Required commands (code changes)

```bash
npm run build                 # tsc + vite — must pass
npm run lint                  # tsc --noEmit
npm run test:server-import    # server smoke test
```

Add domain test when creating institutional centers:

```bash
npm run test:<feature>        # e.g. test:enterprise-cleanup
```

Full pre-release:

```bash
npm run test                  # 73-script certification suite
```

### SEO changes

```bash
npm run seo:validate
```

### Android asset changes

```bash
npx cap sync android
npm run android:verify-assets
```

---

## Adding an admin center

1. Types → `src/types/`
2. Constants → `src/constants/` + `*Admin.ts` path constant
3. Logic + engine → `src/utils/`
4. Dashboard → `src/components/admin/<center>/`
5. CSS → `src/styles/<center>.css` + import in `main.tsx`
6. Lazy tab → `lazyAdminHubTabs.ts`
7. Wire tab → `adminConsoleNav.ts`, `hardRoutes.ts`, `permissions.ts`, `AdminHubPage.tsx`
8. Server helper → `server/services/` (for test scripts)
9. Test → `scripts/test-<center>.mjs` + `package.json` script

Verify: no eager import of heavy admin panels in `AdminHubPage` top level.

---

## Git workflow

1. Branch from `main` (or commit directly to `main` per team practice).
2. Run required commands above.
3. `git status --short` — stage **only** related files.
4. Clear commit message focused on **why**.
5. Push → Coolify auto-deploys.

**Never:**

- `git push --force` to `main`
- Commit `.env`, credentials JSON, APK/AAB
- Skip hooks (`--no-verify`) unless explicitly approved
- Amend pushed commits without coordination

Pre-push hook runs `test:server-import` after `npm install`.

---

## Migrations

```bash
npm run migrate               # applies migrations/*.sql
npm run verify:database
```

Add numbered SQL in `migrations/` and mirror critical changes in `supabase/migrations/` when needed.

---

## Testing philosophy

- `scripts/test-*.mjs` files assert **implementation contracts** (files exist, routes registered, logic exports).
- Prefer meaningful tests over trivial assertions.
- Certification suite discovers all `test:*` scripts automatically (`run-certification-test-suite.mjs`).

---

## Documentation

| Document | Topic |
|----------|-------|
| [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) | Boundaries, layout, data flow |
| [DATABASE_ARCHITECTURE.md](./DATABASE_ARCHITECTURE.md) | Schema, migrations |
| [JOURNEY_ENGINE.md](./JOURNEY_ENGINE.md) | Concierge journey lifecycle |
| [OPERATIONS_CENTER.md](./OPERATIONS_CENTER.md) | Ops pipeline |
| [CRM_ARCHITECTURE.md](./CRM_ARCHITECTURE.md) | Member CRM record |
| [CONSULTANT_WORKFLOW.md](./CONSULTANT_WORKFLOW.md) | Consultant steps |
| [PERMISSIONS.md](./PERMISSIONS.md) | Roles and guards |
| [SECURITY.md](./SECURITY.md) | Hardening |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Coolify deploy |
| [RUNBOOK.md](./RUNBOOK.md) | Incidents |
| [BACKUP_RECOVERY.md](./BACKUP_RECOVERY.md) | DR |
| [MONITORING.md](./MONITORING.md) | Health and observability |

Operational detail: `docs/runbooks/`

---

## Getting help

- Institutional dashboards under `/hard` document subsystem health.
- Audit scripts: `npm run audit:routes`, `audit:permissions`, `audit:journeys`
- `.env.example` — authoritative env var list
