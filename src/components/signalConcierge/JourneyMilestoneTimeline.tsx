import {
  milestoneYearFromDate,
  type JourneyMilestoneId
} from "../../constants/journeyMilestones";
import type { JourneyMilestoneEntry } from "../../types/journeyMilestone";
import { MilestoneBadge } from "./MilestoneBadge";

type JourneyMilestoneTimelineProps = {
  milestones: JourneyMilestoneEntry[];
  celebrate?: boolean;
};

export function JourneyMilestoneTimeline({ milestones, celebrate = false }: JourneyMilestoneTimelineProps) {
  if (!milestones.length) {
    return (
      <p className="journey-milestone-timeline__empty">
        {celebrate ? "Your journey milestones will appear here as they are celebrated." : "No milestones recorded yet."}
      </p>
    );
  }

  return (
    <ol className={`journey-milestone-timeline${celebrate ? " journey-milestone-timeline--celebrate" : ""}`}>
      {milestones.map((entry, index) => {
        const year = milestoneYearFromDate(entry.milestoneAt);
        const isLast = index === milestones.length - 1;

        return (
          <li key={entry.id} className="journey-milestone-timeline__item">
            <div className="journey-milestone-timeline__node">
              <MilestoneBadge milestoneId={entry.id as JourneyMilestoneId} />
              {year ? <span className="journey-milestone-timeline__year">{year}</span> : null}
              {entry.note ? (
                <p className="journey-milestone-timeline__note">{entry.note}</p>
              ) : null}
            </div>
            {!isLast ? (
              <span className="journey-milestone-timeline__connector" aria-hidden>
                ↓
              </span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
