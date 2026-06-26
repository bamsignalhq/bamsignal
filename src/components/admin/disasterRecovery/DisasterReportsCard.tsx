import type { DisasterReportMetric } from "../../../types/disasterRecovery";

type DisasterReportsCardProps = {
  metrics: DisasterReportMetric[];
};

export function DisasterReportsCard({ metrics }: DisasterReportsCardProps) {
  return (
    <section className="disaster-reports-card concierge-consultant-card--glass cc-reveal">
      <header>
        <h3>Reports</h3>
        <p>Last backup, recovery duration, integrity, and failures.</p>
      </header>
      <div className="disaster-reports-card__grid">
        {metrics.map((metric) => (
          <article key={metric.id} className="disaster-report-chip">
            <p>{metric.label}</p>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
