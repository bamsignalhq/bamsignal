import { MONITORING_SERVICE_STATUS_LABELS } from "../../../constants/monitoringCenter";
import type { ServiceHealthRecord } from "../../../types/monitoringCenter";

type ServiceHealthCardProps = {
  services: ServiceHealthRecord[];
};

export function ServiceHealthCard({ services }: ServiceHealthCardProps) {
  return (
    <section className="monitoring-card service-health-card concierge-consultant-card--glass cc-reveal">
      <header className="monitoring-card__head">
        <h3>Service health</h3>
        <p>Frontend, API, authentication, journey engine, and institutional services.</p>
      </header>
      {services.length ? (
        <ul className="service-health-card__list">
          {services.map((service) => (
            <li key={service.id}>
              <div className="service-health-card__row">
                <strong>{service.label}</strong>
                <span className={`monitoring-status monitoring-status--${service.status}`}>
                  {MONITORING_SERVICE_STATUS_LABELS[service.status]}
                </span>
              </div>
              <div className="service-health-card__metrics">
                <span>{service.availability}% avail</span>
                <span>{service.latencyMs}ms</span>
                <span>{service.errorRate}% err</span>
              </div>
              {service.note ? <p className="service-health-card__note">{service.note}</p> : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="monitoring-card__empty">No services in this section.</p>
      )}
    </section>
  );
}
