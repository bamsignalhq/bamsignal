import type { NotificationReliabilityMetric } from "../../../types/notificationReliability";

type NotificationMetricsCardProps = {
  metrics: NotificationReliabilityMetric[];
};

export function NotificationMetricsCard({ metrics }: NotificationMetricsCardProps) {
  return (
    <section className="notification-metrics-card concierge-consultant-card--glass cc-reveal">
      <header className="notification-metrics-card__head">
        <h3>Delivery metrics</h3>
        <p>Outbound communication reliability across email, WhatsApp, and system queues.</p>
      </header>
      <div className="notification-metrics-card__grid">
        {metrics.map((metric) => (
          <article key={metric.id} className="notification-metric-chip">
            <p>{metric.label}</p>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
