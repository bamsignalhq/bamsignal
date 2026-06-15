/** Shared contact-in-text patterns for image safety tests (Node + browser). */

const PHONE_PATTERNS = [
  /\b0[789][01]\d{8}\b/i,
  /\b\+?\s*234\s*[789][01]\d{8}\b/i,
  /\b234[789][01]\d{8}\b/i,
  /\b080\d{8}\b/i,
  /\b081\d{8}\b/i,
  /\b070\d{8}\b/i,
  /\b090\d{8}\b/i,
  /\b091\d{8}\b/i,
  /\b\d{3}[\s.-]?\d{3}[\s.-]?\d{4}\b/,
  /\b\d{10,14}\b/
];

const CONTACT_PATTERNS = [
  ...PHONE_PATTERNS,
  /@[a-z0-9_.]{3,}/i,
  /\btelegram\b/i,
  /\bt\.me\//i,
  /whatsapp/i,
  /wa\.me/i,
  /\bwatsapp\b/i,
  /\bwassap\b/i,
  /instagram/i,
  /\big\b/i,
  /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i,
  /https?:\/\//i,
  /\bwww\./i,
  /\bchat me\b/i,
  /\bfollow me\b/i,
  /\.com\b/i,
  /\.ng\b/i
];

export function containsContactInText(text = "") {
  const normalized = String(text).trim();
  if (!normalized) return false;
  return CONTACT_PATTERNS.some((pattern) => pattern.test(normalized));
}

export {
  normalizeNigerianPhoneLocal,
  toE164NigerianPhone,
  toSendchampPhone,
  isValidNigerianPhone
} from "./nigerianPhone.js";
