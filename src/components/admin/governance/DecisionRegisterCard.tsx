import type { ExecutiveDecisionRecord } from "../../../types/institutionalGovernance";

type DecisionRegisterCardProps = {
  decisions: ExecutiveDecisionRecord[];
};

export function DecisionRegisterCard({ decisions }: DecisionRegisterCardProps) {
  return (
    <section className="governance-card decision-register-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Executive decision register</h3>
        <p>Permanent append-only record of major institutional decisions.</p>
      </header>
      <ul className="decision-register-card__list">
        {decisions.map((decision) => (
          <li key={decision.id}>
            <strong>{decision.title}</strong>
            <span>{decision.decisionRef}</span>
            <p>{decision.summary}</p>
            <span>
              {decision.decidedBy} · {new Date(decision.decidedAt).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
