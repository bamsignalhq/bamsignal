import type { LaunchCertificationCheck } from "../../../types/launchCertification";

type LaunchCertificationChecklistProps = {
  checks: LaunchCertificationCheck[];
};

export function LaunchCertificationChecklist({ checks }: LaunchCertificationChecklistProps) {
  return (
    <section className="institutional-card launch-certification-checklist-card concierge-consultant-card--glass cc-reveal">
      <header className="institutional-card__head">
        <h3>Consolidation verification</h3>
        <p>No duplicate routes, engines, dead imports, or broken builds.</p>
      </header>

      <ul className="institutional-card__list">
        {checks.map((item) => (
          <li
            key={item.id}
            className={
              item.passed
                ? "launch-certification-checklist-card__item--passed"
                : "launch-certification-checklist-card__item--failed"
            }
          >
            <div className="institutional-card__row">
              <strong>{item.label}</strong>
              <span
                className={
                  item.passed
                    ? "launch-certification-checklist-card__badge--pass"
                    : "launch-certification-checklist-card__badge--fail"
                }
              >
                {item.passed ? "Verified" : "Failed"}
              </span>
            </div>
            <div className="institutional-card__meta">
              <span>{item.checkRef}</span>
            </div>
            <p>{item.detail}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
