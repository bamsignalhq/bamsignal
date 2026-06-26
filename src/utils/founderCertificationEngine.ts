import type { FounderCertificationReport } from "../types/founderCertification";
import { buildFounderCertificationReport } from "./founderCertificationLogic";
import {
  getLatestFounderCertificationSnapshot,
  listFounderCertificationSnapshots
} from "./founderCertificationStore";

export function buildFounderCertificationBundle(): FounderCertificationReport {
  const history = listFounderCertificationSnapshots();
  const latest = getLatestFounderCertificationSnapshot();

  if (!latest) {
    const now = new Date().toISOString();
    return {
      generatedAt: now,
      runId: "pending",
      releaseCandidate: "—",
      overallScore: 0,
      releaseDecision: "no-go",
      releaseDecisionLabel: "PENDING",
      releaseDecisionDetail: "Run npm run certify:founder to generate the master launch certification.",
      passed: false,
      subsystemScores: [],
      criticalIssues: [],
      warnings: [],
      resolvedSinceLastRelease: [],
      summaryLine: "No founder certification snapshot — run npm run certify:founder",
      exports: { json: "", markdown: "", founderPdf: "", boardPdf: "" },
      source: "store"
    };
  }

  void history;
  return buildFounderCertificationReport(latest);
}
