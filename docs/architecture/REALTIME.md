# Realtime — Sprint 4

## Event Bus

Publisher: `server/services/messaging/eventBus.js`  
Persistence: `member_realtime_events` (append-only)

In-memory `subscribeRealtimeEvents()` for same-process consumers (Concierge, Passport hooks in future sprints).

## Event Types

| Event | Trigger |
|-------|---------|
| `conversation.created` | Signal acceptance / match |
| `conversation.archived` | Member archives conversation |
| `message.sent` | Message persisted |
| `message.delivered` | Delivery to recipient |
| `message.read` | Read receipt |
| `message.failed` | Send/delivery failure |
| `presence.online` | Heartbeat after offline |
| `presence.offline` | Explicit offline or timeout |
| `typing.started` | Typing indicator start |
| `typing.stopped` | Typing stop or timeout |
| `notification.created` | Outbox row created |
| `notification.sent` | Notification delivered |
| `notification.failed` | Notification failed |

## Idempotency

Every event carries `idempotency_key` via `resolveRealtimeEventIdempotencyKey()`.

Duplicate `event_id` inserts are ignored (`ON CONFLICT DO NOTHING`).

## Observability

Metrics in `getMessagingObservabilityMetrics()`:

- Messages sent/delivered/read
- Delivery retries, failed deliveries
- Presence updates, typing events
- Notification queue depth
- Average realtime latency (when recorded)

Exposed on operator dashboard under `messaging` key.

## Latency

Call `recordRealtimeLatency(ms)` at integration points when measuring end-to-end delivery.

## No WebSocket Redesign

This sprint adds the **internal publisher contract**. Existing client polling/restore via `fetchMemberBundle` is unchanged.

Future sprints may add Supabase Realtime or SSE subscribers without changing event schema.
