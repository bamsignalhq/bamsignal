import {
  TRUST_JOURNEY_LABEL,
  TRUST_MILESTONE_ITEM_LABEL,
  TRUST_MILESTONES_FORBIDDEN_COPY
} from "../../../constants/trustMilestones";
import type { TrustMilestoneHonorViewModel } from "../../../utils/trustMilestonesLogic";

type TrustMilestoneCardProps = {
  honor: TrustMilestoneHonorViewModel;
};

export function TrustMilestoneCard({ honor }: TrustMilestoneCardProps) {
  return (
    <article className="tms-milestone-card institute-glass">
      <header className="tms-milestone-card__head">
        <h3>{honor.title}</h3>
        <span className="tms-milestone-card__badge">{TRUST_MILESTONE_ITEM_LABEL}</span>
      </header>

      <p className="tms-milestone-card__labels">
        {TRUST_JOURNEY_LABEL} — not {TRUST_MILESTONES_FORBIDDEN_COPY.join(" or ")}.
      </p>
      <p className="tms-milestone-card__journey">{honor.journeySummary}</p>
      <p className="tms-milestone-card__description">{honor.description}</p>
      <p className="tms-milestone-card__status">{honor.statusLabel}</p>
    </article>
  );
}
