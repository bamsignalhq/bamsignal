import type { LaunchInfraArtifactResult, LaunchInfraCheck } from "../../../types/launchInfrastructure";

type LaunchInfrastructureChecklistProps = {
  checklist: LaunchInfraCheck[];
  artifacts: LaunchInfraArtifactResult[];
};

export function LaunchInfrastructureChecklist({ checklist, artifacts }: LaunchInfrastructureChecklistProps) {
  return (
    <section className="institutional-card launch-infra-checklist-card concierge-consultant-card--glass cc-reveal">
      <header className="institutional-card__head">
        <h3>Infrastructure checklist</h3>
        <p>Every deployment artifact verified against production implementation.</p>
      </header>

      <ul className="institutional-card__list">
        {checklist.map((item) => (
          <li
            key={item.id}
            className={
              item.passed
                ? "launch-infra-checklist-card__item--passed"
                : "launch-infra-checklist-card__item--failed"
            }
          >
            <div className="institutional-card__row">
              <strong>{item.label}</strong>
              <span
                className={
                  item.passed
                    ? "launch-infra-checklist-card__badge--pass"
                    : "launch-infra-checklist-card__badge--fail"
                }
              >
                {item.passed ? "Verified" : "Review"}
              </span>
            </div>
            <div className="institutional-card__meta">
              <span>{item.checkRef}</span>
            </div>
            <p>{item.detail}</p>
          </li>
        ))}
      </ul>

      <div className="launch-infra-checklist-card__artifacts">
        <h4>Artifact status</h4>
        <ul>
          {artifacts.map((artifact) => (
            <li key={artifact.id}>
              <span>{artifact.label}</span>
              <span className={`launch-infra-status launch-infra-status--${artifact.status}`}>
                {artifact.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
