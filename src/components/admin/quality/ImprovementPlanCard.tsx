import { QUALITY_REVIEW_AREA_LABELS } from "../../../constants/consultantQuality";
import type { ImprovementPlanItem, QualityAppendEntry } from "../../../types/consultantQuality";

type ImprovementPlanCardProps = {
  improvementPlan: ImprovementPlanItem[];
  appendLog: QualityAppendEntry[];
};

export function ImprovementPlanCard({ improvementPlan, appendLog }: ImprovementPlanCardProps) {
  return (
    <section className="improvement-plan-card concierge-consultant-card--glass cc-reveal">
      <header className="improvement-plan-card__head">
        <h3>Improvement plan</h3>
        <p>Training recommendations and append-only review log.</p>
      </header>

      {improvementPlan.length ? (
        <ul className="improvement-plan-card__list">
          {improvementPlan.map((item) => (
            <li key={`${item.areaId}-${item.recommendation}`}>
              <strong>{QUALITY_REVIEW_AREA_LABELS[item.areaId]}</strong>
              <p>{item.recommendation}</p>
              {item.trainingModule ? (
                <span className="improvement-plan-card__module">Academy: {item.trainingModule}</span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="improvement-plan-card__empty">No improvement plan required — quality standards met.</p>
      )}

      {appendLog.length ? (
        <footer className="improvement-plan-card__log">
          <h4>Append log</h4>
          <ol>
            {appendLog.map((entry) => (
              <li key={entry.id}>
                <strong>{entry.action}</strong>
                <span>{entry.actor}</span>
                <span>{new Date(entry.timestamp).toLocaleString()}</span>
                <p>{entry.note}</p>
              </li>
            ))}
          </ol>
        </footer>
      ) : null}
    </section>
  );
}
