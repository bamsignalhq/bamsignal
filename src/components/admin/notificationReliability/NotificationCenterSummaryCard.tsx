import type { NotificationCenterSummary } from "../../../types/notificationReliability";

type NotificationCenterSummaryCardProps = {
  summary: NotificationCenterSummary;
};

export function NotificationCenterSummaryCard({ summary }: NotificationCenterSummaryCardProps) {
  return (
    <section className="notification-center-summary concierge-consultant-card--glass cc-reveal">
      <header className="notification-center-summary__head">
        <div>
          <h3>Outbound dashboard</h3>
          <p>Single source of truth for every outbound communication across all channels.</p>
        </div>
        <p className="notification-center-summary__checked">
          Last checked {new Date(summary.lastCheckedAt).toLocaleString()}
        </p>
      </header>
      <div className="notification-center-summary__grid">
        <div className="notification-center-summary__stat">
          <strong>{summary.sentToday}</strong>
          <span>Sent Today</span>
        </div>
        <div className="notification-center-summary__stat">
          <strong>{summary.pending}</strong>
          <span>Pending</span>
        </div>
        <div className="notification-center-summary__stat">
          <strong>{summary.queued}</strong>
          <span>Queued</span>
        </div>
        <div className="notification-center-summary__stat notification-center-summary__stat--alert">
          <strong>{summary.failed}</strong>
          <span>Failed</span>
        </div>
        <div className="notification-center-summary__stat">
          <strong>{summary.retryQueue}</strong>
          <span>Retry Queue</span>
        </div>
        <div className="notification-center-summary__stat notification-center-summary__stat--rate">
          <strong>{summary.deliveryRate}%</strong>
          <span>Delivery Rate</span>
        </div>
        <div className="notification-center-summary__stat notification-center-summary__stat--rate">
          <strong>{summary.openRate}%</strong>
          <span>Open Rate</span>
        </div>
        <div className="notification-center-summary__stat notification-center-summary__stat--rate">
          <strong>{summary.clickRate}%</strong>
          <span>Click Rate</span>
        </div>
      </div>
    </section>
  );
}
