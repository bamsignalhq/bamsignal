# Passport Integration Architecture

## Overview

Sprint 6 connects Authentication, Finance, Messaging, Operations, Concierge, Moderation, and Verification to the Passport Platform v2 ingestion pipeline.

## Member Registry

`member_passport_registry` links `app_member_profiles.id` → `SKL-XXXX-XXXX` passport ID.

Passports are issued lazily on first trust event via `ensurePassportForMember()`.

## Async Synchronization

```
User action (sync, fast)
    ↓
handlePlatformTrustEvent (returns immediately)
    ↓
passport_sync_queue (persisted)
    ↓
setImmediate → processQueuedTrustSignal
    ↓
ingestTrustSignal (Passport Platform)
    ↓
passport_integration_events (trust event bus)
```

User actions are never blocked by trust synchronization.

## Hook Points

| Module | Hook |
|--------|------|
| `signupProvisioning.js` | signup, email_verified |
| `auth/lifecycle.js` | profile_completed, email_verified |
| `membershipCommerce.js` | subscription_activated |
| `finance/index.js` | payment_successful, payment_refund |
| `messaging/index.js` | message_sent |
| `memberSocial.js` | signal_accepted, match_created |
| `operations/index.js` | report_submitted |
| `operations/userSafety.js` | user_suspended, user_restored |

## API

```
POST /api/passport/integration?action=dashboard
POST /api/passport/integration?action=summary
POST /api/passport/integration?action=timeline
POST /api/passport/integration?action=verification-history
POST /api/passport/integration?action=signal-history
POST /api/passport/integration?action=consent-history
POST /api/passport/integration?action=reputation-profile
POST /api/passport/integration?action=certify-journey
```

Admin authentication required. No member UI in Sprint 6.

## Consent

Every emission calls `ensureContributorEmissionConsent()` and audits to `passport_consent_audit_log`.

## Observability

`getPassportIntegrationMetrics()` tracks queue depth, sync latency, consent failures, source system health.
