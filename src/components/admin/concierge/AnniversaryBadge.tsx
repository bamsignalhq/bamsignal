import {
  RELATIONSHIP_ANNIVERSARY_FOUNDATION_LABELS,
  RELATIONSHIP_AUTOMATIC_ANNIVERSARY_LABELS,
  type RelationshipAnniversaryMilestoneId
} from "../../../constants/relationshipAnniversary";
import { isAutomaticAnniversaryId } from "../../../utils/relationshipAnniversaryLogic";

type AnniversaryBadgeProps = {
  milestoneId: RelationshipAnniversaryMilestoneId;
  label?: string;
  primary?: boolean;
};

function defaultAnniversaryLabel(milestoneId: RelationshipAnniversaryMilestoneId): string {
  if (isAutomaticAnniversaryId(milestoneId)) {
    return RELATIONSHIP_AUTOMATIC_ANNIVERSARY_LABELS[milestoneId];
  }
  return RELATIONSHIP_ANNIVERSARY_FOUNDATION_LABELS[milestoneId];
}

export function AnniversaryBadge({ milestoneId, label, primary = false }: AnniversaryBadgeProps) {
  return (
    <span className={`anniversary-badge${primary ? " anniversary-badge--primary" : ""}`}>
      {label ?? defaultAnniversaryLabel(milestoneId)}
    </span>
  );
}
