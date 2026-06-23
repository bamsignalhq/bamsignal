import { SERVICE_HEALTH_STATUS_LABELS } from "../../../constants/systemHealth";
import type { ServiceHealthRecord } from "../../../types/systemHealth";
import {
  formatLastFailure,
  formatRecoveryTime,
  formatResponseTimeMs,
  formatUptimePercent
} from "../../../utils/systemHealthLogic";

type ServiceHealthCardProps = {
  service: ServiceHealthRecord;
  selected?: boolean;
  onSelect?: () => void;
};

export function ServiceHealthCard({ service, selected = false, onSelect }: ServiceHealthCardProps) {
  const content = (
    <>
      <div className="service-health-card__head">
        <div>
          <p className="service-health-card__category">{service.category}</p>
          <h3>{service.label}</h3>
        </div>
        <span className={`system-health-badge system-health-badge--${service.status}`}>
          {SERVICE_HEALTH_STATUS_LABELS[service.status]}
        </span>
      </div>
      <dl className="service-health-card__metrics">
        <div>
          <dt>Uptime</dt>
          <dd>{formatUptimePercent(service.metrics.uptimePercent)}</dd>
        </div>
        <div>
          <dt>Response time</dt>
          <dd>{formatResponseTimeMs(service.metrics.responseTimeMs)}</dd>
        </div>
        <div>
          <dt>Error count (24h)</dt>
          <dd>{service.metrics.errorCount24h}</dd>
        </div>
        <div>
          <dt>Last failure</dt>
          <dd>{formatLastFailure(service.metrics.lastFailureAt)}</dd>
        </div>
        <div>
          <dt>Recovery time</dt>
          <dd>{formatRecoveryTime(service.metrics.recoveryTimeMinutes)}</dd>
        </div>
      </dl>
      <p className="service-health-card__note">{service.note}</p>
      {service.critical ? <p className="service-health-card__critical">Critical service</p> : null}
    </>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        className={`service-health-card service-health-card--button${selected ? " is-selected" : ""}`}
        onClick={onSelect}
      >
        {content}
      </button>
    );
  }

  return <article className="service-health-card">{content}</article>;
}
