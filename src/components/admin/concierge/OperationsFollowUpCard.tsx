import {
  OPERATIONS_FOLLOW_UP_BUCKET_LABELS,
  OPERATIONS_FOLLOW_UP_BUCKETS
} from "../../../constants/operationsCenter";
import type { OperationsCenterBundle } from "../../../types/operationsCenter";

type OperationsFollowUpCardProps = {
  bundle: OperationsCenterBundle;
};

export function OperationsFollowUpCard({ bundle }: OperationsFollowUpCardProps) {
  return (
    <section className="operations-center-followups concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Relationship Follow-up</h3>
        <p>Relationship Follow-Up Engine™ and health escalations</p>
      </header>
      {OPERATIONS_FOLLOW_UP_BUCKETS.map((bucket) => {
        const rows = bundle.followUps[bucket];
        return (
          <div key={bucket} className="operations-center-panel__block">
            <h4>
              {OPERATIONS_FOLLOW_UP_BUCKET_LABELS[bucket]} <strong>{rows.length}</strong>
            </h4>
            {rows.length === 0 ? (
              <p className="concierge-consultant__empty">
                No {OPERATIONS_FOLLOW_UP_BUCKET_LABELS[bucket].toLowerCase()} follow-ups.
              </p>
            ) : null}
            <ul className="concierge-consultant-list">
              {rows.slice(0, 8).map((row) => (
                <li key={row.id} className="concierge-consultant-list__item">
                  <div>
                    <strong>{row.pairLabel}</strong>
                    <span>
                      {row.stage}
                      {row.healthLevel ? ` · ${row.healthLevel}` : ""}
                      {row.paused ? " · Paused" : ""}
                    </span>
                    {row.consultantName ? <span>{row.consultantName}</span> : null}
                  </div>
                  <time dateTime={row.updatedAt}>{new Date(row.updatedAt).toLocaleString()}</time>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
}
