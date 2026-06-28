/**
 * Release Candidate gate rules — profile-aware required subsystems.
 */
import { CERT_RESULT_STATUS } from "./certificationProfile.mjs";

/** Always required for an official production release decision. */
export const RC_PRODUCTION_REQUIRED = ["production-smoke", "security"];

/** Integration tests that must pass in staging/CI before production release. */
export const RC_STAGING_INTEGRATION_REQUIRED = [
  "reliability",
  "performance",
  "platform-load",
  "data-integrity",
  "database",
  "operational-drift",
  "penetration",
  "chaos"
];

/** Full staging gate — all integration + smoke + security. */
export const RC_STAGING_REQUIRED = [...RC_PRODUCTION_REQUIRED, ...RC_STAGING_INTEGRATION_REQUIRED];

/** Default max age for reusing a staging integration report in production RC (7 days). */
export const RC_STAGING_REPORT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * @param {"local"|"staging"|"production"} profile
 * @returns {string[]}
 */
export function requiredSubsystemsForProfile(profile) {
  if (profile === "production") return RC_PRODUCTION_REQUIRED;
  if (profile === "staging") return RC_STAGING_REQUIRED;
  return [];
}

/**
 * Integration subsystems that may be satisfied by a fresh staging report during production RC.
 * @param {"local"|"staging"|"production"} profile
 * @returns {string[]}
 */
export function delegatedStagingSubsystems(profile) {
  if (profile === "production") return RC_STAGING_INTEGRATION_REQUIRED;
  return [];
}

/**
 * @param {"local"|"staging"|"production"} profile
 */
export function rcBlocksDeployment(profile) {
  return profile === "staging" || profile === "production";
}

/**
 * @param {{ passed?: boolean, skipped?: boolean, status?: string, generatedAt?: string }} report
 */
export function reportOutcome(report) {
  if (!report) return CERT_RESULT_STATUS.FAILED;
  if (report.status === CERT_RESULT_STATUS.SKIPPED || report.skipped) {
    return CERT_RESULT_STATUS.SKIPPED;
  }
  if (report.outcome === CERT_RESULT_STATUS.PASSED || report.passed) {
    return CERT_RESULT_STATUS.PASSED;
  }
  if (report.outcome === CERT_RESULT_STATUS.FAILED) {
    return CERT_RESULT_STATUS.FAILED;
  }
  return report.passed ? CERT_RESULT_STATUS.PASSED : CERT_RESULT_STATUS.FAILED;
}

/**
 * @param {string} isoTimestamp
 * @param {number} [maxAgeMs]
 */
export function isReportFresh(isoTimestamp, maxAgeMs = RC_STAGING_REPORT_MAX_AGE_MS) {
  if (!isoTimestamp) return false;
  const ts = Date.parse(isoTimestamp);
  if (!Number.isFinite(ts)) return false;
  return Date.now() - ts <= maxAgeMs;
}

/**
 * @param {string} subsystemId
 * @param {{ passed?: boolean, skipped?: boolean, status?: string, generatedAt?: string } | null} report
 * @param {"local"|"staging"|"production"} profile
 * @param {{ stagingReports?: Record<string, object> }} [options]
 */
export function evaluateSubsystemGate(subsystemId, report, profile, options = {}) {
  const required = requiredSubsystemsForProfile(profile);
  const delegated = delegatedStagingSubsystems(profile);
  const outcome = reportOutcome(report);

  if (profile === "local") {
    if (outcome === CERT_RESULT_STATUS.SKIPPED) {
      return {
        outcome: CERT_RESULT_STATUS.SKIPPED,
        passed: true,
        required: false,
        blocksRelease: false,
        summary: `${subsystemId} skipped — local profile advisory only.`
      };
    }
    return {
      outcome,
      passed: outcome === CERT_RESULT_STATUS.PASSED,
      required: false,
      blocksRelease: false,
      summary:
        outcome === CERT_RESULT_STATUS.PASSED
          ? `${subsystemId} passed (local advisory).`
          : `${subsystemId} failed (local advisory — does not block production).`
    };
  }

  const isRequired = required.includes(subsystemId);
  const isDelegated = delegated.includes(subsystemId);

  if (outcome === CERT_RESULT_STATUS.SKIPPED) {
    if (!isRequired && !isDelegated) {
      return {
        outcome: CERT_RESULT_STATUS.SKIPPED,
        passed: true,
        required: false,
        blocksRelease: false,
        summary: `${subsystemId} skipped — not required for ${profile} profile.`
      };
    }
    return {
      outcome: CERT_RESULT_STATUS.SKIPPED,
      passed: false,
      required: true,
      blocksRelease: rcBlocksDeployment(profile),
      summary: `${subsystemId} skipped — required infrastructure unavailable.`
    };
  }

  if (profile === "production" && isDelegated && outcome !== CERT_RESULT_STATUS.PASSED) {
    const stagingReport = options.stagingReports?.[subsystemId] || null;
    const stagingOutcome = reportOutcome(stagingReport);
    const fresh = isReportFresh(stagingReport?.generatedAt || stagingReport?.certificationTimestamp);
    if (stagingOutcome === CERT_RESULT_STATUS.PASSED && fresh) {
      return {
        outcome: CERT_RESULT_STATUS.PASSED,
        passed: true,
        required: true,
        blocksRelease: true,
        delegatedFrom: "staging",
        summary: `${subsystemId} satisfied by fresh staging certification report.`
      };
    }
    if (stagingReport && !fresh) {
      return {
        outcome: CERT_RESULT_STATUS.FAILED,
        passed: false,
        required: true,
        blocksRelease: true,
        summary: `${subsystemId} staging report stale — re-run staging integration certification.`
      };
    }
  }

  const passed = outcome === CERT_RESULT_STATUS.PASSED;
  return {
    outcome,
    passed: isRequired || isDelegated ? passed : passed,
    required: isRequired || isDelegated,
    blocksRelease: rcBlocksDeployment(profile) && (isRequired || isDelegated) && !passed,
    summary: passed
      ? `${subsystemId} passed.`
      : `${subsystemId} failed${isRequired || isDelegated ? " — release blocker" : ""}.`
  };
}
