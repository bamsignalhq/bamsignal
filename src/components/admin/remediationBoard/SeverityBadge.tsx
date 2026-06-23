import { REMEDIATION_SEVERITY_LABELS } from "../../../constants/remediationBoard";
import type { RemediationSeverityId } from "../../../types/remediationBoard";

type SeverityBadgeProps = {
  severity: RemediationSeverityId;
};

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  return (
    <span className={`remediation-badge remediation-badge--${severity.toLowerCase()}`}>
      {REMEDIATION_SEVERITY_LABELS[severity]}
    </span>
  );
}
