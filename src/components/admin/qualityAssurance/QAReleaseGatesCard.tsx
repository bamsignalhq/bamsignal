import { QA_RELEASE_GATE_STATUS_LABELS } from "../../../constants/qualityAssuranceCenter";
import type { QAReleaseGate } from "../../../types/qualityAssuranceCenter";

type QAReleaseGatesCardProps = {
  gates: QAReleaseGate[];
};

export function QAReleaseGatesCard({ gates }: QAReleaseGatesCardProps) {
  return (
    <section className="qa-certification-card qa-gates-card concierge-consultant-card--glass cc-reveal">
      <header className="qa-certification-card__head">
        <h3>Release gates</h3>
        <p>PASS, WARNING, or FAILED — every failed gate blocks release.</p>
      </header>
      <ul className="qa-certification-card__list">
        {gates.map((gate) => (
          <li key={gate.id}>
            <div className="qa-certification-card__row">
              <strong>{gate.name}</strong>
              <span className={`qa-gate-status qa-gate-status--${gate.status}`}>
                {QA_RELEASE_GATE_STATUS_LABELS[gate.status]}
              </span>
            </div>
            <p>{gate.detail}</p>
            <div className="qa-certification-card__meta">
              <span>{gate.gateRef}</span>
              {gate.blocksRelease ? <span>Blocks release</span> : null}
              <span>{new Date(gate.evaluatedAt).toLocaleString()}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
