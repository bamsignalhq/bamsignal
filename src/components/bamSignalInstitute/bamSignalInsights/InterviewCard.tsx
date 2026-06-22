import {
  CONVERSATIONS_LABEL,
  INSIGHTS_LABEL,
  PERSPECTIVES_LABEL
} from "../../../constants/bamSignalInsights";
import type { InterviewViewModel } from "../../../utils/bamSignalInsightsLogic";

type InterviewCardProps = {
  interview: InterviewViewModel;
};

export function InterviewCard({ interview }: InterviewCardProps) {
  return (
    <article className="bsi-interview-card institute-glass">
      <header className="bsi-interview-card__head">
        <h3>{interview.title}</h3>
        <span className="bsi-interview-card__badge">{CONVERSATIONS_LABEL}</span>
      </header>

      <p className="bsi-interview-card__labels">
        {INSIGHTS_LABEL} · {PERSPECTIVES_LABEL}
      </p>
      <p className="bsi-interview-card__guest">{interview.guestLabel}</p>
      <p className="bsi-interview-card__summary">{interview.summary}</p>
      <p className="bsi-interview-card__status">{interview.statusLabel}</p>
    </article>
  );
}
