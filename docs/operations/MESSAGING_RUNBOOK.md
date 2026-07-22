# Messaging Runbook — Sprint 4

## Quick Reference

| Action | Endpoint |
|--------|----------|
| Messaging metrics | `POST /api/messaging/admin?action=metrics` |
| Open moderation queue | `POST /api/messaging/admin?action=moderation-queue` |
| Process delivery queue | `POST /api/messaging/admin?action=process-deliveries` |
| Expire stale presence/typing | `POST /api/messaging/admin?action=expire-stale` |
| Recent realtime events | `POST /api/messaging/admin?action=realtime-events` |

## Failure Recovery

### Messages stuck in delivery queue

1. Check metrics: `failedDeliveries`, `deliveryRetries`
2. Run `process-deliveries` admin action
3. Inspect `member_message_delivery_queue` for `status = failed`
4. Member can trigger `offline-sync` via member API

### Presence stuck online

1. Run `expire-stale` admin action
2. Verify client sends `presence-offline` on logout/background

### Duplicate messages

- Idempotency keys on `member_message_state` and delivery queue prevent duplicate lifecycle rows
- `app_messages` still uses `(id, user_key)` conflict — existing behavior preserved

### Read receipt mismatch

- Inspect `member_conversation_read_state` for conversation/member pair
- Member can call `mark-read` with latest `messageId`

## Moderation

Open events in `member_messaging_moderation_events`:

- `report_message` — from member report API
- `block_conversation` — from block API
- `spam_hook` — from `spamDetection.js` integration

No AI moderation in this sprint — `ai_hook_placeholder` kind reserved.

## Migration

Apply migration `0060_member_messaging_core.sql` before enabling messaging APIs in production.

Verify with `npm run certify:migrations`.

## Certification

Sprint 4 extends production certification to v1.4.0 with `test:messaging-core`.

Run full gate: `npm run certify:production`

## End-to-End Journey (post-Sprint 4)

After deployment, validate:

1. Signup → verify → profile complete
2. Premium purchase
3. Match via signal accept
4. Exchange messages (persist + lifecycle)
5. Read receipt + unread count
6. Presence heartbeat
7. In-app notification outbox row
8. Report message → moderation queue

This journey confirms production readiness beyond component tests.
