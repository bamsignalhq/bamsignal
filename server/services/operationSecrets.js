/**
 * Runtime secret scopes — CRON_SECRET must never grant admin, diagnostics, or ops access.
 */

function trimEnv(name) {
  return String(process.env[name] || "").trim();
}

export function adminAutomationSecret() {
  return trimEnv("ADMIN_SECRET");
}

export function cronAutomationSecret() {
  return trimEnv("CRON_SECRET");
}

export function diagnosticsAutomationSecret() {
  return trimEnv("DIAGNOSTICS_SECRET");
}

/** Header used for admin automation (Coolify jobs, internal scripts). */
export const ADMIN_SECRET_HEADER = "x-bamsignal-secret";

/** Header used for diagnostics and readiness detail probes. */
export const DIAGNOSTICS_SECRET_HEADER = "x-diagnostics-secret";

/** Header used for scheduled job endpoints only. */
export const CRON_SECRET_HEADER = "x-cron-secret";

export function extractHeaderSecret(req, headerName) {
  return String(req?.headers?.[headerName] || "").trim();
}

/**
 * Admin API automation: ADMIN_SECRET only.
 * Deprecated transition: when ADMIN_SECRET is unset, CRON_SECRET still works (logged).
 */
export function matchesAdminAutomationSecret(provided) {
  const secret = String(provided || "").trim();
  if (!secret) return false;

  const adminSecret = adminAutomationSecret();
  if (adminSecret) return secret === adminSecret;

  const cronSecret = cronAutomationSecret();
  return Boolean(cronSecret && secret === cronSecret);
}

export function usesDeprecatedCronAdminSecret(provided) {
  if (adminAutomationSecret()) return false;
  const cronSecret = cronAutomationSecret();
  return Boolean(cronSecret && String(provided || "").trim() === cronSecret);
}

export function adminSecretIsolatedFromCron() {
  const adminSecret = adminAutomationSecret();
  const cronSecret = cronAutomationSecret();
  if (!cronSecret) return true;
  return Boolean(adminSecret);
}

export function matchesDiagnosticsSecret(provided) {
  const secret = String(provided || "").trim();
  if (!secret) return false;
  const diagnosticsSecret = diagnosticsAutomationSecret();
  return Boolean(diagnosticsSecret && secret === diagnosticsSecret);
}

export function matchesCronSecret(provided) {
  const secret = String(provided || "").trim();
  if (!secret) return false;
  const cronSecret = cronAutomationSecret();
  return Boolean(cronSecret && secret === cronSecret);
}
