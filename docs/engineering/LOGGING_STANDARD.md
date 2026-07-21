# Logging Standard — Stankings Ecosystem

Standardized startup logging for monitoring and incident correlation. **No secrets in logs.**

## Startup banner (required)

Every production process logs **once** at startup:

```
[{applicationId}] startup application={name} version={version} environment={env} platform={platform} provider={provider} commit={sha|local} port={port} host={host} node={nodeVersion} startedAt={iso8601}
```

## BamSignal implementation

- `server/startupLogging.js` — `logStartupBanner({ port, host })`
- Called from `server/production.js` when HTTP server listens

## Log level

Set `LOG_LEVEL=info` in production (`debug` only for short investigations).

Structured operational events use existing `[bamsignal]` prefixed logs — do not change format without platform approval.

## Rules

- Never log passwords, PINs, API keys, tokens, or full PII.
- Request correlation via `x-request-id` where available.
