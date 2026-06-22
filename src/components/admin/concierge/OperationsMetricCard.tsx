import type { OperationsCenterMetric } from "../../../types/operationsCenter";

type OperationsMetricCardProps = {
  metric: OperationsCenterMetric;
};

export function OperationsMetricCard({ metric }: OperationsMetricCardProps) {
  return (
    <article className="operations-center-metric concierge-consultant-card--glass cc-reveal">
      <strong>{metric.count}</strong>
      <span>{metric.label}</span>
      {metric.hint ? <p>{metric.hint}</p> : null}
    </article>
  );
}
