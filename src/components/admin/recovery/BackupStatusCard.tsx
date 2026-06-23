import {
  BACKUP_AREA_LABELS,
  BACKUP_STATUS_LABELS,
  type BackupAreaId
} from "../../../constants/recoveryCenter";
import type { BackupStatusRecord } from "../../../types/recoveryCenter";
import { isBackupStale } from "../../../utils/recoveryCenterLogic";

type BackupStatusCardProps = {
  backup: BackupStatusRecord;
  hint: string;
  active?: boolean;
  onSelect?: () => void;
};

export function BackupStatusCard({ backup, hint, active, onSelect }: BackupStatusCardProps) {
  const stale = isBackupStale(backup);
  const className = [
    "backup-status-card",
    "concierge-consultant-card--glass",
    onSelect ? "backup-status-card--button" : "",
    active ? "is-active" : "",
    backup.status === "failed" ? "backup-status-card--failed" : "",
    backup.status === "warning" || stale ? "backup-status-card--warning" : ""
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <header className="backup-status-card__head">
        <span className="backup-status-card__eyebrow">{BACKUP_AREA_LABELS[backup.areaId]}</span>
        <span className={`backup-status-card__status backup-status-card__status--${backup.status}`}>
          {BACKUP_STATUS_LABELS[backup.status]}
        </span>
      </header>
      <p>{hint}</p>
      <dl className="backup-status-card__grid">
        <div>
          <dt>Last backup</dt>
          <dd>{new Date(backup.lastBackupAt).toLocaleString()}</dd>
        </div>
        <div>
          <dt>Frequency</dt>
          <dd>{backup.frequencyLabel}</dd>
        </div>
        <div>
          <dt>Retention</dt>
          <dd>{backup.retentionDays} days</dd>
        </div>
        <div>
          <dt>Size</dt>
          <dd>{backup.sizeLabel}</dd>
        </div>
      </dl>
      {backup.verifiedAt ? (
        <p className="backup-status-card__verified">
          Verified {new Date(backup.verifiedAt).toLocaleString()}
        </p>
      ) : (
        <p className="backup-status-card__verified backup-status-card__verified--missing">
          Verification pending
        </p>
      )}
    </>
  );

  if (onSelect) {
    return (
      <button type="button" className={className} onClick={onSelect}>
        {content}
      </button>
    );
  }

  return <article className={className}>{content}</article>;
}

export type { BackupAreaId };
