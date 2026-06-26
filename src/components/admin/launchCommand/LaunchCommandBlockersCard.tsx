import { LAUNCH_BLOCKER_SEVERITY_LABELS } from "../../../constants/launchCommandCenter";
import type { LaunchCommandBlocker } from "../../../types/launchCommandCenter";
import { countBlockersBySeverity } from "../../../utils/launchCommandCenterLogic";

type LaunchCommandBlockersCardProps = {
  blockers: LaunchCommandBlocker[];
};

const SEVERITY_ORDER = ["critical", "high", "medium", "low"] as const;

export function LaunchCommandBlockersCard({ blockers }: LaunchCommandBlockersCardProps) {
  const open = blockers.filter((item) => item.status === "open");
  const sorted = [...open].sort((left, right) => {
    const leftIndex = SEVERITY_ORDER.indexOf(left.severity);
    const rightIndex = SEVERITY_ORDER.indexOf(right.severity);
    return leftIndex - rightIndex;
  });

  return (
    <section className="launch-command-card launch-command-blockers-card concierge-consultant-card--glass cc-reveal">
      <header className="launch-command-card__head">
        <h3>Blockers</h3>
        <p>Critical, high, medium, and low launch blockers.</p>
      </header>
      <div className="launch-command-blockers-card__counts">
        {SEVERITY_ORDER.map((severity) => (
          <article key={severity}>
            <span>{LAUNCH_BLOCKER_SEVERITY_LABELS[severity]}</span>
            <strong>{countBlockersBySeverity(blockers, severity)}</strong>
          </article>
        ))}
      </div>
      {sorted.length ? (
        <ul className="launch-command-card__list">
          {sorted.map((blocker) => (
            <li key={blocker.id}>
              <div className="launch-command-card__row">
                <strong>{blocker.blockerRef}</strong>
                <span className={`launch-command-blocker__severity launch-command-blocker__severity--${blocker.severity}`}>
                  {LAUNCH_BLOCKER_SEVERITY_LABELS[blocker.severity]}
                </span>
              </div>
              <p>{blocker.title}</p>
              <div className="launch-command-card__meta">
                <span>{blocker.domain}</span>
                <span>{blocker.ownerEmail}</span>
                <span>{new Date(blocker.openedAt).toLocaleDateString()}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="launch-command-card__empty">No open launch blockers.</p>
      )}
    </section>
  );
}
