import type { ConfigurationAuditRecord, ConfigurationSnapshotRecord } from "../../../types/configurationPlatform";

type AuditHistoryCardProps = {
  auditHistory: ConfigurationAuditRecord[];
  snapshots: ConfigurationSnapshotRecord[];
};

function formatValue(value: ConfigurationAuditRecord["currentValue"]): string {
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function AuditHistoryCard({ auditHistory, snapshots }: AuditHistoryCardProps) {
  return (
    <section className="config-card audit-history-card concierge-consultant-card--glass cc-reveal">
      <header className="config-card__head">
        <h3>Audit history</h3>
        <p>Changed by, previous value, current value, date, reason, and rollback availability.</p>
      </header>
      {auditHistory.length ? (
        <ul className="audit-history-card__list">
          {auditHistory.map((record) => (
            <li key={record.id}>
              <div className="audit-history-card__row">
                <strong>{record.label}</strong>
                <time dateTime={record.changedAt}>
                  {new Date(record.changedAt).toLocaleString()}
                </time>
              </div>
              <div className="audit-history-card__meta">
                <span>By {record.changedBy}</span>
                {record.reason ? <span>{record.reason}</span> : null}
                {record.rollbackAvailable ? (
                  <span className="audit-history-card__rollback">
                    Rollback v{record.rollbackVersion}
                  </span>
                ) : null}
              </div>
              <div className="audit-history-card__values">
                <code>{formatValue(record.previousValue)}</code>
                <span>→</span>
                <code>{formatValue(record.currentValue)}</code>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="config-card__empty">No configuration changes recorded yet.</p>
      )}
      {snapshots.length ? (
        <footer className="audit-history-card__snapshots">
          <h4>Rollback snapshots</h4>
          <ul>
            {snapshots.map((snapshot) => (
              <li key={snapshot.id}>
                {snapshot.label} — {snapshot.snapshotRef} ({snapshot.entryCount} entries)
              </li>
            ))}
          </ul>
        </footer>
      ) : null}
    </section>
  );
}
