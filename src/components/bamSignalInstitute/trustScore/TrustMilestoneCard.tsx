import { MILESTONES_LABEL, TRUST_MILESTONE_LABEL } from "../../../constants/trustScoreInstitute";
import type { TrustMilestoneViewModel } from "../../../utils/trustScoreInstituteLogic";

type TrustMilestoneCardProps = {
  milestone: TrustMilestoneViewModel;
};

export function TrustMilestoneCard({ milestone }: TrustMilestoneCardProps) {
  return (
    <article className="tscr-milestone-card institute-glass">
      <header className="tscr-milestone-card__head">
        <h3>{milestone.title}</h3>
        <span className="tscr-milestone-card__badge">{TRUST_MILESTONE_LABEL}</span>
      </header>

      <p className="tscr-milestone-card__labels">{MILESTONES_LABEL} — earned standing, not ratings.</p>
      <p className="tscr-milestone-card__level">{milestone.levelTitle}</p>
      <p className="tscr-milestone-card__description">{milestone.description}</p>
      <time className="tscr-milestone-card__date" dateTime={milestone.recordedAt}>
        {new Date(milestone.recordedAt).toLocaleDateString()}
      </time>
      <p className="tscr-milestone-card__status">{milestone.statusLabel}</p>
    </article>
  );
}
