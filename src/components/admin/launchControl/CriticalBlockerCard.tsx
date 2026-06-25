import {
  LAUNCH_READINESS_DOMAIN_LABELS,
  LAUNCH_RISK_SEVERITY_LABELS
} from "../../../constants/launchControlCenter";
import type { LaunchBlockerRecord } from "../../../types/launchControlCenter";

type CriticalBlockerCardProps = {
  blockers: LaunchBlockerRecord[];
};

export function CriticalBlockerCard({ blockers }: CriticalBlockerCardProps) {
  const sorted = [...blockers].sort(
    (left, right) => new Date(right.openedAt).getTime() - new Date(left.openedAt).getTime()
  );

  return (
    <section className="launch-control-card critical-blocker-card concierge-consultant-card--glass cc-reveal">
      <header className="launch-control-card__head">
        <h3>Critical blockers</h3>
        <p>Issues that must be resolved before Go decision.</p>
      </header>
      {sorted.length ? (
        <ul className="launch-control-card__list">
          {sorted.map((blocker) => (
            <li key={blocker.id}>
              <div className="launch-control-card__row">
                <strong>{blocker.blockerRef}</strong>
                <span className={`risk-severity risk-severity--${blocker.severity}`}>
                  {LAUNCH_RISK_SEVERITY_LABELS[blocker.severity]}
                </span>
              </div>
              <p>{blocker.title}</p>
              <div className="launch-control-card__meta">
                <span>{LAUNCH_READINESS_DOMAIN_LABELS[blocker.domainId]}</span>
                <span>{blocker.status}</span>
                <span>{blocker.ownerEmail}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="launch-control-card__empty">No blockers in this section.</p>
      )}
    </section>
  );
}
