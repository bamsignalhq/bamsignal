/** Signal Concierge™ consultation fee — Paystack gateway constants (production). */

export const CONSULTATION_FEE_PRODUCT_TYPE = "consultation-fee" as const;
export const CONSULTATION_FEE_PRODUCT_ID = "signal-concierge-consultation";
export const CONSULTATION_FEE_AMOUNT_NGN = 100_000;
export const CONSULTATION_FEE_AMOUNT_KOBO = CONSULTATION_FEE_AMOUNT_NGN * 100;
export const CONSULTATION_PAYMENT_ID_PATTERN = /^BS-PAY-\d{4}-\d{4}$/;

export const CONSULTATION_PAYMENT_RETURN_PREFIXES = [
  "/signal-concierge/consultation",
  "/signal-concierge/status",
  "/signal-concierge/apply"
] as const;

export type ConsultationFeeProductType = typeof CONSULTATION_FEE_PRODUCT_TYPE;

export type ConsultationPaymentIntent = {
  productType: ConsultationFeeProductType;
  productId: string;
  amountKobo: number;
  paymentId: string;
  memberId: string;
  journeyId?: string;
};

/** Future-ready — not implemented: Flutterwave, Stripe, scholarships, international currencies. */
export const CONSULTATION_PAYMENT_FUTURE_GATEWAYS = ["flutterwave", "stripe"] as const;

export function isValidConsultationPaymentId(value: string): boolean {
  return CONSULTATION_PAYMENT_ID_PATTERN.test(String(value || "").trim().toUpperCase());
}

export function normalizeConsultationPaymentId(value: string): string {
  return String(value || "").trim().toUpperCase();
}
