/**
 * Data Integrity Certification™ — server-side verification helpers.
 */

export function formatDataIntegrityCertificationSummary(report) {
  return `Score ${report.integrityScore ?? 0}% · scanned ${report.objectsScanned ?? 0} · repaired ${report.objectsRepaired ?? 0} · critical ${report.criticalIssues?.length ?? 0}`;
}

export function dataIntegrityCertificationCommandRegistered(source) {
  return source.includes("certify:data-integrity") && source.includes("test:data-integrity-certification");
}

export function dataIntegrityCertificationModuleRegistered(source) {
  return source.includes("certification/data-integrity/run.mjs");
}
