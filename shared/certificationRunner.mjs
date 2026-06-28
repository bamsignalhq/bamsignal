/**
 * Helpers for certification runners — skipped vs failed outcomes.
 */
import {
  CERT_RESULT_STATUS,
  buildSkipReason,
  mergeExecutionContext,
  resolveCertificationProfile
} from "./certificationProfile.mjs";

export { CERT_RESULT_STATUS, buildSkipReason, mergeExecutionContext, resolveCertificationProfile };

/**
 * @param {object} params
 * @param {string} params.suite
 * @param {string} params.requirement
 * @param {string} params.detail
 * @param {NodeJS.ProcessEnv} [params.env]
 */
export function buildSkippedCertReport({ suite, requirement, detail, env = process.env, extra = {} }) {
  const profile = resolveCertificationProfile(env);
  const skip = buildSkipReason({ requirement, detail, profile });

  return {
    status: CERT_RESULT_STATUS.SKIPPED,
    skipped: true,
    passed: false,
    suite,
    certificationProfile: profile,
    advisoryOnly: profile === "local",
    skipReason: requirement,
    skipDetail: detail,
    failures: [],
    generatedAt: new Date().toISOString(),
    ...extra,
    ...skip
  };
}

/**
 * @param {"local"|"staging"|"production"} profile
 * @param {boolean} shouldSkip
 */
export function skipBlocksCertExit(profile, shouldSkip) {
  if (!shouldSkip) return true;
  return profile === "staging" || profile === "production";
}

/**
 * @param {object} report
 * @param {"local"|"staging"|"production"} profile
 */
export function certificationExitCode(report, profile) {
  if (report?.skipped || report?.status === CERT_RESULT_STATUS.SKIPPED) {
    return profile === "local" ? 0 : 1;
  }
  if (profile === "local") {
    return 0;
  }
  return report?.passed ? 0 : 1;
}
