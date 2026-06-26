import type { DependencyCertificationReport } from "../types/dependencyCertification";
import { buildDependencyCertificationReport } from "./dependencyCertificationLogic";
import {
  getLatestDependencyCertificationSnapshot,
  listDependencyCertificationSnapshots
} from "./dependencyCertificationStore";

export function buildDependencyCertificationBundle(): DependencyCertificationReport {
  const history = listDependencyCertificationSnapshots();
  const latest = getLatestDependencyCertificationSnapshot();

  if (!latest) {
    const now = new Date().toISOString();
    return {
      generatedAt: now,
      runId: "pending",
      dependencyScore: 0,
      passed: false,
      counts: { critical: 0, high: 0, medium: 0, low: 0, warning: 0 },
      packagesScanned: 0,
      categories: [],
      findings: [],
      criticalVulnerabilities: [],
      upgradeCandidates: [],
      unusedDependencies: [],
      duplicatePackages: [],
      recommendations: [],
      failures: [],
      summaryLine: "No certification snapshot — run npm run certify:dependencies",
      source: "store"
    };
  }

  void history;
  return buildDependencyCertificationReport(latest);
}
