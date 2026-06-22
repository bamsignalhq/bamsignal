import {
  RELATIONSHIP_JOURNEY_STATUS_LABELS,
  type RelationshipJourneyStatus
} from "../../../constants/conciergeJourneyArchive";

type RelationshipStatusBadgeProps = {
  status: RelationshipJourneyStatus;
  className?: string;
};

export function RelationshipStatusBadge({ status, className = "" }: RelationshipStatusBadgeProps) {
  return (
    <span
      className={`relationship-status-badge relationship-status-badge--${status}${className ? ` ${className}` : ""}`}
    >
      {RELATIONSHIP_JOURNEY_STATUS_LABELS[status]}
    </span>
  );
}
