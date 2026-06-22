import {
  CELEBRATIONS_LABEL,
  JOURNEY_MEMORIES_LABEL,
  THOUGHTFUL_MOMENTS_LABEL,
  anniversaryCelebrationYear,
  type AnniversaryCelebrationTimelineEntry
} from "../../../constants/anniversaryCelebrationExperience";
import { latestAnniversaryCelebrationMemory } from "../../../utils/AnniversaryCelebrationExperienceEngine";

type AnniversaryMemoryCardProps = {
  entries?: AnniversaryCelebrationTimelineEntry[];
  memory?: AnniversaryCelebrationTimelineEntry | null;
};

export function AnniversaryMemoryCard({ entries = [], memory }: AnniversaryMemoryCardProps) {
  const highlight = memory ?? latestAnniversaryCelebrationMemory(entries);

  return (
    <section className="anniversary-memory-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>{JOURNEY_MEMORIES_LABEL}</h3>
        <p>
          {CELEBRATIONS_LABEL} · {THOUGHTFUL_MOMENTS_LABEL}
        </p>
      </header>

      {highlight ? (
        <blockquote className="anniversary-memory-card__quote">
          <p className="anniversary-memory-card__label">{highlight.label}</p>
          {highlight.note ? <p>{highlight.note}</p> : null}
          <footer>
            <time dateTime={highlight.milestoneAt}>
              {anniversaryCelebrationYear(highlight.milestoneAt) ||
                new Date(highlight.milestoneAt).toLocaleDateString()}
            </time>
            <span> · {highlight.status}</span>
          </footer>
        </blockquote>
      ) : (
        <p className="concierge-consultant__empty">
          Anniversary memories will appear here as celebrations are honored.
        </p>
      )}
    </section>
  );
}
