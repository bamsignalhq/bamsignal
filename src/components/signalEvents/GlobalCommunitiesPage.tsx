import { useMemo } from "react";
import { GLOBAL_CITY_REGIONS } from "../../constants/globalCityNetwork";
import { COMMUNITY_LABEL, SIGNAL_EVENTS_TITLE } from "../../constants/signalEvents";
import { getSignalEventsHubBundle } from "../../utils/SignalEventsEngine";
import { CityCommunityCard } from "./CityCommunityCard";

export function GlobalCommunitiesPage() {
  const bundle = useMemo(() => getSignalEventsHubBundle(), []);

  return (
    <div className="se-communities-page">
      <header className="se-section-head se-communities-page__head">
        <p className="se-hub-page__eyebrow">{COMMUNITY_LABEL}</p>
        <h1>Global City Network</h1>
        <p>{SIGNAL_EVENTS_TITLE} communities across Nigeria and the diaspora.</p>
      </header>

      {GLOBAL_CITY_REGIONS.map((region) => {
        const cities = bundle.citiesByRegion[region.id] ?? [];
        if (!cities.length) return null;
        return (
          <section key={region.id} className="se-communities-page__region">
            <h2>{region.label}</h2>
            <div className="se-hub-page__grid se-hub-page__grid--cities">
              {cities.map((city) => (
                <CityCommunityCard key={city.slug} city={city} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
