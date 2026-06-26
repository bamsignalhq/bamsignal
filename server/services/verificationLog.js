import { logObservabilityEvent } from "./observability.js";

const SENSITIVE_KEYS = new Set(["code", "otp", "verification_code", "token"]);

function sanitizeContext(context = {}) {
  const safe = {};
  for (const [key, value] of Object.entries(context)) {
    if (SENSITIVE_KEYS.has(key)) continue;
    safe[key] = value;
  }
  return safe;
}

export function logWhatsappVerification(event, context = {}, level = "info") {
  return logObservabilityEvent(`whatsapp_verification_${event}`, sanitizeContext(context), level);
}
