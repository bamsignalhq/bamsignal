/** Nigerian phone normalization for storage and Sendchamp. */

export function digitsOnly(value = "") {
  return String(value).replace(/\D/g, "");
}

/** Local format: 08012345678 */
export function normalizeNigerianPhoneLocal(value = "") {
  let digits = digitsOnly(value);

  if (digits.startsWith("234") && digits.length === 13) {
    digits = `0${digits.slice(3)}`;
  }

  if (digits.length === 10 && /^[789]/.test(digits)) {
    digits = `0${digits}`;
  }

  return digits;
}

/** E.164: +2348012345678 */
export function toE164NigerianPhone(value = "") {
  const local = normalizeNigerianPhoneLocal(value);
  if (!local) return "";
  if (local.startsWith("0") && local.length === 11) {
    return `+234${local.slice(1)}`;
  }
  if (local.startsWith("234") && local.length === 13) {
    return `+${local}`;
  }
  return local.startsWith("+") ? local : `+${local}`;
}

/** Sendchamp international format without +: 2348012345678 */
export function toSendchampPhone(value = "") {
  const e164 = toE164NigerianPhone(value);
  return e164.replace(/^\+/, "");
}

export function isValidNigerianPhone(value = "") {
  const local = normalizeNigerianPhoneLocal(value);
  return /^0[789]\d{9}$/.test(local);
}
