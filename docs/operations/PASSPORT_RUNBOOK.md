# Passport Operations Runbook

## Prerequisites

- Migration `0063_passport_integration.sql` applied
- BamSignal contributor active in `passport_signal_contributors`
- Supabase ref: `nswiwxmavuqpuzlsascs`

## Verify Integration

```bash
npm run test:passport-integration
npm run certify:passport-journey
```

## Admin API

```bash
# Full dashboard contract
POST /api/passport/integration?action=dashboard
{ "memberId": "<uuid>" }

# Audit producers
POST /api/passport/integration?action=audit-producers

# Metrics
POST /api/passport/integration?action=metrics
```

## Consent Failures

1. Check `passport_consent_audit_log` for denied decisions
2. Verify `passport_consent_grants` for member passport
3. Re-run `ensureContributorEmissionConsent` via passport issuance

## Sync Queue Backlog

Query:

```sql
select status, count(*) from passport_sync_queue group by status;
```

Failed items retain `error_message` for investigation.

## Privacy & Deletion

Trust signals respect Passport governance retention (`passport_signal_retention`).

Member deletion must flow through existing purge + retention policies — do not hard-delete signals without governance review.

## Recovery

- Idempotency keys prevent duplicate signals on retry
- Correlation IDs link audit, sync queue, and integration events
- Re-process failed queue items by calling `processQueuedTrustSignal(queueId)`

## Certification Journey

Automated path: Signup → verify email → profile → premium → match → message → moderation → passport update

```bash
npm run certify:passport-journey
```

## Incident Response

1. Disable trust emission temporarily via ops runtime config if needed
2. Monitor `getPassportIntegrationMetrics().consentFailures`
3. Review `passport_integration_events` for anomaly patterns
