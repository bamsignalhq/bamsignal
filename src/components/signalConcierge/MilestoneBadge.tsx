import {
  getJourneyMilestoneDefinition,
  JOURNEY_MILESTONE_LABELS,
  milestoneYearFromDate,
  type JourneyMilestoneId
} from "../../constants/journeyMilestones";
import type { JourneyMilestoneEntry } from "../../types/journeyMilestone";

type MilestoneBadgeProps = {
  milestoneId: JourneyMilestoneId;
  compact?: boolean;
};

export function MilestoneBadge({ milestoneId, compact = false }: MilestoneBadgeProps) {
  const definition = getJourneyMilestoneDefinition(milestoneId);
  const label = definition?.label ?? JOURNEY_MILESTONE_LABELS[milestoneId];
  const emoji = definition?.emoji ?? "✨";

  return (
    <span
      className={`journey-milestone-badge${compact ? " journey-milestone-badge--compact" : ""}`}
      title={label}
    >
      <span className="journey-milestone-badge__emoji" aria-hidden>
        {emoji}
      </span>
      <span className="journey-milestone-badge__label">{label}</span>
    </span>
  );
}

type MilestoneBadgeFromEntryProps = {
  entry: JourneyMilestoneEntry;
  compact?: boolean;
};

export function MilestoneBadgeFromEntry({ entry, compact }: MilestoneBadgeFromEntryProps) {
  return <MilestoneBadge milestoneId={entry.id} compact={compact} />;
}

export function MilestoneYearLabel({ entry }: { entry: JourneyMilestoneEntry }) {
  const year = milestoneYearFromDate(entry.milestoneAt);
  if (!year) return null;
  return <span className="journey-milestone-year">{year}</span>;
}
