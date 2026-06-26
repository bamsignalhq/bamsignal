import { OBSERVABILITY_SERVICE_STATUS_LABELS } from "../../../constants/productionObservability";
import type { ObservabilitySummaryCard } from "../../../types/productionObservability";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";

const STATUS_BADGE = {
  healthy: "healthy",
  warning: "warning",
  offline: "broken"
} as const;

type ObservabilitySummaryCardsProps = {
  cards: ObservabilitySummaryCard[];
};

export function ObservabilitySummaryCards({ cards }: ObservabilitySummaryCardsProps) {
  return (
    <section className="observability-summary" aria-label="Operational summary">
      {cards.map((card) => (
        <article key={card.id} className="observability-summary__card concierge-consultant-card--glass">
          <header>
            <span className="observability-summary__label">{card.label}</span>
            <InstitutionalStatusBadge
              status={STATUS_BADGE[card.status]}
              label={OBSERVABILITY_SERVICE_STATUS_LABELS[card.status]}
            />
          </header>
          <strong className="observability-summary__value">{card.value}</strong>
          {card.detail ? <p className="observability-summary__detail">{card.detail}</p> : null}
        </article>
      ))}
    </section>
  );
}
