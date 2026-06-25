import type { UxStatusId } from "../../../types/uxConsistency";

type InstitutionalStatusBadgeProps = {
  status: UxStatusId | "secure" | "warning" | "critical" | "healthy" | "partial" | "broken" | "optimized" | "slow";
  label?: string;
};

const STATUS_ALIASES: Record<string, UxStatusId> = {
  secure: "consistent",
  healthy: "consistent",
  consistent: "consistent",
  optimized: "consistent",
  warning: "review",
  review: "review",
  partial: "review",
  critical: "inconsistent",
  inconsistent: "inconsistent",
  slow: "inconsistent",
  broken: "inconsistent"
};

export function InstitutionalStatusBadge({ status, label }: InstitutionalStatusBadgeProps) {
  const normalized = STATUS_ALIASES[status] ?? "review";
  const display = label ?? normalized;
  return (
    <span className={`institutional-status-badge institutional-status-badge--${normalized}`}>
      {display}
    </span>
  );
}
