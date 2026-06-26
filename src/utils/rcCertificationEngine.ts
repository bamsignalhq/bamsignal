import type { RcCertificationReport } from "../types/rcCertification";
import { buildRcCertificationReport } from "./rcCertificationLogic";
import { getLatestRcCertificationSnapshot, listRcCertificationSnapshots } from "./rcCertificationStore";

export function buildRcCertificationBundle(): RcCertificationReport {
  const history = listRcCertificationSnapshots();
  const latest = getLatestRcCertificationSnapshot();

  if (!latest) {
    const now = new Date().toISOString();
    return {
      runId: "pending",
      rcNumber: "RC-pending",
      certificationTimestamp: now,
      gitCommit: "—",
      gitCommitShort: "—",
      buildVersion: "—",
      buildCode: "0",
      cacheVersion: "—",
      environment: "unknown",
      overallScore: 0,
      releaseDecision: "no-go",
      releaseDecisionLabel: "NO GO",
      releaseDecisionDetail: "No RC certification snapshot — run npm run certify:rc",
      passed: false,
      passedChecks: 0,
      subsystemScores: [],
      criticalIssues: [],
      warnings: [],
      blockers: [],
      summaryLine: "No certification snapshot — run npm run certify:rc",
      source: "store"
    };
  }

  void history;
  return buildRcCertificationReport(latest);
}
