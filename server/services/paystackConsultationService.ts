/**
 * Paystack consultation payment service — production integration for Signal Concierge™.
 * One-time ₦100,000 consultation fee via Paystack (no subscription / recurring billing).
 */

export const CONSULTATION_FEE_PRODUCT_TYPE = "consultation-fee" as const;
export const CONSULTATION_FEE_PRODUCT_ID = "signal-concierge-consultation";
export const CONSULTATION_FEE_AMOUNT_NGN = 100_000;
export const CONSULTATION_FEE_AMOUNT_KOBO = CONSULTATION_FEE_AMOUNT_NGN * 100;
export const CONSULTATION_PAYMENT_ID_PATTERN = /^BS-PAY-\d{4}-\d{4}$/;

export type ConsultationPaymentStatus =
  | "pending"
  | "initialized"
  | "paid"
  | "failed"
  | "refunded"
  | "cancelled";

export type ConsultationPaymentTimelineEvent =
  | "payment-created"
  | "payment-initialized"
  | "payment-completed"
  | "payment-failed"
  | "payment-refunded"
  | "consultation-unlocked";

export const CONSULTATION_PAYMENT_TIMELINE_EVENTS: ConsultationPaymentTimelineEvent[] = [
  "payment-created",
  "payment-initialized",
  "payment-completed",
  "payment-failed",
  "payment-refunded",
  "consultation-unlocked"
];

export type ConsultationPaymentIntent = {
  productType: typeof CONSULTATION_FEE_PRODUCT_TYPE;
  productId: string;
  amountKobo: number;
  paymentId: string;
  memberId: string;
  journeyId?: string;
};

/**
 * Future-ready architecture — document only, not implemented:
 * - international-currencies: multi-currency display with NGN ledger
 * - scholarships: partial or full fee waivers with audit trail
 * - corporate-sponsorships: employer-sponsored consultation fees
 */
export const CONSULTATION_PAYMENT_FUTURE_CAPABILITIES = [
  "international-currencies",
  "scholarships",
  "corporate-sponsorships"
] as const;

export type ConsultationPaymentFutureCapability =
  (typeof CONSULTATION_PAYMENT_FUTURE_CAPABILITIES)[number];
