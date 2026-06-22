import {
  JOURNEY_CONTINUITY_TIMELINE_SUBCOPY,
  JOURNEY_CONTINUITY_TIMELINE_TITLE
} from "../../../constants/conciergeJourneyContinuity";
import type { JourneyContinuityEvent } from "../../../utils/conciergeJourneyContinuity";

type JourneyContinuityTimelineProps = {
  events: JourneyContinuityEvent[];
};

export function JourneyContinuityTimeline({ events }: JourneyContinuityTimelineProps) {
  if (!events.length) {
    return (
      <section className="journey-continuity-timeline concierge-consultant-card concierge-consultant-card--glass cc-reveal">
        <header className="concierge-consultant-card__head">
          <h3>{JOURNEY_CONTINUITY_TIMELINE_TITLE}</h3>
          <p>{JOURNEY_CONTINUITY_TIMELINE_SUBCOPY}</p>
        </header>
        <p className="concierge-consultant__empty">No continuity events yet.</p>
      </section>
    );
  }

  return (
    <section className="journey-continuity-timeline concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>{JOURNEY_CONTINUITY_TIMELINE_TITLE}</h3>
        <p>{JOURNEY_CONTINUITY_TIMELINE_SUBCOPY}</p>
      </header>
      <ol className="journey-continuity-timeline__list">
        {events.map((event, index) => (
          <li
            key={event.id}
            className={`journey-continuity-timeline__item journey-continuity-timeline__item--${event.kind} cc-reveal`}
            style={{ animationDelay: `${index * 35}ms` }}
          >
            <div className="journey-continuity-timeline__dot" aria-hidden />
            <div className="journey-continuity-timeline__body">
              <p className="journey-continuity-timeline__label">{event.label}</p>
              {event.detail ? (
                <p className="journey-continuity-timeline__detail">{event.detail}</p>
              ) : null}
              <time dateTime={event.at}>{new Date(event.at).toLocaleString()}</time>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
