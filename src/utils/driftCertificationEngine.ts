import type { DriftCertificationReport } from "../types/driftCertification";
import { buildDriftCertificationReport } from "./driftCertificationLogic";
import {
  getLatestDriftCertificationSnapshot,
  listDriftCertificationSnapshots
} from "./driftCertificationStore";

export function buildDriftCertificationBundle(): DriftCertificationReport {
  const history = listDriftCertificationSnapshots();
  const latest = getLatestDriftCertificationSnapshot();

  if (!latest) {
    const now = new Date().toISOString();
    return {
      generatedAt: now,
      runId: "pending",
      mode: "static",
      driftScore: 0,
      passed: false,
      counts: { critical: 0, high: 0, medium: 0, low: 0, warning: 0 },
      domains: [],
      findings: [],
      unexpectedDrift: 0,
      unauthorizedChanges: 0,
      configurationMismatches: 0,
      missingSecrets: 0,
      unusedSecrets: [],
      recommendations: [],
      failures: [],
      summaryLine: "No certification snapshot — run npm run certify:drift",
      source: "store"
    };
  }

  void history;
  return buildDriftCertificationReport(latest);
}
