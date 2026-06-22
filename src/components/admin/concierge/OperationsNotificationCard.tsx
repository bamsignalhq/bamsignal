import { useMemo, useState } from "react";
import {
  NOTIFICATION_OPS_CHANNELS,
  NOTIFICATION_OPS_FILTER_ALL,
  NOTIFICATION_OPS_STATUSES,
  NOTIFICATION_OPS_STATUS_LABELS,
  NOTIFICATION_OPERATIONS_CENTER_BRAND
} from "../../../constants/notificationOperations";
import type { NotificationOperationsBundle } from "../../../types/notificationOperations";
import type { NotificationOpsRecord, NotificationOpsStatus } from "../../../types/notificationOperations";
import { filterNotificationOpsRecords } from "../../../utils/notificationOperationsLogic";
import { DeliveryMetricsCard } from "./DeliveryMetricsCard";
import { NotificationHistoryCard } from "./NotificationHistoryCard";
import { NotificationQueueCard } from "./NotificationQueueCard";
import { NotificationRetryCard } from "./NotificationRetryCard";

type OperationsNotificationCardProps = {
  bundle: { notifications: NotificationOperationsBundle };
  onRetry: (row: NotificationOpsRecord) => void;
};

export function OperationsNotificationCard({ bundle, onRetry }: OperationsNotificationCardProps) {
  const { notifications } = bundle;
  const [statusFilter, setStatusFilter] = useState<NotificationOpsStatus | typeof NOTIFICATION_OPS_FILTER_ALL>(
    NOTIFICATION_OPS_FILTER_ALL
  );
  const [journeyQuery, setJourneyQuery] = useState("");
  const [selected, setSelected] = useState<NotificationOpsRecord | null>(null);

  const filteredHistory = useMemo(
    () =>
      filterNotificationOpsRecords(notifications.history, {
        status: statusFilter,
        journeyQuery
      }),
    [notifications.history, statusFilter, journeyQuery]
  );

  const filteredQueue = useMemo(
    () =>
      filterNotificationOpsRecords(notifications.queue, {
        status: statusFilter,
        journeyQuery
      }),
    [notifications.queue, statusFilter, journeyQuery]
  );

  const filteredFailed = useMemo(
    () =>
      filterNotificationOpsRecords(notifications.failed, {
        status: statusFilter,
        journeyQuery
      }),
    [notifications.failed, statusFilter, journeyQuery]
  );

  return (
    <div className="notification-operations-center">
      <header className="notification-operations-center__head cc-reveal">
        <h2>{NOTIFICATION_OPERATIONS_CENTER_BRAND}</h2>
        <p>Delivery visibility across Email Engine™, WhatsApp Engine™, and system journey alerts.</p>
      </header>

      <DeliveryMetricsCard metrics={notifications.metrics} />

      <section className="notification-operations-center__filters concierge-consultant-card--glass cc-reveal">
        <label>
          <span>Filter status</span>
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as NotificationOpsStatus | typeof NOTIFICATION_OPS_FILTER_ALL)
            }
          >
            <option value={NOTIFICATION_OPS_FILTER_ALL}>All statuses</option>
            {NOTIFICATION_OPS_STATUSES.map((status) => (
              <option key={status} value={status}>
                {NOTIFICATION_OPS_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Search Journey ID</span>
          <input
            type="search"
            value={journeyQuery}
            onChange={(event) => setJourneyQuery(event.target.value)}
            placeholder="BS-JRN-…"
          />
        </label>
      </section>

      <div className="notification-operations-center__grid">
        <NotificationQueueCard
          records={filteredQueue}
          selectedId={selected?.id}
          onSelect={setSelected}
        />
        <NotificationRetryCard records={filteredFailed} onRetry={onRetry} />
      </div>

      {selected ? (
        <section className="notification-operations-center__detail concierge-consultant-card--glass cc-reveal">
          <header className="concierge-consultant-card__head">
            <h3>Delivery details</h3>
            <p>
              {NOTIFICATION_OPS_CHANNELS.find((channel) => channel.id === selected.channel)?.label} ·{" "}
              {selected.templateLabel}
            </p>
          </header>
          <dl className="notification-operations-center__detail-grid">
            <div>
              <dt>Member</dt>
              <dd>{selected.memberName}</dd>
            </div>
            <div>
              <dt>Journey ID</dt>
              <dd>{selected.journeyId ?? "—"}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{NOTIFICATION_OPS_STATUS_LABELS[selected.status]}</dd>
            </div>
            <div>
              <dt>Retries</dt>
              <dd>{selected.retryCount}</dd>
            </div>
          </dl>
          {selected.subject ? <p className="notification-operations-center__subject">{selected.subject}</p> : null}
          <p className="notification-operations-center__preview">{selected.preview}</p>
          {selected.detail ? (
            <p className="notification-operations-center__detail-note">{selected.detail}</p>
          ) : null}
        </section>
      ) : null}

      <NotificationHistoryCard operationsHistory={filteredHistory} />
    </div>
  );
}
