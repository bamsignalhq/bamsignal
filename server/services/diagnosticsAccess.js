import { verifySupabaseAdmin } from "../adminAuth.js";
import { logDiagnosticsAccessDenied } from "./identityExposure.js";

function allowedDiagnosticsSecrets() {
  return [process.env.DIAGNOSTICS_SECRET, process.env.CRON_SECRET]
    .filter(Boolean)
    .map((value) => String(value).trim());
}

export function extractDiagnosticsSecret(req) {
  return String(req?.headers?.["x-diagnostics-secret"] || "").trim();
}

export function hasDiagnosticsSecret(req) {
  const allowed = allowedDiagnosticsSecrets();
  if (!allowed.length) return false;
  const provided = extractDiagnosticsSecret(req);
  return Boolean(provided && allowed.includes(provided));
}

/**
 * Require x-diagnostics-secret (DIAGNOSTICS_SECRET or CRON_SECRET) or verified admin session.
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
