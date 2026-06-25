import {
  LAUNCH_CHECKLIST_STATUS_LABELS,
  LAUNCH_READINESS_DOMAIN_LABELS
} from "../../../constants/launchControlCenter";
import type { LaunchReadinessItem } from "../../../types/launchControlCenter";

type ReadinessCardProps = {
  items: LaunchReadinessItem[];
};

export function ReadinessCard({ items }: ReadinessCardProps) {
  return (
    <section className="launch-control-card readiness-card concierge-consultant-card--glass cc-reveal">
      <header className="launch-control-card__head">
        <h3>Readiness domains</h3>
        <p>Infrastructure through training — every institutional system reports status.</p>
      </header>
      <ul className="launch-control-card__list">
        {items.map((item) => (
          <li key={item.id}>
            <div className="launch-control-card__row">
              <strong>{LAUNCH_READINESS_DOMAIN_LABELS[item.domainId]}</strong>
              <span className={`checklist-status checklist-status--${item.status}`}>
                {LAUNCH_CHECKLIST_STATUS_LABELS[item.status]}
              </span>
            </div>
            <div className="launch-control-card__meta">
              <span>{item.score}%</span>
              <span>{item.ownerEmail}</span>
            </div>
            {item.notes ? <p className="readiness-card__notes">{item.notes}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
