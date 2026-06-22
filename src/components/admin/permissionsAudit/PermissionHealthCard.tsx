import { PERMISSION_SECURITY_STATUS_LABELS } from "../../../constants/permissionsAudit";
import type { PermissionHealthMetric } from "../../../types/permissionsAudit";

type PermissionHealthCardProps = {
  metrics: PermissionHealthMetric[];
  totalChecks: number;
};

export function PermissionHealthCard({ metrics, totalChecks }: PermissionHealthCardProps) {
  return (
    <section className="permission-health-card concierge-consultant-card--glass cc-reveal">
      <header className="permission-health-card__head">
        <h3>Permission health</h3>
        <p>{totalChecks} checks across roles, routes, and security issues.</p>
      </header>

      <div className="permission-health-card__metrics">
        {metrics.map((metric) => (
          <article
            key={metric.status}
            className={`permission-health-card__chip permission-health-card__chip--${metric.status}`}
          >
            <p>{PERMISSION_SECURITY_STATUS_LABELS[metric.status]}</p>
            <strong>{metric.count}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
