import {
  BACKUP_CATEGORY_LABELS,
  RESTORE_STATUS_LABELS
} from "../../../constants/recoveryCenter";
import type { RestoreHistoryRecord } from "../../../types/recoveryCenter";

type RestoreHistoryCardProps = {
  history: RestoreHistoryRecord[];
};

const MODE_LABELS: Record<RestoreHistoryRecord["modeId"], string> = {
  "point-in-time-restore": "Point-in-Time",
  "full-restore": "Full Restore",
  "partial-restore": "Partial Restore",
  verification: "Verification",
  "recovery-checklist": "Checklist"
};

export function RestoreHistoryCard({ history }: RestoreHistoryCardProps) {
  return (
    <section className="recovery-card restore-history-card concierge-consultant-card--glass cc-reveal">
      <header className="recovery-card__head">
        <h3>Restore history</h3>
        <p>Completed and in-progress restores with verification status.</p>
      </header>
      {history.length ? (
        <ul className="recovery-card__list">
          {history.map((entry) => (
            <li key={entry.id}>
              <div className="recovery-card__row">
                <strong>{entry.restoreRef}</strong>
                <span className={`restore-history-card__status restore-history-card__status--${entry.status}`}>
                  {RESTORE_STATUS_LABELS[entry.status]}
                </span>
              </div>
              <p>
                {MODE_LABELS[entry.modeId]} · {BACKUP_CATEGORY_LABELS[entry.categoryId]}
              </p>
              <div className="recovery-card__meta">
                <span>{entry.initiatedBy}</span>
                <span>Started {new Date(entry.startedAt).toLocaleDateString()}</span>
                {entry.verifiedAt ? (
                  <span>Verified {new Date(entry.verifiedAt).toLocaleDateString()}</span>
                ) : null}
              </div>
              {entry.notes ? <p className="restore-history-card__notes">{entry.notes}</p> : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="recovery-card__empty">No restore history on record.</p>
      )}
    </section>
  );
}
