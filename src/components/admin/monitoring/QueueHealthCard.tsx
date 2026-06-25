import { MONITORING_SERVICE_STATUS_LABELS } from "../../../constants/monitoringCenter";
import type { ServiceHealthRecord } from "../../../types/monitoringCenter";

type QueueHealthCardProps = {
  services: ServiceHealthRecord[];
};

export function QueueHealthCard({ services }: QueueHealthCardProps) {
  return (
    <section className="monitoring-card queue-health-card concierge-consultant-card--glass cc-reveal">
      <header className="monitoring-card__head">
        <h3>Queues & jobs</h3>
        <p>Queue workers, background jobs, cron jobs — depth, retries, throughput.</p>
      </header>
      <ul className="queue-health-card__list">
        {services.map((service) => (
          <li key={service.id}>
            <div className="queue-health-card__row">
              <strong>{service.label}</strong>
              <span className={`monitoring-status monitoring-status--${service.status}`}>
                {MONITORING_SERVICE_STATUS_LABELS[service.status]}
              </span>
            </div>
            <div className="queue-health-card__meta">
              {service.queueSize !== undefined ? <span>Queue: {service.queueSize}</span> : null}
              {service.retries !== undefined ? <span>Retries: {service.retries}</span> : null}
              <span>{service.throughput ?? "—"} throughput</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
