# Application Identity — BamSignal

Canonical identity object for BamSignal. Runtime code: `server/applicationIdentity.js`.

| Field | Value |
|-------|--------|
| **applicationName** | BamSignal |
| **applicationId** | `bamsignal` |
| **legalEntity** | Stankings Legacy Ltd |
| **repository** | `bamsignalhq/bamsignal` |
| **defaultDomain** | https://bamsignal.com |
| **healthEndpoint** | `/health` (liveness), `/ready` (readiness) |
| **supportContact** | support@bamsignal.com |
| **Organization** | Stankings Group |
| **Environment** | production |
| **Supabase ref** | `nswiwxmavuqpuzlsascs` |

Runtime fields (`version`, `environment`, `platform`, `provider`, `commit`, `buildTime`) come from deployment metadata env vars — see [ENVIRONMENT_STANDARD.md](./ENVIRONMENT_STANDARD.md).

Use `getApplicationIdentity()` in server code for the full merged object.

Before any Supabase migration, run `npm run verify:supabase-project -- --require-linked`.
