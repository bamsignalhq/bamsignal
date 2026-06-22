import { WORKLOAD_HEALTH_LABELS } from "../../../constants/consultantAssignment";
import type { WorkloadHealth } from "../../../types/consultantAssignment";

type AssignmentHealthBadgeProps = {
  health: WorkloadHealth;
  className?: string;
};

export function AssignmentHealthBadge({ health, className = "" }: AssignmentHealthBadgeProps) {
  return (
    <span className={`assignment-health-badge assignment-health-badge--${health} ${className}`.trim()}>
      {WORKLOAD_HEALTH_LABELS[health]}
    </span>
  );
}
