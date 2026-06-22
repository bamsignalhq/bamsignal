import { SAFETY_SEVERITY_LABELS, type SafetySeverityId } from "../../../constants/safetyCenter";

type SafetySeverityBadgeProps = {
  severity: SafetySeverityId;
};

export function SafetySeverityBadge({ severity }: SafetySeverityBadgeProps) {
  return (
    <span className={`safety-severity-badge safety-severity-badge--${severity}`}>
      {SAFETY_SEVERITY_LABELS[severity]}
    </span>
  );
}
