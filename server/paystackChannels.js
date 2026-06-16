/**
 * Paystack initialize `channels` — limits methods shown at hosted checkout.
 * Order is preference only; Paystack may reorder based on account settings.
 *
 * Target checkout tiles (Nigeria):
 *   Transfer  → bank_transfer
 *   Bank      → bank
 *   USSD      → ussd
 *   OPay      → bank (Paystack shows OPay as its own tile when Bank is enabled)
 *
 * Card and mobile_money are excluded. Disable card in Paystack Dashboard if it
 * still appears. Pay with Zap may also appear when `bank` is on — disable Zap in
 * Paystack Dashboard → Settings → Payment Channels if needed.
 *
 * @see https://paystack.com/docs/api/transaction/#initialize
 * @see https://zapsupport.frontkb.com/en/articles/5845314
 */
export const PAYSTACK_CHANNELS = ["bank_transfer", "bank", "ussd"];
