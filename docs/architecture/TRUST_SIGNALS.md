# Trust Signals Architecture

Sprint 6 unifies all platform trust-producing events through a single ingestion bridge.

## Canonical Entry Point

```
Platform event → handlePlatformTrustEvent() → passport_sync_queue → ingestTrustSignal()
```

Never call `ingestTrustSignal` directly from member flows.

## Signal Contract

Every signal includes:

| Field | Storage |
|-------|---------|
| Signal ID | `passport_trust_signals.signal_id` |
| Member ID | via `member_passport_registry` |
| Source System | bridge payload |
| Signal Type | mapped from event |
| Signal Category | `signalRegistry` defaults |
| Timestamp | `occurred_at` |
| Confidence | JSON confidence object |
| Evidence Reference | `evidence.evidenceRef` |
| Correlation ID | idempotency + events |
| Actor | bridge input |
| Version | `1.0` |

Signals are append-only via existing Passport ingestion pipeline.

## Producers (Audited)

| Source | Events |
|--------|--------|
| authentication | signup, email_verified, profile_completed |
| verification | identity_verified, verification_completed |
| finance | payment_successful, payment_refund, subscription_activated |
| messaging | message_sent, message_delivered, message_read |
| matching | signal_accepted, match_created |
| moderation | report_submitted, moderation_action, appeal_resolved |
| operations | user_suspended, user_restored |
| concierge | case_assigned, case_completed |
| support | ticket_created, ticket_resolved |

## Retired Duplicates

- Ad-hoc audit entries without signal pipeline
- Direct member-flow calls to `/api/passport/signals`

## Extended Signal Types

Added to `signalRegistry.js` and BamSignal contributor registry:

`email_verified`, `profile_completed`, `premium_active`, `payment_successful`, `conversation_started`, `message_delivered`, `message_read`, `member_reported`, `moderation_action`, `concierge_engaged`, `support_resolved`, `verification_completed`

## Migration

`0063_passport_integration.sql`
