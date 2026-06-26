import type { DataIntegrityCertificationReport } from "../../../types/dataIntegrityCertification";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";

type DataIntegrityCertificationCardProps = {
  report: DataIntegrityCertificationReport;
};

export function DataIntegrityCertificationCard({ report }: DataIntegrityCertificationCardProps) {
  return (
    <section className="institutional-card data-integrity-cert-card concierge-consultant-card--glass cc-reveal">
      <header className="institutional-card__head">
        <h3>Data Integrity Certification™</h3>
        <p>
          Automated database certification — run <code>npm run certify:data-integrity</code> before
          release.
        </p>
      </header>
      <div className="data-integrity-cert-card__hero">
        <strong>{report.integrityScore}%</strong>
        <InstitutionalStatusBadge status={report.passed ? "consistent" : "inconsistent"} />
        <span>{report.mode}</span>
      </div>
      <p>{report.summaryLine}</p>
      <ul className="institutional-card__fixes">
        <li>
          Scanned: {report.objectsScanned} · Repaired: {report.objectsRepaired} · Review:{" "}
          {report.objectsRequiringReview}
        </li>
        <li>
          Critical: {report.criticalIssues.length} · Warnings: {report.warnings.length}
        </li>
        <li>Run ID: {report.runId}</li>
      </ul>
    </section>
  );
}
