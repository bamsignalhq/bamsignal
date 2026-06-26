import type { PerformanceCertificationReport } from "../types/performanceCertification";
import { buildPerformanceCertificationReport } from "./performanceCertificationLogic";
import { getLatestPerformanceCertificationSnapshot, listPerformanceCertificationSnapshots } from "./performanceCertificationStore";

export function buildPerformanceCertificationBundle(): PerformanceCertificationReport {
  const history = listPerformanceCertificationSnapshots();
  const latest = getLatestPerformanceCertificationSnapshot();

  if (!latest) {
    const now = new Date().toISOString();
    return {
      generatedAt: now,
      runId: "pending",
      performanceScore: 0,
      passed: false,
      trend: "stable",
      summaryLine: "No certification snapshot — run npm run certify:performance",
      metrics: [],
      comparisons: [],
      regressions: [],
      recommendations: [
        {
          id: "perf_rec_pending",
          title: "Run performance certification",
          detail: "Execute npm run certify:performance after build and import the latest report.",
          priority: "high"
        }
      ],
      failures: ["No performance certification snapshot on record"],
      source: "store"
    };
  }

  return buildPerformanceCertificationReport(latest, history);
}
