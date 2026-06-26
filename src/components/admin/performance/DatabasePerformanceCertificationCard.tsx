import type { DatabasePerfCertificationReport } from "../../../types/databasePerformanceCertification";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";

type DatabasePerformanceCertificationCardProps = {
  report: DatabasePerfCertificationReport;
};

export function DatabasePerformanceCertificationCard({
  report
}: DatabasePerformanceCertificationCardProps) {
  return (
    <section className="performance-center-card database-perf-cert-card concierge-consultant-card--glass cc-reveal">
      <header className="performance-center-card__head">
        <h3>Database Performance Certification™</h3>
        <p>
          Continuous database efficiency gate — run <code>npm run certify:database</code> before
          release.
        </p>
      </header>
      <div className="database-perf-cert-card__hero">
        <strong>{report.riskScore}%</strong>
        <InstitutionalStatusBadge status={report.passed ? "optimized" : "slow"} />
        <span>{report.mode}</span>
      </div>
      <p>{report.summaryLine}</p>
      <ul className="performance-center-card__list">
        <li>
          <div className="performance-center-card__meta">
            <span>Avg {report.metrics.avgQueryMs}ms</span>
            <span>P95 {report.metrics.p95Ms}ms</span>
            <span>P99 {report.metrics.p99Ms}ms</span>
            <span>Cache {report.metrics.cacheHitPercent}%</span>
          </div>
        </li>
        <li>
          Critical: {report.criticalIssues.length} · Regressions: {report.criticalRegressions.length}{" "}
          · Warnings: {report.warnings.length}
        </li>
        <li>Opportunities: {report.optimizationOpportunities.length} · Run ID: {report.runId}</li>
      </ul>
    </section>
  );
}
