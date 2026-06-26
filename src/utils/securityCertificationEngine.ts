import type { SecurityCertificationReport } from "../types/securityCertification";
import { buildSecurityCertificationReport } from "./securityCertificationLogic";
import {
  getLatestSecurityCertificationSnapshot,
  listSecurityCertificationSnapshots
} from "./securityCertificationStore";

export function buildSecurityCertificationBundle(): SecurityCertificationReport {
  const history = listSecurityCertificationSnapshots();
  const latest = getLatestSecurityCertificationSnapshot();

  if (!latest) {
    const now = new Date().toISOString();
    return {
      generatedAt: now,
      runId: "pending",
      securityScore: 0,
      passed: false,
      counts: { critical: 0, high: 0, medium: 0, low: 0 },
      findings: [],
      summaryLine: "No certification snapshot — run npm run certify:security",
      recommendations: [
        {
          id: "sec_rec_pending",
          title: "Run security certification",
          detail: "Execute npm run certify:security after build and import the latest report.",
          priority: "high"
        }
      ],
      failures: ["No security certification snapshot on record"],
      source: "store"
    };
  }

  void history;
  return buildSecurityCertificationReport(latest);
}
