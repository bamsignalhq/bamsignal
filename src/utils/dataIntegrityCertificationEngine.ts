import type { DataIntegrityCertificationReport } from "../types/dataIntegrityCertification";
import { formatDataIntegrityCertificationSummary } from "./dataIntegrityCertificationLogic";
import {
  getLatestDataIntegrityCertificationSnapshot,
  listDataIntegrityCertificationSnapshots
} from "./dataIntegrityCertificationStore";

export function buildDataIntegrityCertificationBundle(): DataIntegrityCertificationReport {
  const history = listDataIntegrityCertificationSnapshots();
  const latest = getLatestDataIntegrityCertificationSnapshot();

  if (!latest) {
    const now = new Date().toISOString();
    return {
      generatedAt: now,
      runId: "pending",
      mode: "static",
      integrityScore: 0,
      passed: false,
      objectsScanned: 0,
      objectsRepaired: 0,
      objectsRequiringReview: 0,
      domains: [],
      criticalIssues: [],
      warnings: [],
      repairs: [],
      flaggedForReview: [],
      summaryLine: "No certification snapshot — run npm run certify:data-integrity",
      source: "store"
    };
  }

  void history;
  return {
    ...latest,
    summaryLine: formatDataIntegrityCertificationSummary(latest),
    source: "store"
  };
}
