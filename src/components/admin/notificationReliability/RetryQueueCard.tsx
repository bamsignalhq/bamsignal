import type { ReliabilityNotificationRecord } from "../../../types/notificationReliability";
import { NotificationCard } from "./NotificationCard";

type RetryQueueCardProps = {
  records: ReliabilityNotificationRecord[];
  onRetry: (recordId: string) => void;
  retryingId: string | null;
};

export function RetryQueueCard({ records, onRetry, retryingId }: RetryQueueCardProps) {
  return (
    <section className="retry-queue-card concierge-consultant-card--glass cc-reveal">
      <header className="retry-queue-card__head">
        <h3>Retry queue</h3>
        <p>Failed and retried notifications eligible for manual retry.</p>
      </header>
      {records.length ? (
        <div className="retry-queue-card__list">
          {records.map((record) => (
            <div key={record.id} className="retry-queue-card__row">
              <NotificationCard record={record} />
              <button
                type="button"
                className="concierge-consultant-btn"
                disabled={retryingId === record.id}
                onClick={() => onRetry(record.id)}
              >
                {retryingId === record.id ? "Retrying…" : "Retry"}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="retry-queue-card__empty">Retry queue is clear.</p>
      )}
    </section>
  );
}
