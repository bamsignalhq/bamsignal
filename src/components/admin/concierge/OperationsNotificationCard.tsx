import type { OperationsCenterBundle, OperationsCenterNotificationRow } from "../../../types/operationsCenter";

type OperationsNotificationCardProps = {
  bundle: OperationsCenterBundle;
  onRetry: (row: OperationsCenterNotificationRow) => void;
};

function NotificationList({
  title,
  rows,
  emptyLabel,
  onRetry
}: {
  title: string;
  rows: OperationsCenterNotificationRow[];
  emptyLabel: string;
  onRetry?: (row: OperationsCenterNotificationRow) => void;
}) {
  return (
    <div className="operations-center-panel__block">
      <h4>{title}</h4>
      {rows.length === 0 ? <p className="concierge-consultant__empty">{emptyLabel}</p> : null}
      <ul className="concierge-consultant-list">
        {rows.slice(0, 12).map((row) => (
          <li key={row.id} className="concierge-consultant-list__item">
            <div>
              <strong>{row.memberName}</strong>
              <span>
                {row.channel === "email" ? "Email Engine™" : "WhatsApp Engine™"} · {row.templateLabel}
              </span>
              <span>{row.preview}</span>
              <span>Status: {row.status}</span>
            </div>
            <div className="operations-center-notification__actions">
              <time dateTime={row.updatedAt}>{new Date(row.updatedAt).toLocaleString()}</time>
              {onRetry && row.status === "failed" ? (
                <button type="button" className="concierge-consultant-btn" onClick={() => onRetry(row)}>
                  Retry
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function OperationsNotificationCard({ bundle, onRetry }: OperationsNotificationCardProps) {
  const { notifications } = bundle;

  return (
    <section className="operations-center-notifications concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Notifications</h3>
        <p>Email Engine™ and WhatsApp Engine™ delivery queues</p>
      </header>

      <NotificationList
        title="Email Queue"
        rows={notifications.emailQueue}
        emptyLabel="Email queue is clear."
      />
      <NotificationList
        title="WhatsApp Queue"
        rows={notifications.whatsappQueue}
        emptyLabel="WhatsApp queue is clear."
      />
      <NotificationList
        title="Failed Deliveries"
        rows={notifications.failedDeliveries}
        emptyLabel="No failed deliveries."
        onRetry={onRetry}
      />
    </section>
  );
}
