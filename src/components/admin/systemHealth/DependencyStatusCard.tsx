import { MONITORED_SERVICE_LABELS, SERVICE_HEALTH_STATUS_LABELS } from "../../../constants/systemHealth";
import type { DependencyStatusRecord } from "../../../types/systemHealth";

type DependencyStatusCardProps = {
  dependencies: DependencyStatusRecord[];
};

export function DependencyStatusCard({ dependencies }: DependencyStatusCardProps) {
  return (
    <section className="dependency-status-card concierge-consultant-card--glass cc-reveal">
      <header className="dependency-status-card__head">
        <h3>Dependency status</h3>
        <p>Institutional product surfaces and the services they rely on.</p>
      </header>

      <div className="dependency-status-card__list">
        {dependencies.map((dependency) => (
          <article key={dependency.id} className="dependency-status-card__row">
            <div className="dependency-status-card__main">
              <h4>{dependency.label}</h4>
              <p>{dependency.impact}</p>
              <p className="dependency-status-card__deps">
                Depends on:{" "}
                {dependency.dependsOn.map((serviceId) => MONITORED_SERVICE_LABELS[serviceId]).join(", ")}
              </p>
            </div>
            <span className={`system-health-badge system-health-badge--${dependency.status}`}>
              {SERVICE_HEALTH_STATUS_LABELS[dependency.status]}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
