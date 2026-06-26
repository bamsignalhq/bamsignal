import { DISASTER_BACKUP_STATUS_LABELS } from "../../../constants/disasterRecovery";
import type { DisasterBackupMonitorRecord } from "../../../types/disasterRecovery";

type DisasterBackupMonitorsCardProps = {
  monitors: DisasterBackupMonitorRecord[];
  onRunBackup: (monitorId: DisasterBackupMonitorRecord["id"]) => void;
  busyId: string | null;
};

export function DisasterBackupMonitorsCard({
  monitors,
  onRunBackup,
  busyId
}: DisasterBackupMonitorsCardProps) {
  return (
    <section className="disaster-monitors-card concierge-consultant-card--glass cc-reveal">
      <header>
        <h3>Monitor</h3>
        <p>
          Database, storage, configuration, feature flags, remote config, and release snapshots.
        </p>
      </header>
      <div className="disaster-monitors-card__list">
        {monitors.map((monitor) => (
          <article key={monitor.id} className={`disaster-monitor-row disaster-monitor-row--${monitor.status}`}>
            <div className="disaster-monitor-row__head">
              <strong>{monitor.label}</strong>
              <span className={`disaster-status-badge disaster-status-badge--${monitor.status}`}>
                {DISASTER_BACKUP_STATUS_LABELS[monitor.status]}
              </span>
            </div>
            <dl className="disaster-monitor-row__meta">
              <div>
                <dt>Last backup</dt>
                <dd>{new Date(monitor.lastBackupAt).toLocaleString()}</dd>
              </div>
              <div>
                <dt>Snapshot</dt>
                <dd>{monitor.snapshotRef}</dd>
              </div>
              <div>
                <dt>Size</dt>
                <dd>{monitor.sizeLabel}</dd>
              </div>
              <div>
                <dt>Frequency</dt>
                <dd>{monitor.frequencyLabel}</dd>
              </div>
            </dl>
            <button
              type="button"
              className="concierge-consultant-btn"
              disabled={busyId === monitor.id}
              onClick={() => onRunBackup(monitor.id)}
            >
              {busyId === monitor.id ? "Running…" : "Run backup"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
