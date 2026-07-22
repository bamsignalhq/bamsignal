import { verifySupabaseAdmin } from "../adminAuth.js";
import { logDiagnosticsAccessDenied } from "./identityExposure.js";
import { logObservabilityEvent } from "./observability.js";
import { recordDiagnosticsFailure } from "./infrastructureObservability.js";
import {
  CRON_SECRET_HEADER,
  DIAGNOSTICS_SECRET_HEADER,
  cronAutomationSecret,
  diagnosticsAutomationSecret,
  extractHeaderSecret,
  matchesCronSecret,
  matchesDiagnosticsSecret
} from "./operationSecrets.js";

export function extractDiagnosticsSecret(req) {
  return extractHeaderSecret(req, DIAGNOSTICS_SECRET_HEADER);
}

export function hasDiagnosticsSecret(req) {
  const provided = extractDiagnosticsSecret(req);
  if (!provided) return false;
  if (matchesDiagnosticsSecret(provided)) return true;

  // Deprecated transition: CRON_SECRET accepted for diagnostics when DIAGNOSTICS_SECRET unset.
  if (!diagnosticsAutomationSecret() && matchesCronSecret(provided)) {
    logObservabilityEvent(
      "diagnostics_cron_secret_deprecated",
      { path: req?.path || req?.url || "unknown" },
      "warn"
    );
    return true;
  }

  return false;
}

/**
 * Require x-diagnostics-secret (DIAGNOSTICS_SECRET) or verified admin session.
 * CRON_SECRET accepted only when DIAGNOSTICS_SECRET is unset (deprecated, logged).
 */
export async function requireDiagnosticsAccess(req) {
  if (hasDiagnosticsSecret(req)) return { ok: true };
  if (await verifySupabaseAdmin(req)) return { ok: true };
  logDiagnosticsAccessDenied({ path: req?.path || req?.url || "unknown" });
  recordDiagnosticsFailure({ path: req?.path || req?.url || "unknown" });
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

/** @deprecated use extractDiagnosticsSecret */
export { CRON_SECRET_HEADER, DIAGNOSTICS_SECRET_HEADER };
