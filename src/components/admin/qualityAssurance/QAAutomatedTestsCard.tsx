import { QA_RELEASE_GATE_STATUS_LABELS } from "../../../constants/qualityAssuranceCenter";
import type { QAAutomatedTestRun } from "../../../types/qualityAssuranceCenter";

type QAAutomatedTestsCardProps = {
  tests: QAAutomatedTestRun[];
};

export function QAAutomatedTestsCard({ tests }: QAAutomatedTestsCardProps) {
  return (
    <section className="qa-certification-card qa-automated-card concierge-consultant-card--glass cc-reveal">
      <header className="qa-certification-card__head">
        <h3>Automated tests</h3>
        <p>Build, unit, integration, server import, database, API, and platform subsystem tests.</p>
      </header>
      <ul className="qa-certification-card__list">
        {tests.map((test) => (
          <li key={test.id}>
            <div className="qa-certification-card__row">
              <strong>{test.label}</strong>
              <span className={`qa-gate-status qa-gate-status--${test.status}`}>
                {QA_RELEASE_GATE_STATUS_LABELS[test.status]}
              </span>
            </div>
            <div className="qa-certification-card__meta">
              <span>{test.durationMs} ms</span>
              <span>{new Date(test.lastRunAt).toLocaleString()}</span>
            </div>
            {test.detail ? <p>{test.detail}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
