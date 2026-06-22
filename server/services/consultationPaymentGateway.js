/** @deprecated Import from paystackConsultationService.js — retained for backward compatibility. */
export {
  CONSULTATION_FEE_PRODUCT_TYPE,
  CONSULTATION_FEE_PRODUCT_ID,
  CONSULTATION_FEE_AMOUNT_NGN,
  CONSULTATION_FEE_AMOUNT_KOBO,
  CONSULTATION_PAYMENT_ID_PATTERN,
  CONSULTATION_PAYMENT_RETURN_PREFIXES,
  CONSULTATION_PAYMENT_FUTURE_GATEWAYS,
  isValidConsultationPaymentId,
  normalizeConsultationPaymentId,
  isConsultationFeeProductType,
  normalizeConsultationPaymentReturnPath,
  resolveConsultationFeeIntent,
  buildConsultationPaymentMetadata,
  consultationPaystackConfigured,
  initializeConsultationPaymentCheckout,
  verifyConsultationPaymentCheckout,
  consultationCallbackUrl
} from "./paystackConsultationService.js";
