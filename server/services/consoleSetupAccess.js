import { logObservabilityEvent, observabilityContext } from "./observability.js";

export const SETUP_SECRET_HEADER = "x-setup-secret";

export function isSetupEnabled() {
  return (
    String(process.env.LEGACY_SETUP_ENABLED || "")
      .trim()
      .toLowerCase() === "true"
  );
}

export function setupSecretConfigured() {
  return Boolean(String(process.env.LEGACY_SETUP_SECRET || "").trim());
}

export function extractSetupSecret(req) {
  return String(req?.headers?.[SETUP_SECRET_HEADER] || "").trim();
}

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

export function hasForbiddenSetupSecretChannel(req) {
  const body = parseBody(req);
  return Boolean(
    req?.query?.secret ||
      body?.setupSecret ||
      body?.secret ||
      req?.headers?.["x-bamsignal-secret"]
  );
}

export function validateSetupHeader(req) {
  const expected = String(process.env.LEGACY_SETUP_SECRET || "").trim();
  if (!expected) {
    return { ok: false, reason: "secret_not_configured" };
  }
  const provided = extractSetupSecret(req);
  if (!provided || provided !== expected) {
    return { ok: false, reason: "invalid_or_missing_secret" };
  }
  return { ok: true };
}

export function requireLegacySetupEnabled() {
  if (!isSetupEnabled()) {
    return { ok: false, status: 404, hidden: true };
  }
  if (!setupSecretConfigured()) {
    return { ok: false, status: 404, hidden: true };
  }
  return { ok: true };
}

export function logLegacySetupDenied(req, extra = {}) {
  return logObservabilityEvent(
    "legacy_setup_denied",
    observabilityContext(req, extra),
    "warn"
  );
}

export function sendLegacySetupAccessDenied(res, access = { status: 404 }) {
  if (access.hidden) {
    return res.status(404).json({ ok: false, error: "not_found" });
  }
  return res.status(access.status || 404).json({ ok: false, error: "not_found" });
}
