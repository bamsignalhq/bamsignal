import {
  anniversaryCelebrationYear,
  type AnniversaryCelebrationTimelineEntry
} from "../../../constants/anniversaryCelebrationExperience";
import { getAnniversaryCelebrationArchitectureTimeline } from "../../../utils/AnniversaryCelebrationExperienceEngine";

type CelebrationTimelineProps = {
  entries?: AnniversaryCelebrationTimelineEntry[];
  showArchitecturePreview?: boolean;
};

export function CelebrationTimeline({
  entries,
  showArchitecturePreview = false
}: CelebrationTimelineProps) {
  const timelineEntries =
    entries ?? (showArchitecturePreview ? getAnniversaryCelebrationArchitectureTimeline() : []);

  if (!timelineEntries.length) {
    return (
      <p className="concierge-consultant__empty celebration-timeline__empty">
        Anniversary celebrations will appear here as milestones are honored.
      </p>
    );
  }

  return (
    <ol className="celebration-timeline">
      {timelineEntries.map((entry) => {
        const year = anniversaryCelebrationYear(entry.milestoneAt);
        return (
          <li key={entry.id} className="celebration-timeline__item">
            <span className="celebration-timeline__dot" aria-hidden />
            <div>
              <div className="celebration-timeline__row">
                <strong>{entry.label}</strong>
                {year ? <span className="celebration-timeline__year">{year}</span> : null}
                <span className="celebration-timeline__status">{entry.status}</span>
              </div>
              {entry.note ? <p className="celebration-timeline__note">{entry.note}</p> : null}
              <time dateTime={entry.milestoneAt}>
                {new Date(entry.milestoneAt).toLocaleDateString()}
              </time>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
