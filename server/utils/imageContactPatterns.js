/** Shared contact-in-text patterns for image safety tests (Node + browser). */

export {
  containsContactInText,
  scanTextForContactLeak,
  CONTACT_LEAK_BLOCK_MESSAGE
} from "../../shared/contactGuardCore.mjs";

export {
  normalizeNigerianPhoneLocal,
  toE164NigerianPhone,
  toSendchampPhone,
  isValidNigerianPhone
} from "./nigerianPhone.js";
