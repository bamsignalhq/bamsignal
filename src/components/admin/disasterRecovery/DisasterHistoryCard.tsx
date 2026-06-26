import { DISASTER_BACKUP_MONITOR_LABELS } from "../../../constants/disasterRecovery";
import type {
  DisasterRecoveryOperationRecord,
  DisasterSnapshotComparison
} from "../../../types/disasterRecovery";

type DisasterHistoryCardProps = {
  operations: DisasterRecoveryOperationRecord[];
  comparisons: DisasterSnapshotComparison[];
};

export function DisasterHistoryCard({ operations, comparisons }: DisasterHistoryCardProps) {
  return (
    <section className="disaster-history-card concierge-consultant-card--glass cc-reveal">
      <header>
        <h3>Recovery history</h3>
        <p>Recent operations and snapshot comparisons.</p>
      </header>
      {operations.length ? (
        <ul className="disaster-history-card__ops">
          {operations.map((op) => (
            <li key={op.id}>
              <strong>{op.label}</strong> — {op.target}
              <span>
                {op.status} · {new Date(op.initiatedAt).toLocaleString()}
                {op.detail ? ` · ${op.detail}` : ""}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="disaster-history-card__empty">No operations recorded yet.</p>
      )}
      {comparisons.length ? (
        <div className="disaster-history-card__comparisons">
          <h4>Snapshot comparisons</h4>
          <ul>
            {comparisons.map((item) => (
              <li key={item.id}>
                <strong>{DISASTER_BACKUP_MONITOR_LABELS[item.monitorId]}</strong> — {item.leftRef} vs{" "}
                {item.rightRef}
                <span>
                  {item.diffCount} diff{item.diffCount === 1 ? "" : "s"} · {item.summary}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
