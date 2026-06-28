# Smoke Import Tree

Entry: `scripts/smoke-server-import.mjs`

```
scripts/smoke-server-import.mjs
 ├── shared/startProductionServer.mjs
 │    └── server/production.js          [import only — no HTTP until startServer()]
 │         ├── server/db.js
 │         │    └── server/config.js    [SIDE EFFECT: dotenv load + env validation LOG only]
 │         ├── server/telegram.js       [SIDE EFFECT: Telegraf instance if token set]
 │         ├── server/app.js            [SIDE EFFECT: handler module graph load]
 │         │    ├── api/* handlers
 │         │    └── server/services/*
 │         ├── server/startupMigrations.js
 │         └── shared/serverRouteInventory.mjs
 └── server/app.js                     [static source audit only]
```

## Root cause (Docker RC blocker)

| Item | Detail |
|------|--------|
| **File** | `server/config.js` |
| **Line** | 105–107 (before fix) |
| **Failure** | `process.exit(1)` when `NODE_ENV=production` and required secrets missing |
| **Why Docker failed** | Runner stage sets `NODE_ENV=production` with no runtime secrets during `RUN node scripts/smoke-server-import.mjs` |

## Side effects after fix

| Module | Import-time behavior | Runtime bootstrap |
|--------|---------------------|-------------------|
| `server/config.js` | dotenv + validation **logging** only | N/A |
| `server/production.js` | **None** (no listen) | `startServer()` or entry-module guard |
| `server/db.js` | Reads config object | `initDatabase()` in `startServer()` |
| `server/telegram.js` | Creates Telegraf if token present | `registerBotCommands()` / polling in `startServer()` |
| `server/app.js` | Registers route handlers on `createApp()` call | Called from `startServer()` |

## Before / after

**Before:** Importing `server/config.js` in production mode terminated the process before smoke could boot the server.

**After:** Config validation logs missing secrets; `/ready` returns 503 until Coolify injects secrets at container start. HTTP starts only via `startServer()` or `node server/production.js` as the entry module.
