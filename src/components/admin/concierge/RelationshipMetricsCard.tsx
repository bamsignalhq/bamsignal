import {
  OUTCOME_METRIC_KEYS,
  RELATIONSHIP_METRIC_LABELS,
  RELATIONSHIP_OUTCOMES_TITLE
} from "../../../constants/consultantPerformanceScorecard";
import type { ConsultantRelationshipMetrics } from "../../../types/consultantPerformanceScorecard";

type RelationshipMetricsCardProps = {
  metrics: ConsultantRelationshipMetrics;
};

function formatMetricValue(
  key: (typeof OUTCOME_METRIC_KEYS)[number] | "responseTimeHours" | "memberSatisfaction" | "retentionRate",
  metrics: ConsultantRelationshipMetrics
): string {
  if (key === "responseTimeHours") {
    return metrics.responseTimeHours !== null ? `${metrics.responseTimeHours}h` : "—";
  }
  if (key === "memberSatisfaction") {
    return metrics.memberSatisfaction !== null ? `${metrics.memberSatisfaction}%` : "—";
  }
  if (key === "retentionRate") {
    return metrics.retentionRate !== null ? `${metrics.retentionRate}%` : "—";
  }
  return String(metrics[key]);
}

export function RelationshipMetricsCard({ metrics }: RelationshipMetricsCardProps) {
  return (
    <section className="relationship-metrics-card concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="relationship-metrics-card__head">
        <h3>{RELATIONSHIP_OUTCOMES_TITLE}</h3>
        <p>Journey milestones tracked — never revenue, sales, or conversion rates.</p>
      </header>

      <dl className="relationship-metrics-card__grid">
        {OUTCOME_METRIC_KEYS.map((key) => (
          <div key={key}>
            <dt>{RELATIONSHIP_METRIC_LABELS[key]}</dt>
            <dd>{formatMetricValue(key, metrics)}</dd>
          </div>
        ))}
        <div>
          <dt>Response time</dt>
          <dd>{formatMetricValue("responseTimeHours", metrics)}</dd>
        </div>
        <div>
          <dt>Member satisfaction</dt>
          <dd>{formatMetricValue("memberSatisfaction", metrics)}</dd>
        </div>
        <div>
          <dt>Retention</dt>
          <dd>{formatMetricValue("retentionRate", metrics)}</dd>
        </div>
      </dl>
    </section>
  );
}
