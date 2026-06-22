import {
  DIASPORA_ADVISOR_LABEL,
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL
} from "../../../constants/diasporaServices";
import type { DiasporaAdvisorViewModel } from "../../../utils/diasporaServicesLogic";

type DiasporaAdvisorCardProps = {
  advisor: DiasporaAdvisorViewModel;
};

export function DiasporaAdvisorCard({ advisor }: DiasporaAdvisorCardProps) {
  return (
    <article className="dias-advisor-card institute-glass">
      <header className="dias-advisor-card__head">
        <h3>{advisor.name}</h3>
        <span className="dias-advisor-card__badge">{DIASPORA_ADVISOR_LABEL}</span>
      </header>

      <p className="dias-advisor-card__labels">
        {GROWING_TOGETHER_LABEL} · {LEARNING_LABEL}
      </p>
      <p className="dias-advisor-card__service">{advisor.serviceTitle}</p>
      <p className="dias-advisor-card__title">{advisor.title}</p>
      <p className="dias-advisor-card__focus">{advisor.focus}</p>
      <p className="dias-advisor-card__status">{advisor.statusLabel}</p>
    </article>
  );
}
