/**
 * Paystack initialize `channels` — limits methods shown at checkout.
 * Order is preference only; Paystack may reorder based on account settings.
 * Card is excluded here; disable card in Dashboard if it still appears.
 * @see https://paystack.com/docs/api/transaction/#initialize
 */
export const PAYSTACK_CHANNELS = [
  "bank_transfer",
  "ussd",
  "bank",
  "mobile_money"
];
