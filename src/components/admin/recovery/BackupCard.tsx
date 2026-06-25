import { BACKUP_CATEGORY_LABELS, BACKUP_STATUS_LABELS } from "../../../constants/recoveryCenter";
import type { BackupRecord } from "../../../types/recoveryCenter";

type BackupCardProps = {
  backups: BackupRecord[];
};

export function BackupCard({ backups }: BackupCardProps) {
  return (
    <section className="recovery-card backup-card concierge-consultant-card--glass cc-reveal">
      <header className="recovery-card__head">
        <h3>Backups</h3>
        <p>Database, storage, documents, configurations, audit logs, and secrets inventory.</p>
      </header>
      {backups.length ? (
        <ul className="recovery-card__list">
          {backups.map((backup) => (
            <li key={backup.id}>
              <div className="recovery-card__row">
                <strong>{BACKUP_CATEGORY_LABELS[backup.categoryId]}</strong>
                <span className={`backup-card__status backup-card__status--${backup.status}`}>
                  {BACKUP_STATUS_LABELS[backup.status]}
                </span>
              </div>
              <p>{backup.backupRef}</p>
              <div className="recovery-card__meta">
                <span>{backup.frequencyLabel}</span>
                <span>{backup.sizeLabel}</span>
                <span>Retain {backup.retentionDays}d</span>
                <span>Last {new Date(backup.lastBackupAt).toLocaleDateString()}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="recovery-card__empty">No backup records on file.</p>
      )}
    </section>
  );
}
