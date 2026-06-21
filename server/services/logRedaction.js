import crypto from "node:crypto";

const IDENTIFIER_KEYS = new Set(["username", "email", "phone", "identifier", "adminEmail"]);

export function hashIdentifierForLog(value) {
  const text = String(value || "").trim().toLowerCase();
  if (!text) return null;
  return crypto.createHash("sha256").update(text).digest("hex").slice(0, 16);
}

/** a***@example.com */
export function maskEmailForLog(email) {
  const normalized = String(email || "").trim().toLowerCase();
  const [local, domain] = normalized.split("@");
  if (!local || !domain) return null;
  return `${local.slice(0, 1)}***@${domain}`;
}

/** a*** */
export function maskUsernameForLog(username) {
  const normalized = String(username || "").trim().toLowerCase();
  if (!normalized) return null;
  if (normalized.includes("@")) return maskEmailForLog(normalized);
  return `${normalized.slice(0, 1)}***`;
}

export function maskPhoneForLog(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length < 4) return "****";
  return `***${digits.slice(-4)}`;
}

function maskIdentifierString(value) {
  const text = String(value || "").trim();
  if (!text) return text;
  if (text.includes("@")) return maskEmailForLog(text);
  if (/^\+?\d[\d\s-]{6,}$/.test(text)) return maskPhoneForLog(text);
  return maskUsernameForLog(text);
}

export function buildAuthAuditContext({ username, email, phone, ...rest } = {}) {
  const identifier = String(username || email || phone || "").trim();
  return {
    ...(identifier
      ? {
          identifierHash: hashIdentifierForLog(identifier),
          identifierMask: username
            ? maskUsernameForLog(username)
            : email
              ? maskEmailForLog(email)
              : maskPhoneForLog(phone)
        }
      : {}),
    ...rest
  };
}

export function buildAdminAuditContext({ email, ...rest } = {}) {
  const normalized = String(email || "").trim().toLowerCase();
  return {
    ...(normalized
      ? {
          adminHash: hashIdentifierForLog(normalized),
          adminMask: maskEmailForLog(normalized)
        }
      : {}),
    ...rest
  };
}

/** Sanitize pin-login debug payloads without changing auth behavior. */
export function sanitizeAuthDebugLog(value) {
  if (value === null || value === undefined) return value;
  if (typeof value === "boolean" || typeof value === "number") return value;
  if (typeof value === "string") return maskIdentifierString(value);
  if (Array.isArray(value)) return value.map((item) => sanitizeAuthDebugLog(item));
  if (typeof value !== "object") return value;

  const safe = {};
  for (const [key, item] of Object.entries(value)) {
    if (IDENTIFIER_KEYS.has(key)) {
      const text = String(item || "").trim();
      if (text) {
        safe[`${key}Hash`] = hashIdentifierForLog(text);
        safe[`${key}Mask`] =
          key === "phone"
            ? maskPhoneForLog(text)
            : key === "email" || text.includes("@")
              ? maskEmailForLog(text)
              : maskUsernameForLog(text);
      }
      continue;
    }
    safe[key] = sanitizeAuthDebugLog(item);
  }
  return safe;
}
