import { SECURITY_OPS_HEALTH_LABELS } from "../../../constants/securityOperationsCenter";
import type { SecurityOpsEvent } from "../../../types/securityOperationsCenter";

type SecurityOpsEventsCardProps = {
  events: SecurityOpsEvent[];
  title?: string;
};

export function SecurityOpsEventsCard({
  events,
  title = "Security events"
}: SecurityOpsEventsCardProps) {
  const sorted = [...events].sort(
    (left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime()
  );

  return (
    <section className="security-ops-card security-ops-events-card concierge-consultant-card--glass cc-reveal">
      <header className="security-ops-card__head">
        <h3>{title}</h3>
        <p>Platform security signals — authentication, abuse, sessions, and admin activity.</p>
      </header>
      {sorted.length ? (
        <ul className="security-ops-card__list">
          {sorted.map((event) => (
            <li key={event.id}>
              <div className="security-ops-card__row">
                <strong>{event.title}</strong>
                <span className={`security-ops-severity security-ops-severity--${event.severity}`}>
                  {SECURITY_OPS_HEALTH_LABELS[event.severity]}
                </span>
              </div>
              <p>{event.detail}</p>
              <div className="security-ops-card__meta">
                <span>{event.eventRef}</span>
                <span>{event.actor}</span>
                <span>{event.target}</span>
                <span>{new Date(event.occurredAt).toLocaleString()}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="security-ops-card__empty">No security events in this module.</p>
      )}
    </section>
  );
}
