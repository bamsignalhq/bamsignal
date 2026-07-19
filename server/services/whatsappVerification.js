/**
 * Compatibility shim — phone OTP is SMS via smsVerification.js.
 * Prefer importing from ./smsVerification.js in new code.
 */
export {
  startSmsVerification as startWhatsappVerification,
  confirmSmsVerification as confirmWhatsappVerification,
  handleSmsVerificationWebhook as handleWhatsappVerificationWebhook,
  markPhoneVerified,
  getPhoneVerifiedStatus,
  startSmsVerification,
  confirmSmsVerification,
  handleSmsVerificationWebhook,
  SmsVerificationError as WhatsappVerificationError,
  VERIFICATION_ERROR_CODES
} from "./smsVerification.js";
