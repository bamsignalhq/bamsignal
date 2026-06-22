import { useMemo } from "react";
import {
  CELEBRATING_LOVE_LABEL,
  COMMUNITY_LABEL,
  MEET_NEW_PEOPLE_LABEL,
  SIGNAL_EVENTS_RESERVED_COPY
} from "../../constants/signalEvents";
import { navigateToPath } from "../../constants/routes";
import { signalEventsPathForHub } from "../../constants/signalEventsRoutes";
import { getSignalEventsCityBundle } from "../../utils/SignalEventsEngine";
import { EventCategoryCard } from "./EventCategoryCard";
import { SIGNAL_EVENT_TYPES } from "../../constants/signalEvents";
import { UpcomingEventsCard } from "./UpcomingEventsCard";

type CityEventsPageProps = {
  citySlug: string;
};

export function CityEventsPage({ citySlug }: CityEventsPageProps) {
  const bundle = useMemo(() => getSignalEventsCityBundle(citySlug), [citySlug]);

  if (!bundle) {
    return (
      <div className="se-city-page">
        <section className="signal-events-glass se-city-page__missing">
          <h1>Community not found</h1>
          <p>This city landing page is not available yet.</p>
          <button
            type="button"
            className="se-hub-page__btn"
            onClick={() => navigateToPath(signalEventsPathForHub("landing"))}
          >
            Back to Signal Events™
          </button>
        </section>
      </div>
    );
  }

  const { city, upcomingEvents } = bundle;

  return (
    <div className="se-city-page">
      <header className="se-city-page__hero signal-events-glass">
        <p className="se-hub-page__eyebrow">{COMMUNITY_LABEL}</p>
        <h1>{city.name}</h1>
        <p>
          {MEET_NEW_PEOPLE_LABEL} · {CELEBRATING_LOVE_LABEL}
        </p>
        <div className="se-city-page__meta">
          <span>{city.regionLabel}</span>
          <span className={`se-city-status se-city-status--${city.status}`}>{city.statusLabel}</span>
          {city.diaspora ? <span>Diaspora Community</span> : null}
        </div>
      </header>

      <UpcomingEventsCard
        events={upcomingEvents}
        title={`Upcoming gatherings in ${city.name}`}
      />

      <section className="se-hub-page__section">
        <header className="se-section-head">
          <h2>Gathering types</h2>
          <p>Reserved experiences for {city.name}.</p>
        </header>
        <div className="se-hub-page__grid se-hub-page__grid--categories">
          {SIGNAL_EVENT_TYPES.slice(0, 6).map((event) => (
            <EventCategoryCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      <p className="se-city-page__reserved">{SIGNAL_EVENTS_RESERVED_COPY}</p>
    </div>
  );
}
