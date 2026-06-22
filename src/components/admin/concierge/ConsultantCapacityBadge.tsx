import {
  RECOMMENDATION_LEVEL_HINTS,
  RECOMMENDATION_LEVEL_LABELS,
  WORKLOAD_HEALTH_LABELS
} from "../../../constants/consultantAssignment";
import type { RecommendationLevel, WorkloadHealth } from "../../../types/consultantAssignment";

type ConsultantCapacityBadgeProps = {
  level: RecommendationLevel;
  workload?: WorkloadHealth;
  className?: string;
};

export function ConsultantCapacityBadge({
  level,
  workload,
  className = ""
}: ConsultantCapacityBadgeProps) {
  const hint = RECOMMENDATION_LEVEL_HINTS[level];
  const workloadHint = workload ? WORKLOAD_HEALTH_LABELS[workload] : null;

  return (
    <span
      className={`consultant-capacity-badge consultant-capacity-badge--${level} ${className}`.trim()}
      title={workloadHint ? `${hint} · ${workloadHint}` : hint}
    >
      {RECOMMENDATION_LEVEL_LABELS[level]}
    </span>
  );
}
