import { AUDIT_ENTITY_LABELS } from "../../../constants/auditCenter";
import type { AuditEventRecord } from "../../../types/auditCenter";

type AuditEventCardProps = {
  event: AuditEventRecord;
  selected?: boolean;
  onSelect?: () => void;
};

export function AuditEventCard({ event, selected = false, onSelect }: AuditEventCardProps) {
  const content = (
    <>
      <div className="audit-event-card__head">
        <p className="audit-event-card__action">{event.action}</p>
        <span className={`audit-event-card__result audit-event-card__result--${event.result}`}>
          {event.result}
        </span>
      </div>
      <h3>{event.detail}</h3>
      <dl className="audit-event-card__grid">
        <div>
          <dt>Actor</dt>
          <dd>{event.actor}</dd>
        </div>
        <div>
          <dt>Role</dt>
          <dd>{event.role}</dd>
        </div>
        <div>
          <dt>Entity</dt>
          <dd>{AUDIT_ENTITY_LABELS[event.entity]}</dd>
        </div>
        <div>
          <dt>Timestamp</dt>
          <dd>{new Date(event.timestamp).toLocaleString()}</dd>
        </div>
        <div>
          <dt>IP</dt>
          <dd>{event.ipPlaceholder}</dd>
        </div>
        <div>
          <dt>Ref</dt>
          <dd>{event.entityRef}</dd>
        </div>
      </dl>
      {event.journeyId ? <p className="audit-event-card__meta">Journey: {event.journeyId}</p> : null}
    </>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        className={`audit-event-card audit-event-card--button${selected ? " is-selected" : ""}`}
        onClick={onSelect}
      >
        {content}
      </button>
    );
  }

  return <article className="audit-event-card">{content}</article>;
}
