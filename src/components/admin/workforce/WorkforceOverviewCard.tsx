import type { WorkforceOverviewMetric } from "../../../types/workforceManagement";

type WorkforceOverviewCardProps = {
  metrics: WorkforceOverviewMetric[];
};

export function WorkforceOverviewCard({ metrics }: WorkforceOverviewCardProps) {
  return (
    <section className="workforce-card workforce-overview-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Workforce overview</h3>
        <p>Institutional staffing snapshot — active consultants, capacity, and leave impact.</p>
      </header>
      <div className="workforce-overview-card__grid">
        {metrics.map((metric) => (
          <article key={metric.id} className="workforce-metric">
            <span className="workforce-metric__label">{metric.label}</span>
            <strong className="workforce-metric__value">{metric.value}</strong>
            {metric.hint ? <span className="workforce-metric__hint">{metric.hint}</span> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
