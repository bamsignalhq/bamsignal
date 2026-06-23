import { useCallback, useMemo, useState } from "react";
import {
  NOTIFICATION_QUEUE_LABELS,
  NOTIFICATION_QUEUES,
  NOTIFICATION_RELIABILITY_FUTURE_CAPABILITIES,
  type NotificationQueueId
} from "../../../constants/notificationReliability";
import {
  NOTIFICATION_RELIABILITY_ADMIN_BRAND,
  NOTIFICATION_RELIABILITY_ADMIN_PATH
} from "../../../constants/notificationReliabilityAdmin";
import {
  buildNotificationReliabilityBundle,
  retryReliabilityNotification
} from "../../../utils/notificationReliabilityEngine";
import { filterReliabilityByQueue } from "../../../utils/notificationReliabilityLogic";
import { FailedDeliveryCard } from "./FailedDeliveryCard";
import { NotificationCard } from "./NotificationCard";
import { NotificationMetricsCard } from "./NotificationMetricsCard";
import { RetryQueueCard } from "./RetryQueueCard";

export function NotificationQueuePage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [queueFilter, setQueueFilter] = useState<NotificationQueueId | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const bundle = useMemo(() => {
    void refreshKey;
    return buildNotificationReliabilityBundle();
  }, [refreshKey]);

  const filteredQueue = useMemo(
    () => filterReliabilityByQueue(bundle.queue, queueFilter),
    [bundle.queue, queueFilter]
  );

  const selectedRecord =
    bundle.all.find((record) => record.id === selectedId) ?? bundle.all[0] ?? null;

  const handleRetry = useCallback(async (recordId: string) => {
    setRetryingId(recordId);
    try {
      retryReliabilityNotification(recordId);
      setRefreshKey((value) => value + 1);
    } finally {
      setRetryingId(null);
    }
  }, []);

  return (
    <div className="notification-reliability-page">
      <header className="notification-reliability-page__head">
        <div>
          <h2>{NOTIFICATION_RELIABILITY_ADMIN_BRAND}</h2>
          <p>
            Visibility into all outbound communications — email, WhatsApp, and system notification
            queues with delivery status and retry controls.
          </p>
        </div>
        <button
          type="button"
          className="concierge-consultant-btn"
          onClick={() => setRefreshKey((value) => value + 1)}
        >
          Refresh
        </button>
      </header>

      <NotificationMetricsCard metrics={bundle.metrics} />

      <div className="notification-reliability-page__filters">
        <label>
          Queue
          <select
            value={queueFilter}
            onChange={(event) =>
              setQueueFilter(event.target.value as NotificationQueueId | "all")
            }
          >
            <option value="all">All queues</option>
            {NOTIFICATION_QUEUES.map((queue) => (
              <option key={queue.id} value={queue.id}>
                {queue.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="notification-reliability-page__queues">
        <section className="notification-queue-panel concierge-consultant-card--glass cc-reveal">
          <header>
            <h3>Active queue</h3>
            <p>
              {queueFilter === "all"
                ? "All outbound queues"
                : NOTIFICATION_QUEUE_LABELS[queueFilter]}
            </p>
          </header>
          {filteredQueue.length ? (
            <div className="notification-queue-panel__list">
              {filteredQueue.map((record) => (
                <NotificationCard
                  key={record.id}
                  record={record}
                  selected={selectedId === record.id}
                  onSelect={() => setSelectedId(record.id)}
                />
              ))}
            </div>
          ) : (
            <p className="notification-queue-panel__empty">No queued or in-flight notifications.</p>
          )}
        </section>

        {selectedRecord ? (
          <section className="notification-reliability-page__detail concierge-consultant-card--glass cc-reveal">
            <header>
              <h3>Notification detail</h3>
            </header>
            <NotificationCard record={selectedRecord} />
            {selectedRecord.detail ? <p>{selectedRecord.detail}</p> : null}
          </section>
        ) : null}
      </div>

      <div className="notification-reliability-page__body">
        <FailedDeliveryCard
          records={bundle.failed}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <RetryQueueCard
          records={bundle.retryQueue}
          onRetry={(recordId) => void handleRetry(recordId)}
          retryingId={retryingId}
        />
      </div>

      <section className="notification-reliability-page__future concierge-consultant-card--glass cc-reveal">
        <header>
          <h3>Future ready</h3>
          <p>Documented outbound channels planned for institutional reliability monitoring.</p>
        </header>
        <ul>
          {NOTIFICATION_RELIABILITY_FUTURE_CAPABILITIES.map((item) => (
            <li key={item.id}>
              <strong>{item.label}</strong> — {item.description}
            </li>
          ))}
        </ul>
      </section>

      <footer className="notification-reliability-page__foot">
        <p>Admin path: {NOTIFICATION_RELIABILITY_ADMIN_PATH}</p>
        <p>Generated: {new Date(bundle.generatedAt).toLocaleString()}</p>
      </footer>
    </div>
  );
}
