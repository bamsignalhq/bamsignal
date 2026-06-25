import { MONITORING_SERVICE_STATUS_LABELS } from "../../../constants/monitoringCenter";
import type { ServiceHealthRecord } from "../../../types/monitoringCenter";

type IntegrationHealthCardProps = {
  services: ServiceHealthRecord[];
};

export function IntegrationHealthCard({ services }: IntegrationHealthCardProps) {
  return (
    <section className="monitoring-card integration-health-card concierge-consultant-card--glass cc-reveal">
      <header className="monitoring-card__head">
        <h3>Integrations</h3>
        <p>Paystack, Resend, Sendchamp, Google Calendar, Zoom, Google Meet, CRM.</p>
      </header>
      <ul className="integration-health-card__list">
        {services.map((service) => (
          <li key={service.id}>
            <strong>{service.label}</strong>
            <span className={`monitoring-status monitoring-status--${service.status}`}>
              {MONITORING_SERVICE_STATUS_LABELS[service.status]}
            </span>
            <span>{service.availability}% · {service.latencyMs}ms</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
