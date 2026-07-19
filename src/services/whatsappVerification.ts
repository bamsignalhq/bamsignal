/**
 * Compatibility re-export — phone OTP is SMS Verification.
 * Prefer importing from ./smsVerification.
 */
export {
  startSmsVerification,
  confirmSmsVerification,
  startSmsVerification as startWhatsappVerification,
  confirmSmsVerification as confirmWhatsappVerification,
  submitVerificationSelfie,
  type SmsVerificationResult,
  type SmsVerificationResult as WhatsappVerificationResult
} from "./smsVerification";
