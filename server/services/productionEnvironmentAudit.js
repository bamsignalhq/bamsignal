/**
 * Production Environment Audit™ — server-side verification helpers.
 */

export function canAccessProductionEnvironmentAudit(permissions = []) {
  return permissions.includes("ManageOperations") || permissions.includes("SystemAdministration");
}

export function productionEnvironmentRouteRegistered(source) {
  return source.includes("/hard/production-environment") && source.includes("productionenvironment");
}

export function formatProductionEnvironmentSummary(report) {
  return `${report.readyCount} ready · ${report.warningCount} warning · score ${report.overallScore}`;
}

export function isPlaceholderEnvValue(value = "") {
  const trimmed = String(value).trim();
  if (!trimmed) return false;
  const patterns = [
    /^<.*>$/,
    /changeme/i,
    /your[-_]?/i,
    /replace[-_]?me/i,
    /^xxx+$/i,
    /^todo$/i
  ];
  return patterns.some((pattern) => pattern.test(trimmed));
}

export function parseEnvExampleKeys(source) {
  const keys = [];
  for (const line of source.split("\n")) {
    const match = line.match(/^([A-Z][A-Z0-9_]*)=/);
    if (match) keys.push(match[1]);
  }
  return keys;
}

export function registryCriticalVarNames() {
  return [
    "DATABASE_URL",
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_ANON_KEY",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "PAYSTACK_SECRET_KEY",
    "VITE_PAYSTACK_PUBLIC_KEY",
    "RESEND_API_KEY",
    "CRON_SECRET",
    "COMMAND_CENTER_PIN",
    "COMMAND_CENTER_EMAILS",
    "PUBLIC_APP_URL",
    "VITE_PUBLIC_APP_URL"
  ];
}
