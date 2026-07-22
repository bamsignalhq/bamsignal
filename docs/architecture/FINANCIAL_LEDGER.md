# Financial Ledger — Sprint 3

## Principles

- **Append-only** — `member_financial_ledger` rows are never updated or deleted
- **Idempotent** — unique `entry_id` per lifecycle stage prevents duplicate credits
- **Auditable** — every status change logged in `member_financial_lifecycle_log`

## Ledger Entry Fields

| Field | Description |
|-------|-------------|
| `entry_id` | Stable entry identifier |
| `idempotency_key` | Canonical dedupe key for the entire financial pipeline |
| `transaction_id` | Groups entries (typically Paystack reference) |
| `reference` | Paystack reference |
| `gateway_reference` | Paystack transaction ID |
| `amount_kobo` | Gross amount |
| `fee_kobo`, `tax_kobo`, `net_kobo` | Fee breakdown |
| `product_type`, `product_id` | Catalog product |
| `purpose` | purchase, refund, etc. |
| `source` / `destination` | paystack, admin, bamsignal, member |
| `entry_type` | credit, debit, adjustment |
| `lifecycle_status` | Current state at write time |

## Transaction Lifecycle

```
initialized → pending → processing → successful
                                   ↘ failed
                                   ↘ cancelled
                                   ↘ expired
successful → refunded | reversed
```

Every transition creates a row in `member_financial_lifecycle_log`.

## Wallet Derivation

Wallet balances are **never cached as authority**. `deriveMemberWalletSnapshot()` computes:

- Balance from successful credits minus debits/refunds
- Pending credits/debits from in-flight statuses
- Reserved from processing entries flagged in metadata
- Lifetime spend, purchases, refunds

## Reconciliation

`runFinancialReconciliation()` compares:

- `payment_fulfillments`
- `payment_events`
- `member_financial_ledger`

Discrepancies are stored in `member_financial_reconciliation_runs` — **never auto-modified**.

## Idempotency Keys

Every financial operation carries an explicit `idempotency_key`:

| Source | Key format |
|--------|------------|
| Paystack reference + lifecycle | `pay:{reference}:{lifecycleStatus}` |
| Webhook event | `webhook:{eventId}` or `webhook:{eventId}:{reference}` |
| Refund | `refund:{refundId}:create` / `refund:{refundId}:complete` |
| Internal transaction | `tx:{transactionId}` |

Duplicate writes are rejected via unique constraints on `member_financial_ledger.idempotency_key` and `member_refund_records.idempotency_key`.

## Financial Event Bus

Downstream systems (Concierge, Passport, analytics, notifications) subscribe to internal events instead of reading the ledger directly.

Publisher: `server/services/finance/eventBus.js`  
Persistence: `member_financial_events` (append-only)

| Event | When |
|-------|------|
| `payment.initialized` | Purchase intent created |
| `payment.processing` | Fulfillment in progress |
| `payment.successful` | Payment fulfilled |
| `payment.failed` | Payment failed |
| `subscription.activated` | Subscription state → active/trial |
| `subscription.expired` | Subscription lapsed |
| `boost.purchased` | Boost product fulfilled |
| `refund.created` | Refund record opened |
| `refund.completed` | Refund settled |
| `wallet.updated` | Wallet snapshot derived after successful payment |
