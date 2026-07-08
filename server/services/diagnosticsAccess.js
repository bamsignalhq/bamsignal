import { verifySupabaseAdmin } from "../adminAuth.js";
import { logDiagnosticsAccessDenied } from "./identityExposure.js";
import {
  ADMIN_SECRET_HEADER,
  adminAutomationSecret,
  extractHeaderSecret
} from "./operationSecrets.js";

export function extractDiagnosticsSecret(req) {
  return extractHeaderSecret(req, ADMIN_SECRET_HEADER);
}

export function hasDiagnosticsSecret(req) {
  const expected = adminAutomationSecret();
  if (!expected) return false;
  const provided = extractDiagnosticsSecret(req);
  return Boolean(provided && provided === expected);
}

/**
 * Require x-bamsignal-secret (ADMIN_SECRET only) or verified admin session.
 */
export async function requireDiagnosticsAccess(req) {
  if (hasDiagnosticsSecret(req)) return { ok: true };
  if (await verifySupabaseAdmin(req)) return { ok: true };
  logDiagnosticsAccessDenied({ path: req?.path || req?.url || "unknown" });
  return { ok: false, status: 404 };
}

export function sendDiagnosticsAccessDenied(res, access = { status: 404 }) {
  if (access.status === 404) {
    logDiagnosticsAccessDenied({ response: "empty_404" });
    return res.status(404).end();
  }
  logDiagnosticsAccessDenied({ response: "json", status: access.status || 401 });
  return res.status(access.status || 401).json({ ok: false, error: "not_authorized" });
}
