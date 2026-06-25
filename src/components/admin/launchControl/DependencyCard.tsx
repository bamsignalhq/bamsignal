import { LAUNCH_CHECKLIST_STATUS_LABELS } from "../../../constants/launchControlCenter";
import type { LaunchDependencyRecord } from "../../../types/launchControlCenter";

type DependencyCardProps = {
  dependencies: LaunchDependencyRecord[];
};

export function DependencyCard({ dependencies }: DependencyCardProps) {
  return (
    <section className="launch-control-card dependency-card concierge-consultant-card--glass cc-reveal">
      <header className="launch-control-card__head">
        <h3>Dependencies</h3>
        <p>Cross-system launch dependencies and readiness gates.</p>
      </header>
      <ul className="launch-control-card__list">
        {dependencies.map((dep) => (
          <li key={dep.id}>
            <div className="launch-control-card__row">
              <strong>{dep.name}</strong>
              <span className={`checklist-status checklist-status--${dep.status}`}>
                {LAUNCH_CHECKLIST_STATUS_LABELS[dep.status]}
              </span>
            </div>
            <p>
              {dep.upstream} → {dep.downstream}
            </p>
            <div className="launch-control-card__meta">
              <span>{dep.dependencyRef}</span>
              {dep.critical ? <span>Critical</span> : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
