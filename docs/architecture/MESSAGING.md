# Messaging Architecture — Sprint 4

## Principles

- **Extend, don't redesign** — `app_messages` and `app_chat_threads` remain the storage authority
- **Append-only lifecycle** — every state transition is logged
- **Idempotent realtime** — every event carries an idempotency key
- **Backend-only notifications** — client localStorage notifications unchanged in this sprint

## Architecture Audit Summary

### Production components (kept)

| Component | Location | Role |
|-----------|----------|------|
| Message persist | `server/services/memberPersistence.js` | Insert + fan-out to match partner |
| Chat bundle | `fetchMemberBundle()` | Loads threads for member restore |
| Signal → Match | `server/memberSocial.js` | Signal acceptance creates match/thread |
| Safety | `contactLeak.js`, `memberBlocks.js`, `spamDetection.js` | Pre-send guards |
| Client chat UI | `src/pages/ChatsPage.tsx` | Member chat experience (frozen) |
| Member API | `api/member/data.js` action `message` | Existing send endpoint |

### Gaps addressed in Sprint 4

- No formal conversation/message lifecycle states
- No delivery queue or retry engine
- No server-side read receipts or unread counts
- No presence or typing backend
- No unified member notification outbox
- No realtime event bus for downstream systems
- No moderation pipeline hooks beyond ad-hoc reports

### Dead code / duplicates (not removed)

- `src/utils/notifications.ts` — client-only in-app notifications (still used by member UI)
- `notification_messages` (migration 0028) — enterprise Notification Center; separate domain
- `scripts/test-internal-messaging.mjs` — admin Internal Messaging Center; not member chat

No production consumers were removed.

## Conversation Lifecycle

States: `pending`, `active`, `archived`, `muted`, `blocked`, `reported`, `closed`, `deleted`

Tables:
- `member_conversation_state`
- `member_conversation_lifecycle_log`

Hook: `ensureConversationPair()` after signal acceptance in `memberSocial.js`

## Message Lifecycle

States: `queued` → `sending` → `sent` → `delivered` → `read` (+ `failed`, `edited`, `deleted`, `expired`)

Tables:
- `member_message_state`
- `member_message_lifecycle_log`

Hook: `handleMessagingSendEvent()` after `persistMessage()` in `memberPersistence.js`

## Delivery Engine

- `member_message_delivery_queue` with idempotent enqueue
- Retry backoff via `computeRetryBackoff()`
- Timeout detection in `processPendingDeliveries()`
- Admin replay via `POST /api/messaging/admin?action=process-deliveries`

## Services

All under `server/services/messaging/`:

| Module | Purpose |
|--------|---------|
| `conversations.js` | Conversation state machine |
| `messages.js` | Message state machine |
| `delivery.js` | Delivery queue + retries |
| `readReceipts.js` | Read pointers + unread counts |
| `presence.js` | Heartbeat + last seen |
| `typing.js` | Typing indicators |
| `notifications.js` | Member notification outbox |
| `media.js` | Media upload reliability |
| `offline.js` | Offline sync + conflict resolution |
| `moderation.js` | Report/block/spam hooks |
| `eventBus.js` | Realtime event publisher |
| `observability.js` | Metrics counters |

## APIs

Member: `POST /api/messaging/member?action=...`  
Admin: `POST /api/messaging/admin?action=...`

See `docs/operations/MESSAGING_RUNBOOK.md` for operator actions.
