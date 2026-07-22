# Account Lifecycle — Sprint 2

Formal account lifecycle states map onto existing `app_member_profiles.account_status` and related fields. Transitions are logged in `member_account_lifecycle_log` (append-only).

## States

| Status | Meaning | Source |
|--------|---------|--------|
| `pending` | Signed up, onboarding incomplete | `onboarding_complete = false`, email verified |
| `email_verification` | Awaiting email verification | Signup in progress |
| `profile_completion` | Email verified, onboarding wizard incomplete | `onboarding_complete = false`, email verified |
| `active` | Ready to participate | `onboarding_complete = true`, `account_status = active` |
| `suspended` | Moderation suspension | `shadow_banned` |
| `locked` | PIN/login lockout | PIN throttle lock (context) |
| `disabled` | Soft-deleted, grace period | `account_status = deleted_pending` |
| `deleted` | Marked deleted | Terminal transition label |
| `recovered` | Restored from soft delete | After `restoreMemberAccount` |
| `archived` | Permanent deletion complete | `account_status = deleted` after grace |

## Transitions

Every transition calls `transitionAccountLifecycle()` which:

1. Inserts into `member_account_lifecycle_log`
2. Emits matching security event when applicable (`account_locked`, `account_deleted`, etc.)

No silent state changes — all transitions include `reason_code`, `reason`, `actor`, `actor_role`.

## Deletion Workflow

1. **Soft delete** — member action → `account_status = deleted_pending`, 30-day grace
2. **Retention** — `member_account_retention` records `grace_period` + `retain_until`
3. **Restore** — within grace → `recovered` lifecycle + retention update
4. **Permanent** — cron `processExpiredAccountDeletions()` → `archived` + retention `archived`

Legal retention metadata stored in `member_account_retention.metadata` — never immediate hard destroy.

## Recovery Workflow

Recovery kinds (`member_auth_recovery_tokens.recovery_kind`):

- `pin_reset` — integrated with existing PIN reset OTP
- `forgot_username` — existing endpoint (audit via security events)
- `lost_device` — reserved for future device recovery UX
- `email_recovery` — reserved
- `admin_recovery` — admin hooks (future)

## API

`POST /api/auth/account?action=lifecycle` — returns computed lifecycle snapshot + recent transitions (authenticated member).

## Code Reference

- Resolve: `server/services/auth/lifecycle.js` → `resolveAccountLifecycleStatus()`
- Transition: `transitionAccountLifecycle()`
- Deletion hooks: `server/services/auth/observability.js`
