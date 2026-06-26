import { QA_RELEASE_GATE_STATUS_LABELS } from "../../../constants/qualityAssuranceCenter";
import type { QAManualCheckRun } from "../../../types/qualityAssuranceCenter";

type QAManualQACardProps = {
  checks: QAManualCheckRun[];
};

export function QAManualQACard({ checks }: QAManualQACardProps) {
  return (
    <section className="qa-certification-card qa-manual-card concierge-consultant-card--glass cc-reveal">
      <header className="qa-certification-card__head">
        <h3>Manual QA</h3>
        <p>Android, iPhone, tablet, browsers, slow network, offline, and dark mode.</p>
      </header>
      <ul className="qa-certification-card__list">
        {checks.map((check) => (
          <li key={check.id}>
            <div className="qa-certification-card__row">
              <strong>{check.label}</strong>
              <span className={`qa-gate-status qa-gate-status--${check.status}`}>
                {QA_RELEASE_GATE_STATUS_LABELS[check.status]}
              </span>
            </div>
            <div className="qa-certification-card__meta">
              {check.testedBy ? <span>{check.testedBy}</span> : null}
              <span>{new Date(check.lastRunAt).toLocaleString()}</span>
            </div>
            {check.notes ? <p>{check.notes}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
