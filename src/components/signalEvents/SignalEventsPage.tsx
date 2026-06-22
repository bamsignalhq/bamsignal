import { useMemo } from "react";
import {
  CELEBRATING_LOVE_LABEL,
  COMMUNITY_LABEL,
  MEET_NEW_PEOPLE_LABEL,
  SIGNAL_EVENT_FUTURE_CAPABILITIES,
  SIGNAL_EVENT_TYPES,
  SIGNAL_EVENTS_RESERVED_COPY,
  SIGNAL_EVENTS_SUBCOPY,
  SIGNAL_EVENTS_TITLE
} from "../../constants/signalEvents";
import { navigateToPath } from "../../constants/routes";
import { signalEventsPathForHub } from "../../constants/signalEventsRoutes";
import { getSignalEventsHubBundle } from "../../utils/SignalEventsEngine";
import { CityCommunityCard } from "./CityCommunityCard";
import { EventCategoryCard } from "./EventCategoryCard";
import { UpcomingEventsCard } from "./UpcomingEventsCard";

export function SignalEventsPage() {
  const bundle = useMemo(() => getSignalEventsHubBundle(), []);

  return (
    <div className="se-hub-page">
      <header className="se-hub-page__hero signal-events-glass">
        <p className="se-hub-page__eyebrow">{COMMUNITY_LABEL}</p>
        <h1>{SIGNAL_EVENTS_TITLE}</h1>
        <p>{SIGNAL_EVENTS_SUBCOPY}</p>
        <p className="se-hub-page__labels">
          {MEET_NEW_PEOPLE_LABEL} · {CELEBRATING_LOVE_LABEL}
        </p>
        <div className="se-hub-page__actions">
          <button
            type="button"
            className="se-hub-page__btn se-hub-page__btn--primary"
            onClick={() => navigateToPath(signalEventsPathForHub("communities"))}
          >
            Global communities
          </button>
          <button
            type="button"
            className="se-hub-page__btn"
            onClick={() => navigateToPath(signalEventsPathForHub("diaspora"))}
          >
            Diaspora cities
          </button>
          <button
            type="button"
            className="se-hub-page__btn"
            onClick={() => navigateToPath(signalEventsPathForHub("diasporaCorridors"))}
          >
            Diaspora Corridors
          </button>
          <button
            type="button"
            className="se-hub-page__btn"
            onClick={() => navigateToPath(signalEventsPathForHub("communityJourney"))}
          >
            Community Journey
          </button>
          <button
            type="button"
            className="se-hub-page__btn"
            onClick={() => navigateToPath(signalEventsPathForHub("corridorStories"))}
          >
            Corridor Stories
          </button>
        </div>
      </header>

      <section className="se-hub-page__section">
        <header className="se-section-head">
          <h2>Featured communities</h2>
          <p>Local Signal Events™ landing pages — architecture prepared.</p>
        </header>
        <div className="se-hub-page__grid se-hub-page__grid--cities">
          {bundle.featuredCities.map((city) => (
            <CityCommunityCard key={city.slug} city={city} />
          ))}
        </div>
      </section>

      <UpcomingEventsCard events={bundle.upcomingEvents} />

      <section className="se-hub-page__section">
        <header className="se-section-head">
          <h2>Gathering types</h2>
          <p>Warm, human, elegant — never a party crowd.</p>
        </header>
        <div className="se-hub-page__grid se-hub-page__grid--categories">
          {SIGNAL_EVENT_TYPES.map((event) => (
            <EventCategoryCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      <section className="se-hub-page__future signal-events-glass">
        <h2>Future ready</h2>
        <ul>
          {SIGNAL_EVENT_FUTURE_CAPABILITIES.map((capability) => (
            <li key={capability.id}>
              <strong>{capability.label}</strong>
              <span>{capability.description}</span>
            </li>
          ))}
        </ul>
        <p className="se-hub-page__reserved">{SIGNAL_EVENTS_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
