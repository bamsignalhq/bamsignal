import type { FinancialHealthMetric } from "../../../types/financeOperations";

type FinancialHealthCardProps = {
  metrics: FinancialHealthMetric[];
};

export function FinancialHealthCard({ metrics }: FinancialHealthCardProps) {
  return (
    <section className="finance-card financial-health-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Financial health</h3>
        <p>Institutional finance posture — failures, chargebacks, refunds, reconciliation, payouts.</p>
      </header>
      <div className="financial-health-card__grid">
        {metrics.map((metric) => (
          <article
            key={metric.id}
            className={`finance-metric finance-metric--${metric.tone ?? "healthy"}`}
          >
            <span className="finance-metric__label">{metric.label}</span>
            <strong className="finance-metric__value">{metric.value}</strong>
            {metric.hint ? <span className="finance-metric__hint">{metric.hint}</span> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
