/**
 * Compatibility re-export — prefer smsVerificationErrors.js
 */
export {
  VERIFICATION_ERROR_CODES,
  SmsVerificationError,
  SmsVerificationError as WhatsappVerificationError,
  mapSendchampStartError,
  mapSendchampConfirmError
} from "./smsVerificationErrors.js";
