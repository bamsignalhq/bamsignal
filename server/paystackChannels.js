/**
 * Paystack initialize `channels` — limits methods shown at hosted checkout.
 * Order is preference only; Paystack may reorder tiles on their checkout UI.
 *
 * Preferred order (Nigeria):
 *   1. Bank Transfer → bank_transfer
 *   2. USSD           → ussd
 *   3. Bank           → bank (OPay tile may appear when enabled)
 *   4. Mobile Money   → mobile_money
 *
 * Card is excluded here. Disable card in Paystack Dashboard if it still appears.
 * Pay with Zap may appear when bank_transfer is on — disable in Dashboard if needed.
 *
 * @see https://paystack.com/docs/api/transaction/#initialize
 */
export const PAYSTACK_CHANNELS = ["bank_transfer", "ussd", "bank", "mobile_money"];
