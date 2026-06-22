import type {
  RelationshipHealthAlertSeverity,
  RelationshipHealthAlertType
} from "../../../constants/relationshipHealthAlerts";
import {
  healthAlertSeverityLabel,
  healthAlertTypeLabel
} from "../../../constants/relationshipHealthAlerts";

type HealthAlertBadgeProps = {
  alertType: RelationshipHealthAlertType;
  severity?: RelationshipHealthAlertSeverity;
  showSeverity?: boolean;
  primary?: boolean;
};

export function HealthAlertBadge({
  alertType,
  severity,
  showSeverity = true,
  primary = false
}: HealthAlertBadgeProps) {
  return (
    <span className={`health-alert-badge${primary ? " health-alert-badge--primary" : ""}`}>
      <span className="health-alert-badge__type">{healthAlertTypeLabel(alertType)}</span>
      {showSeverity && severity ? (
        <span className={`health-alert-badge__severity health-alert-badge__severity--${severity}`}>
          {healthAlertSeverityLabel(severity)}
        </span>
      ) : null}
    </span>
  );
}
