# Wallet & BayGold recovery runbook

**Scope:** Stankings Platform wallet gate, BayGold ledger, purchase resume after funding.

**Production flow:** Feature → Wallet → BayGold spend OR Buy BayGold (Paystack) → `resumePlatformPurchase` on HQ.

---

## Source of truth

1. **HQ Purchase Engine** — `baygold_purchases` status, `resume_token`, `paystack_reference`
2. **BayGold ledger** — `baygold_wallets`, `baygold_transactions`
3. **BamSignal** — `POST /api/wallet` (`purchase-gate`, `initialize-funding`, `resume`)
4. **Paystack** — funding charges for `wallet_funding` metadata only

HQ health: `GET /api/health` on Stankings + `GET /api/platform/bamsignal/wallet/home`

---

## Investigation — "Paid for BayGold but purchase didn't complete"

1. Get Paystack reference from member receipt.
2. Confirm metadata `wallet_funding: true` and `resume_token` present.
3. On HQ (service role):

   ```sql
   select id, status, resume_token, paystack_reference, shortfall_minor
   from baygold_purchases
   where paystack_reference = 'bs_...' or resume_token = '...';
   ```

4. Check BayGold credit:

   ```sql
   select * from baygold_transactions
   where reference like '%PAYSTACK_REF%'
   order by created_at desc limit 5;
   ```

5. BamSignal logs: `wallet funding verification started`, `wallet purchase resumed`.

---

## Scenario A — Funding succeeded, purchase stuck in `awaiting_funding`

**Recovery:**

1. Confirm Paystack charge success.
2. Call HQ resume API (BamSignal server does this via `resumePlatformPurchase`):

   - `PUT /api/platform/bamsignal/purchase` with `resumeToken` + `paystackReference`
3. Idempotent — safe to retry.
4. Verify purchase `status = completed` and member entitlement on BamSignal side.

---

## Scenario B — Wallet gate returns 503

**Cause:** `STANKINGS_PLATFORM_URL` unset or HQ unreachable.

**Recovery:**

1. Verify BamSignal env: `STANKINGS_PLATFORM_URL`, `STANKINGS_PLATFORM_SERVICE_KEY`
2. HQ `/api/health` and platform key auth
3. Restart BamSignal after env fix — do not bypass wallet with direct Paystack product checkout

---

## Scenario C — Balance wrong after spend

1. Compare `baygold_wallets.balance_minor` with sum of ledger transactions.
2. Check duplicate idempotency keys on purchase.
3. Escalate to HQ custodian — no manual ledger edits without approval.

---

## Verification

- [ ] Wallet home loads (`GET /api/wallet`)
- [ ] Test purchase gate returns `completed` or `buy_baygold` with valid `resumeToken`
- [ ] After funding, purchase auto-completes
- [ ] Founder War Room wallet metrics update

**Related:** [payment-recovery.md](./payment-recovery.md) · Stankings HQ `docs/bamsignal/operations/PROGRAM-001-RECOVERY-GUIDE.md`
