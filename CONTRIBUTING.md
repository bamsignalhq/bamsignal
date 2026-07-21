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
npm run verify:platform       # identity + migration integrity
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

## Database workflow

Canonical policy: [docs/engineering/PLATFORM_GOVERNANCE.md](./docs/engineering/PLATFORM_GOVERNANCE.md)  
Baseline: **Recovery Baseline — July 2026** (next migration **0056+**).

### Migration policy

- **`migrations/` is the only canonical source.**
- Add a **new** file: `NNNN_snake_case_description.sql` (never edit/renumber applied files).
- Apply locally / against the linked project: `npm run migrate`
- Coolify applies pending migrations on deploy via startup migrate.
- Supabase CLI is for inspection/local/debug only — **not** canonical history.
- Do **not** use `supabase migration repair` or `db push` to fix repository problems.

```bash
npm run verify:migrations     # numbering, duplicates, gaps, hashes
npm run verify:supabase-project
npm run migrate               # verify guards + apply migrations/*.sql
npm run verify:database       # optional schema checks
```

### PR checklist (database / platform)

- [ ] New schema work is a forward migration (`0056+`) — no historical edits
- [ ] `npm run verify:platform` PASS
- [ ] `npm run lint` PASS
- [ ] `npm run test:server-import` PASS
- [ ] `npm run build` PASS
- [ ] PR description notes migration ID(s) if any

### Deployment checklist

- [ ] PR merged to the deploy branch (`main` for production)
- [ ] Coolify rebuild succeeded
- [ ] `/ready` healthy
- [ ] If a migration shipped: confirm `schema_migrations` contains the new ID
- [ ] No manual production DDL

---

## Testing philosophy

- `scripts/test-*.mjs` files assert **implementation contracts** (files exist, routes registered, logic exports).
- Prefer meaningful tests over trivial assertions.
- Certification suite discovers all `test:*` scripts automatically (`run-certification-test-suite.mjs`).

---

## Documentation

| Document | Topic |
|----------|-------|
| [docs/engineering/PLATFORM_GOVERNANCE.md](./docs/engineering/PLATFORM_GOVERNANCE.md) | Permanent DB / CI / deploy governance |
| [docs/engineering/PROJECT_IDENTITY.md](./docs/engineering/PROJECT_IDENTITY.md) | App identity + Supabase ref |
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
