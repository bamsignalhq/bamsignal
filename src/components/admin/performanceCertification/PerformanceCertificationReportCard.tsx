import type { PerformanceCertificationReport } from "../../../types/performanceCertification";
import { formatPerformanceCertificationSummary } from "../../../utils/performanceCertificationLogic";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";

type PerformanceCertificationReportCardProps = {
  report: PerformanceCertificationReport;
};

export function PerformanceCertificationReportCard({ report }: PerformanceCertificationReportCardProps) {
  return (
    <section className="institutional-card performance-certification-report-card concierge-consultant-card--glass cc-reveal">
      <header className="institutional-card__head">
        <h3>Performance score</h3>
        <p>Release gate — every metric must pass before deployment approval.</p>
      </header>

      <div className="performance-certification-report-card__hero">
        <strong>{report.performanceScore}%</strong>
        <InstitutionalStatusBadge status={report.passed ? "consistent" : "inconsistent"} />
        <span>{report.trend}</span>
      </div>

      <p className="performance-certification-report-card__line">{formatPerformanceCertificationSummary(report)}</p>

      <div className="performance-certification-report-card__metrics">
        {report.metrics.map((metric) => (
          <article key={metric.id}>
            <span>{metric.label}</span>
            <strong>
              {metric.value}
              {metric.unit}
            </strong>
            <InstitutionalStatusBadge status={metric.passed ? "consistent" : "inconsistent"} />
            <small>{metric.thresholdLabel}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
