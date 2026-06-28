/**
 * Certification execution mode — distinguishes dry-run, staging, and production runs.
 */

export const CERT_EXECUTION_MODES = ["dry-run", "staging", "production"];

/**
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {"dry-run"|"staging"|"production"}
 */
export function resolveCertificationExecutionMode(env = process.env) {
  const profile = String(env.CERTIFICATION_PROFILE || "").toLowerCase();
  if (profile === "local") return "dry-run";
  if (profile === "staging") return "staging";
  if (profile === "production") return "production";

  const explicit = String(env.CERTIFICATION_EXECUTION_MODE || "").toLowerCase();
  if (CERT_EXECUTION_MODES.includes(explicit)) return explicit;

  const target = String(env.CERTIFICATION_TARGET || env.ENV_TARGET || env.NODE_ENV || "local").toLowerCase();
  const hasDatabase = Boolean(String(env.DATABASE_URL || "").trim());
  const publicUrl = String(env.PUBLIC_APP_URL || env.VITE_PUBLIC_APP_URL || "").toLowerCase();

  if (!hasDatabase) return "dry-run";

  if (target === "production" || target === "prod") return "production";
  if (publicUrl.includes("bamsignal.com") && !publicUrl.includes("staging")) return "production";

  return "staging";
}

/**
 * @param {"dry-run"|"staging"|"production"} mode
 */
export function certificationModeDescription(mode) {
  switch (mode) {
    case "dry-run":
      return "Dry Run — DATABASE_URL missing or DB unreachable; optional integrations may be absent.";
    case "staging":
      return "Staging — real services expected; optional integrations scored as warnings only.";
    case "production":
      return "Production — full readiness required for release gate.";
    default:
      return mode;
  }
}

/**
 * Whether a certification finding about optional integrations should affect score.
 * @param {"dry-run"|"staging"|"production"} mode
 * @param {{ optionalIntegration?: boolean, id?: string }} finding
 */
export function shouldPenalizeCertFinding(mode, finding) {
  if (mode === "dry-run" && finding.optionalIntegration) return false;
  if (mode === "dry-run" && finding.id === "db-unavailable") return false;
  if (mode === "staging" && finding.optionalIntegration) return false;
  return true;
}

/**
 * @param {Array<{ severity?: string, optionalIntegration?: boolean, id?: string }>} findings
 * @param {"dry-run"|"staging"|"production"} mode
 */
export function filterScoredFindings(findings, mode) {
  return findings.filter((item) => {
    if (item.severity === "critical") return true;
    return shouldPenalizeCertFinding(mode, item);
  });
}
