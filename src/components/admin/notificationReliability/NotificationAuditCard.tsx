import { DELIVERY_STATUS_LABELS, NOTIFICATION_CHANNEL_LABELS } from "../../../constants/notificationReliability";
import type { NotificationAuditRecord } from "../../../types/notificationReliability";

type NotificationAuditCardProps = {
  audit: NotificationAuditRecord[];
};

export function NotificationAuditCard({ audit }: NotificationAuditCardProps) {
  return (
    <section className="notification-audit-card concierge-consultant-card--glass cc-reveal">
      <header>
        <h3>Audit trail</h3>
        <p>Who triggered, when, template, channel, recipient, duration, and provider response.</p>
      </header>
      {audit.length ? (
        <div className="notification-audit-card__table-wrap">
          <table className="notification-audit-card__table">
            <thead>
              <tr>
                <th>Triggered by</th>
                <th>When</th>
                <th>Template</th>
                <th>Channel</th>
                <th>Recipient</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Provider response</th>
              </tr>
            </thead>
            <tbody>
              {audit.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.triggeredBy}</td>
                  <td>{new Date(entry.triggeredAt).toLocaleString()}</td>
                  <td>{entry.templateLabel}</td>
                  <td>{NOTIFICATION_CHANNEL_LABELS[entry.channel]}</td>
                  <td>{entry.recipient}</td>
                  <td>{entry.durationMs} ms</td>
                  <td>
                    <span className={`delivery-status-badge delivery-status-badge--${entry.status}`}>
                      {DELIVERY_STATUS_LABELS[entry.status]}
                    </span>
                  </td>
                  <td className="notification-audit-card__provider">{entry.providerResponse}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="notification-audit-card__empty">No audit entries recorded yet.</p>
      )}
    </section>
  );
}
