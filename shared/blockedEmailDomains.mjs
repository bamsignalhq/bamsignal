/** Disposable / temporary email domains — block at signup (client + server). */
export const BLOCKED_EMAIL_DOMAINS = new Set([
  "10minutemail.com",
  "blondmail.com",
  "burnermail.io",
  "dispostable.com",
  "emailfake.com",
  "emailondeck.com",
  "fakeinbox.com",
  "getnada.com",
  "grr.la",
  "guerrillamail.com",
  "guerrillamailblock.com",
  "maildrop.cc",
  "mailinator.com",
  "mailnesia.com",
  "mintemail.com",
  "moakt.com",
  "mytemp.email",
  "sharklasers.com",
  "spam4.me",
  "temp-mail.org",
  "tempail.com",
  "tempmail.com",
  "tempmailo.com",
  "throwawaymail.com",
  "trashmail.com",
  "trashmail.net",
  "yopmail.com"
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
