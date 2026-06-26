import type { AccessibilityCertificationReport } from "../types/accessibilityCertification";
import { buildAccessibilityCertificationReport } from "./accessibilityCertificationLogic";
import {
  getLatestAccessibilityCertificationSnapshot,
  listAccessibilityCertificationSnapshots
} from "./accessibilityCertificationStore";

export function buildAccessibilityCertificationBundle(): AccessibilityCertificationReport {
  const history = listAccessibilityCertificationSnapshots();
  const latest = getLatestAccessibilityCertificationSnapshot();

  if (!latest) {
    const now = new Date().toISOString();
    return {
      generatedAt: now,
      runId: "pending",
      accessibilityScore: 0,
      passed: false,
      counts: { critical: 0, high: 0, medium: 0, low: 0, warning: 0 },
      domains: [],
      findings: [],
      violations: [],
      recommendations: [],
      failures: [],
      summaryLine: "No certification snapshot — run npm run certify:accessibility",
      source: "store"
    };
  }

  void history;
  return buildAccessibilityCertificationReport(latest);
}
