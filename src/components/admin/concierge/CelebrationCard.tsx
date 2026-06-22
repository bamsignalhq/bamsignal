import {
  CELEBRATIONS_LABEL,
  JOURNEY_MEMORIES_LABEL,
  SURPRISE_DELIGHT_ARCHITECTURE_COPY,
  SURPRISE_DELIGHT_FUTURE_CAPABILITIES,
  SURPRISE_DELIGHT_PREPARED_EVENTS,
  SURPRISE_DELIGHT_RESERVED_COPY,
  SURPRISE_DELIGHT_SUBCOPY,
  SURPRISE_DELIGHT_TITLE,
  THOUGHTFUL_MOMENTS_LABEL,
  type SurpriseEventKind
} from "../../../constants/surpriseAndDelight";
import { LegacyCelebrationTimeline } from "./LegacyCelebrationTimeline";
import { SurpriseEventCard } from "./SurpriseEventCard";

type CelebrationCardProps = {
  showArchitecturePreview?: boolean;
  /** Optional — highlight one prepared celebration type. */
  highlightedEventId?: SurpriseEventKind;
};

export function CelebrationCard({
  showArchitecturePreview = false,
  highlightedEventId
}: CelebrationCardProps) {
  return (
    <div className="surprise-and-delight">
      <section className="celebration-card concierge-consultant-card--glass">
        <header className="concierge-consultant-card__head">
          <h3>{SURPRISE_DELIGHT_TITLE}</h3>
          <p>{SURPRISE_DELIGHT_SUBCOPY}</p>
        </header>

        <p className="celebration-card__labels">
          {CELEBRATIONS_LABEL} · {THOUGHTFUL_MOMENTS_LABEL} · {JOURNEY_MEMORIES_LABEL}
        </p>

        <p className="celebration-card__architecture">{SURPRISE_DELIGHT_ARCHITECTURE_COPY}</p>

        <div className="celebration-card__prepared">
          <h4>Prepared for</h4>
          <div className="celebration-card__event-grid">
            {SURPRISE_DELIGHT_PREPARED_EVENTS.map((event) => (
              <SurpriseEventCard
                key={event.id}
                eventId={event.id}
                highlighted={highlightedEventId === event.id}
              />
            ))}
          </div>
        </div>

        <div className="celebration-card__future">
          <h4>Future ready</h4>
          <ul>
            {SURPRISE_DELIGHT_FUTURE_CAPABILITIES.map((capability) => (
              <li key={capability.id}>
                <strong>{capability.label}</strong>
                <span>{capability.description}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="celebration-card__reserved">{SURPRISE_DELIGHT_RESERVED_COPY}</p>
      </section>

      <section className="legacy-celebration-timeline-card concierge-consultant-card--glass cc-reveal">
        <header className="concierge-consultant-card__head">
          <h3>{CELEBRATIONS_LABEL}</h3>
          <p>{THOUGHTFUL_MOMENTS_LABEL}</p>
        </header>
        <LegacyCelebrationTimeline showArchitecturePreview={showArchitecturePreview} />
      </section>
    </div>
  );
}
