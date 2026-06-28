# Startup Lifecycle

BamSignal server startup from import through shutdown.

## 1. Import (pure)

**Entry modules:** `server/config.js`, `server/production.js`, `server/app.js`

| Step | Behavior |
|------|----------|
| dotenv | Loads `.env.local` then `.env` if present |
| config | Builds `config` object from `process.env` — no validation, no logging |
| production.js | Registers process handlers only — **no HTTP, no DB, no validation exit** |

Docker `RUN node scripts/smoke-server-import.mjs` imports this graph without side effects beyond dotenv.

## 2. Validation (data only)

**Module:** `shared/enterpriseStartupValidation.mjs`

Returns structured result:

```json
{
  "ok": false,
  "mode": "production",
  "critical": [],
  "important": [],
  "optional": [],
  "warnings": [],
  "missing": [],
  "enabledFeatures": [],
  "disabledFeatures": [],
  "features": []
}
```

Never calls `process.exit()`.

## 3. Bootstrap

**Modules:** `server/services/startupBootstrap.js`, `server/services/serviceRegistry.js`  
**Called from:** `startServer()` in `server/production.js`

1. Resolve mode (`production` | `smoke` | `development` | `smoke-import`)
2. Run enterprise validation + register services (no initialize)
3. Print **one** startup report (`shared/startupReport.mjs`)
4. If `production` and CRITICAL missing → `process.exit(1)` **before** `listen()`
5. If IMPORTANT missing → features disabled; startup continues
6. If OPTIONAL missing → logged in report; startup continues

## 4. HTTP startup

**Function:** `startServer()`

1. Bootstrap validation gate (above)
2. Verify `dist/index.html`
3. Run SQL migrations
4. `bootstrapServiceRegistry()` — initialize database, background workers (dependency order)
5. `createApp({ distDir })`
6. Route inventory check
7. `app.listen()` + register graceful shutdown handlers

Entry module auto-start: `node server/production.js` only.

Smoke/tests: `shared/startProductionServer.mjs` sets `BAMSIGNAL_STARTUP_MODE=smoke`.

## 5. Health

| Route | Purpose | Payload |
|-------|---------|---------|
| `GET /health` | Liveness | `{ ok, service, alive }` — process alive only |
| `GET /ready` | Readiness | `503` unless CRITICAL registry services configured **and** database connected |

Important/optional integrations appear in detailed readiness (`?details=1` + diagnostics auth) but **never** fail `/ready`.

## 6. Shutdown

Ordered via Service Registry (`server/services/gracefulShutdown.js`):

1. HTTP server
2. Telegram polling
3. Background workers (rate-limit retention)
4. Postgres pool

Signals: SIGTERM, SIGINT, uncaughtException, unhandledRejection

Post-DB maintenance tasks (security definer fixes, account deletion sweep) run after listen via `runPostDatabaseStartup()` — not during import.

## 7. Recovery

| Symptom | Action |
|---------|--------|
| Container crash loop on deploy | Check startup report in Coolify logs for CRITICAL blockers |
| `/ready` 503, `/health` 200 | Inject missing CRITICAL secrets; verify `DATABASE_URL` connectivity |
| Feature unavailable (email, WhatsApp) | IMPORTANT tier — add `RESEND_API_KEY` or Sendchamp vars; redeploy not required if runtime secrets updated |
| Docker build fails at smoke | Ensure `BAMSIGNAL_STARTUP_MODE=smoke` path — import must stay pure |

## Related files

- `shared/startupExecutionMode.mjs` — mode resolution
- `shared/environmentClassification.mjs` — feature tiers
- `shared/enterpriseStartupValidation.mjs` — validation engine
- `shared/startupReport.mjs` — single startup report
- `scripts/smoke-server-import.mjs` — Docker smoke (smoke mode)
- `scripts/test-enterprise-startup-validation.mjs` — unit tests
