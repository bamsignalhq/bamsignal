# Notifications — Sprint 4

## Overview

Sprint 4 introduces a **member notification outbox** (`member_notification_outbox`) distinct from:

- Client localStorage notifications (`src/utils/notifications.ts`) — unchanged
- Enterprise Notification Center (`notification_messages`, migration 0028) — admin/ops outbound

## Categories

`message`, `match`, `subscription`, `payment`, `safety`, `moderation`, `system`, `referral`

## Channels

`in_app` (implemented), `push`, `email`, `sms` (push-ready / future)

## Preferences

`member_notification_preferences` — per member, category, channel

Default: enabled when no preference row exists.

## Flow

1. Event occurs (e.g. new message via `notifyNewMessage()`)
2. Row inserted in outbox with idempotency key
3. `notification.created` realtime event published
4. In-app channel auto-marked `sent`; push/email remain queued for future workers

## API

```
POST /api/messaging/member?action=notifications
POST /api/messaging/member?action=notification-preferences
```

## Realtime Events

- `notification.created`
- `notification.sent`
- `notification.failed`

## Backend Only

This sprint does **not** change member UI notification rendering. The outbox provides the server-side contract for future push/in-app sync.
