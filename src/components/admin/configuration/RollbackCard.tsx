import type { ConfigurationSnapshotRecord } from "../../../types/configurationPlatform";

type RollbackCardProps = {
  snapshots: ConfigurationSnapshotRecord[];
};

export function RollbackCard({ snapshots }: RollbackCardProps) {
  const sorted = [...snapshots].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );

  return (
    <section className="config-card rollback-card concierge-consultant-card--glass cc-reveal">
      <header className="config-card__head">
        <h3>Rollback snapshots</h3>
        <p>Point-in-time configuration snapshots for institutional rollback.</p>
      </header>
      {sorted.length ? (
        <ul className="rollback-card__list">
          {sorted.map((snapshot) => (
            <li key={snapshot.id}>
              <div className="rollback-card__row">
                <strong>{snapshot.label}</strong>
                <span>{snapshot.snapshotRef}</span>
              </div>
              <p>
                {snapshot.entryCount} entries · {snapshot.flagCount} flags
              </p>
              <span className="rollback-card__meta">
                {snapshot.createdBy} · {new Date(snapshot.createdAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="config-card__empty">No rollback snapshots available.</p>
      )}
    </section>
  );
}
