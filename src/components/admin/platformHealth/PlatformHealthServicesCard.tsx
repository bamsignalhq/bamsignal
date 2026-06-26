import {
  PLATFORM_HEALTH_STATUS_LABELS,
  PLATFORM_HEALTH_TRAFFIC_LIGHT,
  type PlatformHealthStatusId
} from "../../../constants/platformHealth";
import type { PlatformHealthServiceRecord } from "../../../types/platformHealth";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";

type PlatformHealthServicesCardProps = {
  services: PlatformHealthServiceRecord[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

const BADGE_STATUS: Record<PlatformHealthStatusId, "healthy" | "warning" | "critical"> = {
  healthy: "healthy",
  warning: "warning",
  critical: "critical"
};

export function PlatformHealthServicesCard({
  services,
  selectedId,
  onSelect
}: PlatformHealthServicesCardProps) {
  return (
    <section className="platform-health-services concierge-consultant-card--glass cc-reveal">
      <header className="platform-health-services__head">
        <h3>Critical dependencies</h3>
        <p>Traffic-light status for every platform service — tap for detail.</p>
      </header>
      <div className="platform-health-services__grid">
        {services.map((service) => {
          const light = PLATFORM_HEALTH_TRAFFIC_LIGHT[service.status];
          const selected = selectedId === service.id;
          return (
            <button
              key={service.id}
              type="button"
              className={`platform-health-service-card platform-health-service-card--${light}${selected ? " platform-health-service-card--selected" : ""}`}
              onClick={() => onSelect(service.id)}
            >
              <span
                className={`platform-health-service-card__dot platform-health-service-card__dot--${light}`}
                aria-hidden="true"
              />
              <div className="platform-health-service-card__body">
                <strong>{service.label}</strong>
                {service.critical ? <span className="platform-health-service-card__tag">Critical</span> : null}
                <InstitutionalStatusBadge
                  status={BADGE_STATUS[service.status]}
                  label={PLATFORM_HEALTH_STATUS_LABELS[service.status]}
                />
                <span className="platform-health-service-card__latency">{service.responseTimeMs}ms</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

type PlatformHealthServiceDetailProps = {
  service: PlatformHealthServiceRecord | null;
};

export function PlatformHealthServiceDetail({ service }: PlatformHealthServiceDetailProps) {
  if (!service) return null;

  return (
    <section className="platform-health-detail concierge-consultant-card--glass cc-reveal">
      <header>
        <h3>{service.label}</h3>
        <p>Checked at {new Date(service.checkedAt).toLocaleString()}</p>
      </header>
      <dl className="platform-health-detail__metrics">
        <div>
          <dt>Response time</dt>
          <dd>{service.responseTimeMs}ms</dd>
        </div>
        <div>
          <dt>Last successful check</dt>
          <dd>{new Date(service.lastSuccessAt).toLocaleString()}</dd>
        </div>
        <div>
          <dt>Last failure</dt>
          <dd>{service.lastFailureAt ? new Date(service.lastFailureAt).toLocaleString() : "None in window"}</dd>
        </div>
        <div>
          <dt>Failure count (24h)</dt>
          <dd>{service.failureCount24h}</dd>
        </div>
        <div>
          <dt>Recovery attempts</dt>
          <dd>{service.recoveryAttempts}</dd>
        </div>
      </dl>
      {service.note ? <p className="platform-health-detail__note">{service.note}</p> : null}
    </section>
  );
}
