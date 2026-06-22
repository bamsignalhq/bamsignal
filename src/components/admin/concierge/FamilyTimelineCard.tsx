import {
  FAMILY_MILESTONE_PERMANENCE_COPY,
  type FamilyMilestoneTimelineEntry
} from "../../../constants/familyMilestones";
import { FamilyMilestoneBadge } from "./FamilyMilestoneBadge";

type FamilyTimelineCardProps = {
  entries?: FamilyMilestoneTimelineEntry[];
};

export function FamilyTimelineCard({ entries = [] }: FamilyTimelineCardProps) {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.milestoneAt ?? b.recordedAt).getTime() - new Date(a.milestoneAt ?? a.recordedAt).getTime()
  );

  return (
    <section className="family-timeline-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Family timeline</h3>
        <p>{FAMILY_MILESTONE_PERMANENCE_COPY}</p>
      </header>

      {sorted.length ? (
        <ol className="family-timeline-card__list">
          {sorted.map((entry) => (
            <li key={entry.id} className="family-timeline-card__item">
              <span className="family-timeline-card__dot" aria-hidden />
              <div>
                <FamilyMilestoneBadge eventId={entry.eventId} primary />
                {entry.note ? <p className="family-timeline-card__note">{entry.note}</p> : null}
                <time dateTime={entry.milestoneAt ?? entry.recordedAt}>
                  {new Date(entry.milestoneAt ?? entry.recordedAt).toLocaleDateString()}
                </time>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="concierge-consultant__empty">No family milestones recorded yet.</p>
      )}
    </section>
  );
}
