import type { NotificationDeliveryMetrics } from "../../../types/notificationOperations";
import { NOTIFICATION_OPERATIONS_CENTER_BRAND } from "../../../constants/notificationOperations";

type DeliveryMetricsCardProps = {
  metrics: NotificationDeliveryMetrics;
};

export function DeliveryMetricsCard({ metrics }: DeliveryMetricsCardProps) {
  return (
    <section className="delivery-metrics-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Delivery metrics</h3>
        <p>{NOTIFICATION_OPERATIONS_CENTER_BRAND}</p>
      </header>
      <dl className="delivery-metrics-card__grid">
        <div>
          <dt>Queued</dt>
          <dd>{metrics.queued}</dd>
        </div>
        <div>
          <dt>Delivered</dt>
          <dd>{metrics.delivered}</dd>
        </div>
        <div>
          <dt>Failed</dt>
          <dd>{metrics.failed}</dd>
        </div>
        <div>
          <dt>Success rate</dt>
          <dd>{metrics.successRate}%</dd>
        </div>
        <div>
          <dt>Retry rate</dt>
          <dd>{metrics.retryRate}%</dd>
        </div>
      </dl>
    </section>
  );
}
