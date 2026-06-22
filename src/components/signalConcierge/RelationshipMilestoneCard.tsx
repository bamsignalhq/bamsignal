import {
  ANNIVERSARY_TIMELINE_TITLE,
  getJourneyMilestoneDefinition,
  milestoneYearFromDate
} from "../../constants/journeyMilestones";
import type { JourneyMilestoneEntry } from "../../types/journeyMilestone";
import { MilestoneBadge, MilestoneYearLabel } from "./MilestoneBadge";

type RelationshipMilestoneCardProps = {
  entry: JourneyMilestoneEntry;
  celebrate?: boolean;
};

export function RelationshipMilestoneCard({ entry, celebrate = false }: RelationshipMilestoneCardProps) {
  const definition = getJourneyMilestoneDefinition(entry.id);
  const year = milestoneYearFromDate(entry.milestoneAt);

  return (
    <article
      className={`relationship-milestone-card${celebrate ? " relationship-milestone-card--celebrate" : ""}`}
    >
      <div className="relationship-milestone-card__badge-row">
        <MilestoneBadge milestoneId={entry.id} />
        {year ? <MilestoneYearLabel entry={entry} /> : null}
      </div>
      {entry.note ? (
        <p className="relationship-milestone-card__note">{entry.note}</p>
      ) : celebrate ? (
        <p className="relationship-milestone-card__cheer">
          {definition?.emoji ?? "✨"} Celebrating {definition?.label ?? ANNIVERSARY_TIMELINE_TITLE}
        </p>
      ) : null}
    </article>
  );
}
