import type { ExecutiveMetric } from "../../../types/executiveDashboard";

type ExecutiveMetricCardProps = {
  metric: ExecutiveMetric;
};

export function ExecutiveMetricCard({ metric }: ExecutiveMetricCardProps) {
  return (
    <article className="executive-metric-card">
      <p className="executive-metric-card__label">{metric.label}</p>
      <strong className="executive-metric-card__value">{metric.value}</strong>
      {metric.trend ? <span className="executive-metric-card__trend">{metric.trend}</span> : null}
    </article>
  );
}
