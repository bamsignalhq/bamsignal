import { logObservabilityEvent, observabilityContext } from "./observability.js";

export const ADMIN_BOOTSTRAP_SECRET_HEADER = "x-admin-bootstrap-secret";

export function isAdminBootstrapEnabled() {
  return String(process.env.ADMIN_BOOTSTRAP_ENABLED || "")
    .trim()
    .toLowerCase() === "true";
}

export function adminBootstrapSecretConfigured() {
  return Boolean(String(process.env.ADMIN_BOOTSTRAP_SECRET || "").trim());
}

export function extractAdminBootstrapSecret(req) {
  return String(req?.headers?.[ADMIN_BOOTSTRAP_SECRET_HEADER] || "").trim();
}

export function hasAdminBootstrapSecret(req) {
  const expected = String(process.env.ADMIN_BOOTSTRAP_SECRET || "").trim();
  if (!expected) return false;
  const provided = extractAdminBootstrapSecret(req);
  return Boolean(provided && provided === expected);
}

export function logAdminBootstrapAttempt(req, extra = {}) {
  return logObservabilityEvent(
    "admin_bootstrap_attempt",
    observabilityContext(req, extra)
  );
}

export function logAdminBootstrapDenied(req, extra = {}) {
  return logObservabilityEvent(
    "admin_bootstrap_denied",
    observabilityContext(req, extra),
    "warn"
  );
}

export function logAdminBootstrapSuccess(req, extra = {}) {
  return logObservabilityEvent(
    "admin_bootstrap_success",
    observabilityContext(req, extra)
  );
}

/**
 * Require ADMIN_BOOTSTRAP_ENABLED=true and matching X-Admin-Bootstrap-Secret header.
 * Secrets via query, body, or Authorization are never accepted.
 */
export function requireAdminBootstrapAccess(req) {
  if (!isAdminBootstrapEnabled()) {
    return { ok: false, status: 404, hidden: true };
  }

  logAdminBootstrapAttempt(req);

  if (!adminBootstrapSecretConfigured() || !hasAdminBootstrapSecret(req)) {
    logAdminBootstrapDenied(req, { reason: "invalid_or_missing_secret" });
    return { ok: false, status: 404 };
  }

  return { ok: true };
}

export function sendAdminBootstrapAccessDenied(res, access = { status: 404 }) {
  if (access.hidden) {
    return res.status(404).json({ ok: false, error: "not_found" });
  }
  return res.status(access.status || 404).json({ ok: false, error: "not_found" });
}
