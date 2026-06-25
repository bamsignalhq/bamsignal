import type { CSSProperties } from "react";
import { CONTINUITY_HEALTH_STATUS_LABELS } from "../../../constants/businessContinuity";
import type { RiskAssessmentItem } from "../../../types/businessContinuity";

type RiskAssessmentCardProps = {
  items: RiskAssessmentItem[];
};

export function RiskAssessmentCard({ items }: RiskAssessmentCardProps) {
  return (
    <section className="continuity-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Risk assessment</h3>
        <p>Composite resilience scoring across providers, backups, and incident exposure.</p>
      </header>
      <ul className="continuity-risk-list">
        {items.map((item) => (
          <li key={item.id} className={`continuity-risk continuity-risk--${item.status}`}>
            <div className="continuity-risk__head">
              <strong>{item.label}</strong>
              <span className={`continuity-pill continuity-pill--${item.status}`}>
                {CONTINUITY_HEALTH_STATUS_LABELS[item.status]}
              </span>
            </div>
            <div className="continuity-risk__score" style={{ "--score": item.score } as CSSProperties}>
              <div className="continuity-risk__bar" />
              <span>{item.score}/100</span>
            </div>
            <p>{item.note}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
