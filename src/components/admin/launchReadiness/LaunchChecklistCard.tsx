import { LAUNCH_READINESS_STATUS_LABELS } from "../../../constants/launchReadiness";
import type { LaunchChecklistItem } from "../../../types/launchReadiness";

type LaunchChecklistCardProps = {
  checklist: LaunchChecklistItem[];
};

export function LaunchChecklistCard({ checklist }: LaunchChecklistCardProps) {
  const completeCount = checklist.filter((item) => item.complete).length;

  return (
    <section className="launch-checklist-card concierge-consultant-card--glass cc-reveal">
      <header className="launch-checklist-card__head">
        <h3>Launch checklist</h3>
        <p>
          {completeCount} of {checklist.length} readiness checks complete.
        </p>
      </header>

      <ul className="launch-checklist-card__list">
        {checklist.map((item) => (
          <li
            key={item.id}
            className={`launch-checklist-card__item launch-checklist-card__item--${item.status}`}
          >
            <span aria-hidden="true">{item.complete ? "✓" : "○"}</span>
            <div>
              <strong>{item.label}</strong>
              <p>{LAUNCH_READINESS_STATUS_LABELS[item.status]}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
