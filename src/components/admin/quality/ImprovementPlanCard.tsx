import {
  QUALITY_REVIEW_AREA_LABELS,
  QUALITY_STANDARD_LABELS
} from "../../../constants/consultantQuality";
import type {
  ImprovementPlanItem,
  ImprovementPlanRecord,
  QualityAppendEntry
} from "../../../types/consultantQuality";

type ImprovementPlanCardProps = {
  improvementPlans: ImprovementPlanRecord[];
  legacyPlan?: ImprovementPlanItem[];
  appendLog?: QualityAppendEntry[];
};

function formatDeadline(deadline: string) {
  return new Date(deadline).toLocaleDateString();
}

export function ImprovementPlanCard({
  improvementPlans,
  legacyPlan = [],
  appendLog = []
}: ImprovementPlanCardProps) {
  const activePlans = improvementPlans.filter((item) => item.status === "active");

  return (
    <section className="quality-card improvement-plan-card concierge-consultant-card--glass cc-reveal">
      <header className="improvement-plan-card__head">
        <h3>Improvement plans</h3>
        <p>Assigned actions, deadlines, follow-up reviews, and completion tracking.</p>
      </header>

      {activePlans.length ? (
        <ul className="improvement-plan-card__plans">
          {activePlans.map((plan) => (
            <li key={plan.id}>
              <div className="improvement-plan-card__plan-head">
                <strong>{plan.planRef}</strong>
                <span>{plan.consultantName}</span>
              </div>
              {plan.followUpReviewAt ? (
                <p className="improvement-plan-card__followup">
                  Follow-up review: {new Date(plan.followUpReviewAt).toLocaleString()}
                </p>
              ) : null}
              <ul className="improvement-plan-card__actions">
                {plan.actions.map((action) => (
                  <li key={action.id} className={`improvement-plan-card__action--${action.status}`}>
                    <strong>{QUALITY_STANDARD_LABELS[action.standardId]}</strong>
                    <p>{action.action}</p>
                    <div className="improvement-plan-card__action-meta">
                      <span>Deadline: {formatDeadline(action.deadline)}</span>
                      <span className={`improvement-plan-card__status improvement-plan-card__status--${action.status}`}>
                        {action.status}
                      </span>
                    </div>
                    {action.trainingModule ? (
                      <span className="improvement-plan-card__module">Academy: {action.trainingModule}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      ) : (
        <p className="improvement-plan-card__empty">
          No active improvement plans — quality standards met across the portfolio.
        </p>
      )}

      {legacyPlan.length ? (
        <div className="improvement-plan-card__legacy">
          <h4>Review recommendations</h4>
          <ul className="improvement-plan-card__list">
            {legacyPlan.map((item) => (
              <li key={`${item.areaId}-${item.recommendation}`}>
                <strong>{QUALITY_REVIEW_AREA_LABELS[item.areaId]}</strong>
                <p>{item.recommendation}</p>
                {item.trainingModule ? (
                  <span className="improvement-plan-card__module">Academy: {item.trainingModule}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

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
