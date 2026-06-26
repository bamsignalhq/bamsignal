import type { ReliabilityCertificationReport } from "../types/reliabilityCertification";
import { buildReliabilityCertificationReport } from "./reliabilityCertificationLogic";
import {
  getLatestReliabilityCertificationSnapshot,
  listReliabilityCertificationSnapshots
} from "./reliabilityCertificationStore";

export function buildReliabilityCertificationBundle(): ReliabilityCertificationReport {
  const history = listReliabilityCertificationSnapshots();
  const latest = getLatestReliabilityCertificationSnapshot();

  if (!latest) {
    const now = new Date().toISOString();
    return {
      generatedAt: now,
      runId: "pending",
      reliabilityScore: 0,
      passed: false,
      recoveryTimeMs: { average: null, max: null },
      recoverySuccess: 0,
      recoveryFailures: ["No reliability certification snapshot on record"],
      scenarios: [],
      summaryLine: "No certification snapshot — run npm run certify:reliability",
      recommendations: [
        {
          id: "rel_rec_pending",
          title: "Run reliability certification",
          detail: "Execute npm run certify:reliability and import the latest report.",
          priority: "high"
        }
      ],
      source: "store"
    };
  }

  void history;
  return buildReliabilityCertificationReport(latest);
}
