import {
  getHealthAlertDefinition,
  JOURNEY_SUPPORT_LABEL,
  RELATIONSHIP_HEALTH_ALERT_FUTURE_ADVISORS,
  RELATIONSHIP_HEALTH_ALERT_PURPOSE_COPY,
  RELATIONSHIP_HEALTH_ALERT_RESERVED_COPY,
  RELATIONSHIP_HEALTH_ALERT_VISIBILITY_COPY,
  RELATIONSHIP_HEALTH_ALERTS_SUBCOPY,
  RELATIONSHIP_HEALTH_ALERTS_TITLE,
  RELATIONSHIP_HEALTH_LABEL,
  SUPPORT_OPPORTUNITY_LABEL
} from "../../../constants/relationshipHealthAlerts";
import type { RelationshipHealthAlertEntry } from "../../../types/relationshipHealthAlerts";
import {
  acknowledgeHealthAlertById,
  planSupportForHealthAlert
} from "../../../utils/RelationshipHealthAlertsEngine";
import { HealthAlertBadge } from "./HealthAlertBadge";

type RelationshipHealthAlertCardProps = {
  alert: RelationshipHealthAlertEntry;
  onUpdated?: () => void;
};

export function RelationshipHealthAlertCard({ alert, onUpdated }: RelationshipHealthAlertCardProps) {
  const definition = getHealthAlertDefinition(alert.alertType);

  const handleAcknowledge = () => {
    acknowledgeHealthAlertById(alert.id);
    onUpdated?.();
  };

  const handlePlanSupport = () => {
    planSupportForHealthAlert(alert.id);
    onUpdated?.();
  };

  return (
    <section className="relationship-health-alert-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>{RELATIONSHIP_HEALTH_ALERTS_TITLE}</h3>
        <p>{RELATIONSHIP_HEALTH_ALERTS_SUBCOPY}</p>
      </header>

      <p className="relationship-health-alert-card__labels">
        {SUPPORT_OPPORTUNITY_LABEL} · {RELATIONSHIP_HEALTH_LABEL} · {JOURNEY_SUPPORT_LABEL}
      </p>

      <p className="relationship-health-alert-card__purpose">{RELATIONSHIP_HEALTH_ALERT_PURPOSE_COPY}</p>
      <p className="relationship-health-alert-card__visibility">
        {RELATIONSHIP_HEALTH_ALERT_VISIBILITY_COPY}
      </p>

      <div className="relationship-health-alert-card__headline">
        <HealthAlertBadge alertType={alert.alertType} severity={alert.severity} primary />
        <span className="relationship-health-alert-card__status">{alert.status}</span>
      </div>

      {alert.coupleLabel ? (
        <p className="relationship-health-alert-card__couple">{alert.coupleLabel}</p>
      ) : null}

      {definition ? <p className="relationship-health-alert-card__definition">{definition.description}</p> : null}

      {alert.supportNote ? (
        <p className="relationship-health-alert-card__note">{alert.supportNote}</p>
      ) : null}

      <div className="relationship-health-alert-card__meta">
        {alert.journeyId ? <span>Journey {alert.journeyId}</span> : null}
        {alert.createdBy ? <span> · {alert.createdBy}</span> : null}
        <time dateTime={alert.createdAt}> · {new Date(alert.createdAt).toLocaleString()}</time>
      </div>

      <div className="relationship-health-alert-card__actions">
        <button type="button" className="concierge-consultant-btn" onClick={handleAcknowledge}>
          Acknowledge
        </button>
        <button
          type="button"
          className="concierge-consultant-btn concierge-consultant-btn--primary"
          onClick={handlePlanSupport}
        >
          Plan Journey Support
        </button>
      </div>

      <div className="relationship-health-alert-card__future">
        <h4>Future ready</h4>
        <ul>
          {RELATIONSHIP_HEALTH_ALERT_FUTURE_ADVISORS.map((advisor) => (
            <li key={advisor.id}>
              <strong>{advisor.label}</strong>
              <span>{advisor.description}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="relationship-health-alert-card__reserved">{RELATIONSHIP_HEALTH_ALERT_RESERVED_COPY}</p>
    </section>
  );
}
