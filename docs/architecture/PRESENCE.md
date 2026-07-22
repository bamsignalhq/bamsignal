# Presence — Sprint 4

## Overview

Presence is heartbeat-driven — no aggressive polling. Clients send periodic heartbeats; the server expires stale sessions automatically.

## States

| Status | Meaning |
|--------|---------|
| `online` | Active heartbeat within 90s |
| `offline` | No recent heartbeat or explicit offline |
| `invisible` | Member appears offline to others (future-ready) |

## Table

`member_presence_state` — one row per member

Fields: `heartbeat_at`, `last_seen_at`, `active_device_id`, `last_activity_at`

## API

```
POST /api/messaging/member?action=presence-heartbeat
POST /api/messaging/member?action=presence-offline
POST /api/messaging/member?action=presence
```

## Timeout

- Heartbeat timeout: **90 seconds**
- Stale online members auto-expire via `expireStalePresence()` (admin/cron)

## Realtime Events

- `presence.online`
- `presence.offline`

Published via `member_realtime_events` event bus.

## Privacy

`resolveEffectivePresence()` maps `invisible` → offline for peer queries.

Read receipt privacy remains governed by existing `activityPrivacy` client rules — not changed in this sprint.
