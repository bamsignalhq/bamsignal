import {
  FAMILY_MILESTONE_ARCHITECTURE_SEED,
  FAMILY_MILESTONE_EVENTS,
  FAMILY_MILESTONE_FUTURE_CAPABILITIES,
  FAMILY_MILESTONE_RESERVED_COPY,
  FAMILY_MILESTONES_LABEL,
  FAMILY_MILESTONES_SUBCOPY,
  FAMILY_MILESTONES_TITLE,
  GROWING_TOGETHER_LABEL,
  LEGACY_FAMILY_LABEL,
  type FamilyMilestoneTimelineEntry
} from "../../../constants/familyMilestones";
import { FamilyMilestoneBadge } from "./FamilyMilestoneBadge";
import { FamilyTimelineCard } from "./FamilyTimelineCard";

type FamilyMilestoneCardProps = {
  /** Optional timeline entries — defaults to architecture seed for preview. */
  entries?: FamilyMilestoneTimelineEntry[];
  /** When true, shows architecture seed timeline. */
  showArchitecturePreview?: boolean;
};

export function FamilyMilestoneCard({
  entries,
  showArchitecturePreview = false
}: FamilyMilestoneCardProps) {
  const timelineEntries =
    entries ?? (showArchitecturePreview ? FAMILY_MILESTONE_ARCHITECTURE_SEED : []);

  return (
    <div className="family-milestones">
      <section className="family-milestone-card concierge-consultant-card--glass">
        <header className="concierge-consultant-card__head">
          <h3>{FAMILY_MILESTONES_TITLE}</h3>
          <p>{FAMILY_MILESTONES_SUBCOPY}</p>
        </header>

        <p className="family-milestone-card__labels">
          {FAMILY_MILESTONES_LABEL} · {GROWING_TOGETHER_LABEL} · {LEGACY_FAMILY_LABEL}
        </p>

        <div className="family-milestone-card__events">
          <h4>Milestone events</h4>
          <ul className="family-milestone-card__event-list">
            {FAMILY_MILESTONE_EVENTS.map((event) => (
              <li key={event.id}>
                <FamilyMilestoneBadge eventId={event.id} primary />
                <p>{event.description}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="family-milestone-card__future">
          <h4>Future ready</h4>
          <ul>
            {FAMILY_MILESTONE_FUTURE_CAPABILITIES.map((capability) => (
              <li key={capability.id}>
                <strong>{capability.label}</strong>
                <span>{capability.description}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="family-milestone-card__reserved">{FAMILY_MILESTONE_RESERVED_COPY}</p>
      </section>

      <FamilyTimelineCard entries={timelineEntries} />
    </div>
  );
}
