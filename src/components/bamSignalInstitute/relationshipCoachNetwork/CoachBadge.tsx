import {
  COACH_BADGE_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_COACH_NETWORK_LABEL
} from "../../../constants/relationshipCoachNetwork";
import type { CoachBadgeViewModel } from "../../../utils/relationshipCoachNetworkLogic";

type CoachBadgeProps = {
  badge: CoachBadgeViewModel;
};

export function CoachBadge({ badge }: CoachBadgeProps) {
  return (
    <article className="rcn-coach-badge institute-glass">
      <header className="rcn-coach-badge__head">
        <h3>{badge.title}</h3>
        <span className="rcn-coach-badge__badge">{COACH_BADGE_LABEL}</span>
      </header>

      <p className="rcn-coach-badge__labels">
        {RELATIONSHIP_COACH_NETWORK_LABEL} · {LEARNING_LABEL}
      </p>
      <p className="rcn-coach-badge__coach">{badge.coachName}</p>
      <p className="rcn-coach-badge__description">{badge.description}</p>
      <p className="rcn-coach-badge__status">{badge.statusLabel}</p>
    </article>
  );
}
