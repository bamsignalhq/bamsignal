import type { DataIntegrityCertificationSnapshot } from "../types/dataIntegrityCertification";

export function formatDataIntegrityCertificationSummary(
  report: Pick<
    DataIntegrityCertificationSnapshot,
    "integrityScore" | "objectsScanned" | "objectsRepaired" | "criticalIssues"
  >
): string {
  return `Score ${report.integrityScore}% · scanned ${report.objectsScanned} · repaired ${report.objectsRepaired} · critical ${report.criticalIssues.length}`;
}
