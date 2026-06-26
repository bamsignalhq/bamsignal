# Remote Config

Remote configuration supplies tunable product parameters without redeploying client bundles.

## Surfaces

| Surface | Path / endpoint |
|---------|-----------------|
| Admin UI | `/hard/configuration` (Configuration Platform) |
| Public API | `GET /api/remote-config` |
| Server defaults | `server/services/remoteConfig.js` → `REMOTE_CONFIG_SERVER_DEFAULTS` |

## Default keys (examples)

| Key | Purpose |
|-----|---------|
| `signals.free_daily_limit` | Daily signal allowance |
| `messaging.max_messages_per_day` | Chat throttle |
| `discovery.max_profile_photos` | Photo cap |
| `payments.boost_pricing_ngn` | Boost price |
| `verification.otp_cooldown_seconds` | OTP rate limit |
| `notifications.retry_interval_seconds` | Notification retry |
| `notifications.templates` | Template map |

## Change procedure

1. Edit in Configuration Platform admin (or DB `platform_settings` if migrated).
2. Confirm active status and revision.
3. API cache TTL ~60s — allow one minute for propagation.
4. Verify: `curl -s https://bamsignal.com/api/remote-config | jq '.config["signals.free_daily_limit"]'`
5. Run `npm run smoke:production` notifications + remote-config checks.

## Drift detection

```bash
npm run certify:drift
```

Compares Coolify env, remote config, and documented defaults.

## Safety

- Do not set extreme limits in production without staged rollout.
- Payment amounts must match Paystack product configuration.
- Document every production config change in release notes.
