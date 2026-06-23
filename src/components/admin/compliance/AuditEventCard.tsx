import {
  INSTITUTIONAL_AUDIT_TARGET_LABELS,
  INSTITUTIONAL_AUDIT_SEVERITY_LABELS,
  INSTITUTIONAL_AUDIT_ACTION_LABELS
} from "../../../constants/institutionalAuditCompliance";
import type { AuditEvent } from "../../../types/auditEngine";

type AuditEventCardProps = {
  event: AuditEvent;
  selected?: boolean;
  onSelect?: () => void;
};

export function AuditEventCard({ event, selected = false, onSelect }: AuditEventCardProps) {
  const actionLabel = INSTITUTIONAL_AUDIT_ACTION_LABELS[event.action];
  const content = (
    <>
      <div className="institutional-audit-event-card__head">
        <p className="institutional-audit-event-card__action">{actionLabel}</p>
        <span
          className={`institutional-audit-event-card__severity institutional-audit-event-card__severity--${event.severity}`}
        >
          {INSTITUTIONAL_AUDIT_SEVERITY_LABELS[event.severity]}
        </span>
        <span
          className={`institutional-audit-event-card__result institutional-audit-event-card__result--${event.result}`}
        >
          {event.result}
        </span>
      </div>
      <h3>{event.summary}</h3>
      <dl className="institutional-audit-event-card__grid">
        <div>
          <dt>Actor</dt>
          <dd>{event.actor.name}</dd>
        </div>
        <div>
          <dt>Target</dt>
          <dd>{event.target.label}</dd>
        </div>
        <div>
          <dt>Target kind</dt>
          <dd>{INSTITUTIONAL_AUDIT_TARGET_LABELS[event.target.kind]}</dd>
        </div>
        <div>
          <dt>Timestamp</dt>
          <dd>{new Date(event.timestamp).toLocaleString()}</dd>
        </div>
      </dl>
      {event.journeyId ? (
        <p className="institutional-audit-event-card__meta">Journey: {event.journeyId}</p>
      ) : null}
    </>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        className={`institutional-audit-event-card institutional-audit-event-card--button${
          selected ? " is-selected" : ""
        }`}
        onClick={onSelect}
      >
        {content}
      </button>
    );
  }

  return <article className="institutional-audit-event-card">{content}</article>;
}
