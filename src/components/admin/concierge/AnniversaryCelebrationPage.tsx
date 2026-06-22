import {
  ANNIVERSARY_CELEBRATION_DEFINITIONS,
  ANNIVERSARY_CELEBRATION_EXPERIENCE_SUBCOPY,
  ANNIVERSARY_CELEBRATION_EXPERIENCE_TITLE,
  ANNIVERSARY_CELEBRATION_FULFILLMENT_COPY,
  ANNIVERSARY_CELEBRATION_FUTURE_CAPABILITIES,
  ANNIVERSARY_CELEBRATION_RESERVED_COPY,
  CELEBRATIONS_LABEL,
  JOURNEY_MEMORIES_LABEL,
  THOUGHTFUL_MOMENTS_LABEL,
  type AnniversaryCelebrationId
} from "../../../constants/anniversaryCelebrationExperience";
import { getAnniversaryCelebrationArchitectureTimeline } from "../../../utils/AnniversaryCelebrationExperienceEngine";
import { AnniversaryMemoryCard } from "./AnniversaryMemoryCard";
import { CelebrationTimeline } from "./CelebrationTimeline";
import { MilestoneCelebrationCard } from "./MilestoneCelebrationCard";

type AnniversaryCelebrationPageProps = {
  showArchitecturePreview?: boolean;
  highlightedCelebrationId?: AnniversaryCelebrationId;
};

export function AnniversaryCelebrationPage({
  showArchitecturePreview = true,
  highlightedCelebrationId
}: AnniversaryCelebrationPageProps) {
  const timelineEntries = showArchitecturePreview
    ? getAnniversaryCelebrationArchitectureTimeline()
    : [];

  return (
    <div className="anniversary-celebration-experience">
      <header className="anniversary-celebration-experience__head">
        <h2>{ANNIVERSARY_CELEBRATION_EXPERIENCE_TITLE}</h2>
        <p>{ANNIVERSARY_CELEBRATION_EXPERIENCE_SUBCOPY}</p>
      </header>

      <section className="anniversary-celebration-experience__overview concierge-consultant-card--glass">
        <p className="anniversary-celebration-experience__labels">
          {CELEBRATIONS_LABEL} · {THOUGHTFUL_MOMENTS_LABEL} · {JOURNEY_MEMORIES_LABEL}
        </p>
        <p className="anniversary-celebration-experience__fulfillment">
          {ANNIVERSARY_CELEBRATION_FULFILLMENT_COPY}
        </p>

        <div className="anniversary-celebration-experience__milestones">
          <h3>Celebrations</h3>
          <div className="anniversary-celebration-experience__grid">
            {ANNIVERSARY_CELEBRATION_DEFINITIONS.map((celebration) => (
              <MilestoneCelebrationCard
                key={celebration.id}
                celebrationId={celebration.id}
                highlighted={highlightedCelebrationId === celebration.id}
              />
            ))}
          </div>
        </div>

        <div className="anniversary-celebration-experience__future">
          <h3>Future ready</h3>
          <ul>
            {ANNIVERSARY_CELEBRATION_FUTURE_CAPABILITIES.map((capability) => (
              <li key={capability.id}>
                <strong>{capability.label}</strong>
                <span>{capability.description}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="anniversary-celebration-experience__reserved">
          {ANNIVERSARY_CELEBRATION_RESERVED_COPY}
        </p>
      </section>

      <AnniversaryMemoryCard entries={timelineEntries} />

      <section className="anniversary-celebration-experience__timeline-card concierge-consultant-card--glass cc-reveal">
        <header className="concierge-consultant-card__head">
          <h3>{CELEBRATIONS_LABEL}</h3>
          <p>{THOUGHTFUL_MOMENTS_LABEL}</p>
        </header>
        <CelebrationTimeline entries={timelineEntries} />
      </section>
    </div>
  );
}
