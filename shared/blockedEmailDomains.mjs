/** Disposable / temporary email domains — block at signup (client + server). */
export const BLOCKED_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "yopmail.com",
  "throwawaymail.com",
  "sharklasers.com",
  "getnada.com",
  "moakt.com",
  "emailondeck.com",
  "trashmail.com",
  "guerrillamailblock.com",
  "grr.la",
  "spam4.me",
  "maildrop.cc",
  "temp-mail.org",
  "fakeinbox.com",
  "dispostable.com",
  "mailnesia.com",
  "trashmail.net",
  "mintemail.com",
  "mytemp.email",
  "tempail.com",
  "emailfake.com",
  "burnermail.io"
]);

export function extractEmailDomain(email = "") {
  const normalized = String(email).trim().toLowerCase();
  const at = normalized.lastIndexOf("@");
  if (at < 1) return "";
  return normalized.slice(at + 1);
}

export function isDisposableEmailDomain(domain = "") {
  const normalized = String(domain).trim().toLowerCase();
  if (!normalized) return false;
  if (BLOCKED_EMAIL_DOMAINS.has(normalized)) return true;
  const parts = normalized.split(".");
  for (let i = 0; i < parts.length; i += 1) {
    const suffix = parts.slice(i).join(".");
    if (BLOCKED_EMAIL_DOMAINS.has(suffix)) return true;
  }
  return false;
}

export function isDisposableEmail(email = "") {
  return isDisposableEmailDomain(extractEmailDomain(email));
}
