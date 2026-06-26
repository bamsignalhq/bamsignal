import {
  OBSERVABILITY_SERVICE_STATUS_LABELS
} from "../../../constants/productionObservability";
import type { ObservabilityServiceRecord } from "../../../types/productionObservability";
import {
  formatObservabilityCheckedAt,
  formatObservabilityResponseTime
} from "../../../utils/productionObservabilityLogic";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";

const STATUS_BADGE = {
  healthy: "healthy",
  warning: "warning",
  offline: "broken"
} as const;

type LiveServicesCardProps = {
  services: ObservabilityServiceRecord[];
};

export function LiveServicesCard({ services }: LiveServicesCardProps) {
  return (
    <section className="observability-card concierge-consultant-card--glass cc-reveal">
      <header className="observability-card__head">
        <h3>Live Services</h3>
        <p>Dependency health with last check and response time.</p>
      </header>
      <ul className="observability-card__table">
        {services.map((service) => (
          <li key={service.id} className="observability-card__row">
            <div className="observability-card__row-main">
              <strong>{service.label}</strong>
              {service.future ? <span className="observability-card__tag">Future</span> : null}
            </div>
            <InstitutionalStatusBadge
              status={STATUS_BADGE[service.status]}
              label={OBSERVABILITY_SERVICE_STATUS_LABELS[service.status]}
            />
            <span>{formatObservabilityResponseTime(service.responseTimeMs)}</span>
            <span className="observability-card__muted">{formatObservabilityCheckedAt(service.checkedAt)}</span>
            {service.note ? <p className="observability-card__note">{service.note}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
