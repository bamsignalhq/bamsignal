import { RESTORE_STATUS_LABELS } from "../../../constants/recoveryCenter";
import type { RecoveryOperationRecord } from "../../../types/recoveryCenter";

type RecoveryCardProps = {
  operations: RecoveryOperationRecord[];
};

const MODE_LABELS: Record<RecoveryOperationRecord["modeId"], string> = {
  "point-in-time-restore": "Point-in-Time Restore",
  "full-restore": "Full Restore",
  "partial-restore": "Partial Restore",
  verification: "Verification",
  "recovery-checklist": "Recovery Checklist"
};

export function RecoveryCard({ operations }: RecoveryCardProps) {
  const sorted = [...operations].sort(
    (left, right) => new Date(right.initiatedAt).getTime() - new Date(left.initiatedAt).getTime()
  );

  return (
    <section className="recovery-card recovery-ops-card concierge-consultant-card--glass cc-reveal">
      <header className="recovery-card__head">
        <h3>Recovery operations</h3>
        <p>Point-in-time, full, partial restore, verification, and recovery checklist.</p>
      </header>
      {sorted.length ? (
        <ul className="recovery-card__list">
          {sorted.map((operation) => (
            <li key={operation.id}>
              <div className="recovery-card__row">
                <strong>{operation.operationRef}</strong>
                <span className={`recovery-ops-card__status recovery-ops-card__status--${operation.status}`}>
                  {RESTORE_STATUS_LABELS[operation.status]}
                </span>
              </div>
              <p>{MODE_LABELS[operation.modeId]}</p>
              <p>{operation.target}</p>
              <div className="recovery-card__meta">
                <span>{operation.initiatedBy}</span>
                {operation.checklistComplete ? <span>Checklist complete</span> : <span>Checklist pending</span>}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="recovery-card__empty">No recovery operations on record.</p>
      )}
    </section>
  );
}
