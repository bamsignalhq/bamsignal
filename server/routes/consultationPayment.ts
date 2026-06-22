/** @deprecated Use consultationPayments.ts — retained for backward compatibility. */
export {
  CONSULTATION_PAYMENTS_API_PATH as CONSULTATION_PAYMENT_API_PATH,
  type ConsultationPaymentAction
} from "./consultationPayments";

export type ConsultationPaymentAction = "initialize" | "verify";
