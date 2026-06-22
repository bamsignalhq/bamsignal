import {
  FAMILY_LABEL,
  LEGACY_FAMILIES_PRIVACY_COPY,
  LEGACY_FAMILIES_RESERVED_COPY
} from "../../../../constants/legacyFamilies";
import type { FamilyMilestoneTimelineEntry } from "../../../../constants/familyMilestones";
import { familyMilestoneEventLabel } from "../../../../constants/familyMilestones";
import type { LegacyFamilyDisplayRow } from "../../../../utils/legacyFamiliesLogic";

type FamilyTimelineCardProps = {
  displayRows: LegacyFamilyDisplayRow[];
  milestoneEntries?: FamilyMilestoneTimelineEntry[];
};

export function FamilyTimelineCard({ displayRows, milestoneEntries = [] }: FamilyTimelineCardProps) {
  const sortedMilestones = [...milestoneEntries].sort(
    (a, b) =>
      new Date(b.milestoneAt ?? b.recordedAt).getTime() -
      new Date(a.milestoneAt ?? a.recordedAt).getTime()
  );

  return (
    <section className="legacy-families-timeline-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>{FAMILY_LABEL} timeline</h3>
        <p>{LEGACY_FAMILIES_PRIVACY_COPY}</p>
      </header>

      <ol className="legacy-families-timeline-card__display">
        {displayRows.map((row) => (
          <li
            key={row.id}
            className={`legacy-families-timeline-card__display-item${
              row.reached ? " is-reached" : ""
            }`}
          >
            <span className="legacy-families-timeline-card__dot" aria-hidden />
            <div>
              <span className="legacy-families-timeline-card__label">{row.label}</span>
              {row.value ? (
                <strong className="legacy-families-timeline-card__value">{row.value}</strong>
              ) : (
                <span className="legacy-families-timeline-card__pending">Pending</span>
              )}
            </div>
          </li>
        ))}
      </ol>

      {sortedMilestones.length ? (
        <>
          <h4 className="legacy-families-timeline-card__milestones-head">Family Milestones</h4>
          <ol className="legacy-families-timeline-card__milestones">
            {sortedMilestones.map((entry) => (
              <li key={entry.id} className="legacy-families-timeline-card__milestone-item">
                <span className="legacy-families-timeline-card__dot" aria-hidden />
                <div>
                  <strong>{familyMilestoneEventLabel(entry.eventId)}</strong>
                  {entry.note ? (
                    <p className="legacy-families-timeline-card__note">{entry.note}</p>
                  ) : null}
                  <time dateTime={entry.milestoneAt ?? entry.recordedAt}>
                    {new Date(entry.milestoneAt ?? entry.recordedAt).toLocaleDateString()}
                  </time>
                </div>
              </li>
            ))}
          </ol>
        </>
      ) : null}

      <p className="legacy-families-timeline-card__reserved">{LEGACY_FAMILIES_RESERVED_COPY}</p>
    </section>
  );
}
