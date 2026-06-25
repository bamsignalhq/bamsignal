import { CONTINUITY_HEALTH_STATUS_LABELS, BACKUP_AREA_LABELS } from "../../../constants/businessContinuity";
import type { BackupJobRecord } from "../../../types/businessContinuity";
import { assessBackupHealth, formatDurationSeconds } from "../../../utils/businessContinuityLogic";

type BackupStatusCardProps = {
  backupJobs: BackupJobRecord[];
};

export function BackupStatusCard({ backupJobs }: BackupStatusCardProps) {
  const assessment = assessBackupHealth(backupJobs);
  const latest = assessment.latest;

  return (
    <section className="continuity-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Backup center</h3>
        <p>Monitor externally managed backups — health, duration, verification, and restore points.</p>
      </header>
      <div className="continuity-backup-summary">
        <article className={`continuity-metric continuity-metric--${assessment.health}`}>
          <span className="continuity-metric__label">Backup health</span>
          <strong className="continuity-metric__value">
            {CONTINUITY_HEALTH_STATUS_LABELS[assessment.health]}
          </strong>
          <span className="continuity-metric__hint">
            {assessment.verifiedCount}/{assessment.total} areas verified
          </span>
        </article>
        {latest ? (
          <>
            <article className="continuity-metric">
              <span className="continuity-metric__label">Latest backup</span>
              <strong className="continuity-metric__value">{latest.jobRef}</strong>
              <span className="continuity-metric__hint">{BACKUP_AREA_LABELS[latest.areaId]}</span>
            </article>
            <article className="continuity-metric">
              <span className="continuity-metric__label">Duration</span>
              <strong className="continuity-metric__value">
                {formatDurationSeconds(latest.durationSeconds)}
              </strong>
            </article>
            <article className="continuity-metric">
              <span className="continuity-metric__label">Restore point</span>
              <strong className="continuity-metric__value">
                {latest.restorePoint ? new Date(latest.restorePoint).toLocaleString() : "—"}
              </strong>
              <span className="continuity-metric__hint">{latest.frequency}</span>
            </article>
            <article className="continuity-metric">
              <span className="continuity-metric__label">Verification</span>
              <strong className="continuity-metric__value">{latest.verified ? "Passed" : "Pending"}</strong>
            </article>
          </>
        ) : null}
      </div>
    </section>
  );
}
