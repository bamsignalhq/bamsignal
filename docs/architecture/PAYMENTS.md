# Payment Architecture — Sprint 3 Financial Core

BamSignal payments extend the existing **Paystack + payment_fulfillments + payment_events** stack. Sprint 3 adds an immutable financial ledger, transaction lifecycle, wallet derivation, refunds, and reconciliation — without replacing Paystack or redesigning pricing.

## Active Payment Endpoints

| Route | Purpose |
|-------|---------|
| `POST /api/paystack/verify` | Client payment verification after redirect |
| `POST /api/paystack/webhook` | Paystack webhook (canonical) |
| `/webhooks/paystack`, `/api/webhooks/paystack` | Legacy webhook aliases |
| Paystack router (`server/routes/paystack.js`) | Initialize transactions |
| `POST /api/wallet` | Stankings platform wallet gate (BayGold) |
| `POST /api/finance/billing` | Member billing history (backend) |
| `POST /api/finance/admin` | Admin financial operations (backend) |

## Service Layer

```
server/services/finance/
├── lifecycle.js        # Transaction state transitions
├── ledger.js           # Immutable append-only ledger
├── wallet.js           # Ledger-derived wallet snapshot
├── refunds.js          # Refund framework (manual/gateway)
├── reconciliation.js   # Internal vs fulfillment comparison
├── observability.js    # Financial metrics
├── adminContract.js    # Admin dashboard contract
└── index.js
```

## Integration

- **Initialize:** `recordPurchaseIntent` → ledger `initialized` + `pending`
- **Fulfill:** `completePaymentFulfillment` → `processing` → `successful` / `failed`
- **Webhook:** Paystack handler → fulfillment + webhook failure metrics
- **Existing tables retained:** `payment_fulfillments`, `payment_events`, `subscription_events`, `membership_events`

## Product Coverage

- Premium / membership (weekly, monthly, quarterly, annual via existing catalog)
- Boost purchases (signal, priority, profile, hot, city)
- Fast connection, discreet, concierge (via existing paymentFortress routing)

See also: [FINANCIAL_LEDGER.md](./FINANCIAL_LEDGER.md), [SUBSCRIPTIONS.md](./SUBSCRIPTIONS.md), [PAYMENT_FLOW_AUDIT.md](./PAYMENT_FLOW_AUDIT.md).
