import {
  OBSERVABILITY_QUEUE_LABELS,
  OBSERVABILITY_SERVICE_STATUS_LABELS
} from "../../../constants/productionObservability";
import type { ObservabilityQueueRecord } from "../../../types/productionObservability";
import { formatObservabilityCheckedAt } from "../../../utils/productionObservabilityLogic";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";

const STATUS_BADGE = {
  healthy: "healthy",
  warning: "warning",
  offline: "broken"
} as const;

type BackgroundWorkersCardProps = {
  queues: ObservabilityQueueRecord[];
};

export function BackgroundWorkersCard({ queues }: BackgroundWorkersCardProps) {
  return (
    <section className="observability-card concierge-consultant-card--glass cc-reveal">
      <header className="observability-card__head">
        <h3>Background Workers</h3>
        <p>Queue depth, processing rate, and failed job counts.</p>
      </header>
      <ul className="observability-card__table">
        {queues.map((queue) => (
          <li key={queue.id} className="observability-card__row">
            <div className="observability-card__row-main">
              <strong>{OBSERVABILITY_QUEUE_LABELS[queue.id]}</strong>
            </div>
            <InstitutionalStatusBadge
              status={STATUS_BADGE[queue.status]}
              label={OBSERVABILITY_SERVICE_STATUS_LABELS[queue.status]}
            />
            <span>{queue.depth} pending</span>
            <span>{queue.processingRate}/min</span>
            <span>{queue.failedCount} failed</span>
            <span className="observability-card__muted">
              Oldest {queue.oldestAgeMinutes}m · {formatObservabilityCheckedAt(queue.checkedAt)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function NotificationQueueCard({ queues }: BackgroundWorkersCardProps) {
  const notificationQueues = queues.filter((item) =>
    ["email", "whatsapp", "notification", "retry", "failed"].includes(item.id)
  );

  return (
    <section className="observability-card concierge-consultant-card--glass cc-reveal">
      <header className="observability-card__head">
        <h3>Notification Queue</h3>
        <p>Email, WhatsApp, and system notification delivery pipelines.</p>
      </header>
      <ul className="observability-card__table">
        {notificationQueues.map((queue) => (
          <li key={queue.id} className="observability-card__row">
            <div className="observability-card__row-main">
              <strong>{OBSERVABILITY_QUEUE_LABELS[queue.id]}</strong>
            </div>
            <InstitutionalStatusBadge
              status={STATUS_BADGE[queue.status]}
              label={OBSERVABILITY_SERVICE_STATUS_LABELS[queue.status]}
            />
            <span>{queue.depth} in queue</span>
            <span>{queue.failedCount} failed</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
