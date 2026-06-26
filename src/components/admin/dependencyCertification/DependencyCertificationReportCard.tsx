import type { DependencyCertificationReport } from "../../../types/dependencyCertification";
import { formatDependencyCertificationSummary } from "../../../utils/dependencyCertificationLogic";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";

type DependencyCertificationReportCardProps = {
  report: DependencyCertificationReport;
};

export function DependencyCertificationReportCard({ report }: DependencyCertificationReportCardProps) {
  return (
    <section className="institutional-card dependency-certification-report-card concierge-consultant-card--glass cc-reveal">
      <header className="institutional-card__head">
        <h3>Dependency score</h3>
        <p>Release gate — critical dependency vulnerabilities block deployment.</p>
      </header>

      <div className="dependency-certification-report-card__hero">
        <strong>{report.dependencyScore}%</strong>
        <InstitutionalStatusBadge status={report.passed ? "secure" : "critical"} />
        <span>{report.passed ? "PASS" : "BLOCKED"}</span>
      </div>

      <p className="dependency-certification-report-card__line">
        {formatDependencyCertificationSummary(report)}
      </p>

      <div className="dependency-certification-report-card__metrics">
        <article>
          <span>Critical CVEs</span>
          <strong>{report.criticalVulnerabilities.length}</strong>
        </article>
        <article>
          <span>Upgrades</span>
          <strong>{report.upgradeCandidates.length}</strong>
        </article>
        <article>
          <span>Unused</span>
          <strong>{report.unusedDependencies.length}</strong>
        </article>
        <article>
          <span>Scanned</span>
          <strong>{report.packagesScanned}</strong>
        </article>
      </div>
    </section>
  );
}
