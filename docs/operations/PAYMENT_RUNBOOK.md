# Payment Operations Runbook — Sprint 3

## Prerequisites

- Migration `0059_member_financial_core.sql` applied
- Paystack secret and webhook secret configured
- `npm run verify:migrations` PASS

## Health Checks

```bash
curl -s https://bamsignal.com/health
curl -s -H "x-diagnostics-secret: $DIAGNOSTICS_SECRET" "https://bamsignal.com/ready?details=1"
```

Financial metrics: operator dashboard `observability.finance`.

## Common Operations

### Inspect ledger for reference

```sql
select entry_id, lifecycle_status, amount_kobo, net_kobo, product_type, created_at
from member_financial_ledger
where reference = '<paystack-reference>'
order by created_at asc;
```

### Run reconciliation (admin API)

```bash
POST /api/finance/admin
{ "action": "reconcile", "limit": 200 }
```

### Create manual refund (admin — no automatic processing)

```bash
POST /api/finance/admin
{
  "action": "create-refund",
  "reference": "<paystack-reference>",
  "amountKobo": 500000,
  "reason": "Member request",
  "refundKind": "manual"
}
```

### Complete refund

```bash
POST /api/finance/admin
{ "action": "complete-refund", "refundId": "<uuid>" }
```

## Failure Recovery

| Scenario | Action |
|----------|--------|
| Webhook missed | Member hits `/api/paystack/verify` with reference |
| Stuck processing | Wait 15 min stale timeout; retry webhook |
| Amount mismatch | Fulfillment marked failed; no credit |
| Duplicate webhook | Idempotent fulfillment; ledger duplicate entry prevented by entry_id |

## Validation

```bash
npm run lint && npm run typecheck && npm run build
npm run test:server-import
npm run test:financial-core
npm run certify:production
```

## Escalation

- Reconciliation discrepancies → investigate fulfillment vs ledger before manual refund
- Never delete ledger rows
- Gateway refunds require Paystack dashboard + `complete-refund` audit
