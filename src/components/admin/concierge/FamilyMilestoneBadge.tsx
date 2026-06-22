import type { FamilyMilestoneEventId } from "../../../constants/familyMilestones";
import { familyMilestoneEventLabel } from "../../../constants/familyMilestones";

type FamilyMilestoneBadgeProps = {
  eventId: FamilyMilestoneEventId;
  primary?: boolean;
};

export function FamilyMilestoneBadge({ eventId, primary = false }: FamilyMilestoneBadgeProps) {
  return (
    <span
      className={`family-milestone-badge${primary ? " family-milestone-badge--primary" : ""}`}
    >
      {familyMilestoneEventLabel(eventId)}
    </span>
  );
}
