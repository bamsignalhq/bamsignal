import type { SafetyRiskAssessment } from "../../../types/safetyCenter";

type RiskAssessmentCardProps = {
  assessment: SafetyRiskAssessment;
};

export function RiskAssessmentCard({ assessment }: RiskAssessmentCardProps) {
  return (
    <section className="risk-assessment-card concierge-consultant-card--glass cc-reveal">
      <header className="risk-assessment-card__head">
        <h3>Risk assessment</h3>
        <p>Institutional trust signal — not operational noise.</p>
      </header>

      <div className="risk-assessment-card__score">
        <strong>{assessment.score}</strong>
        <span>{assessment.label}</span>
      </div>

      {assessment.factors.length ? (
        <ul className="risk-assessment-card__factors">
          {assessment.factors.map((factor) => (
            <li key={factor}>{factor}</li>
          ))}
        </ul>
      ) : (
        <p className="risk-assessment-card__empty">No elevated risk factors identified.</p>
      )}
    </section>
  );
}
