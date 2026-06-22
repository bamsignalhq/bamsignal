import { useMemo } from "react";
import { DIASPORA_COMMUNITY_LABEL, SIGNAL_EVENTS_TITLE } from "../../constants/signalEvents";
import { getDiasporaCommunitiesBundle } from "../../utils/SignalEventsEngine";
import { CityCommunityCard } from "./CityCommunityCard";

export function DiasporaCitiesPage() {
  const cities = useMemo(() => getDiasporaCommunitiesBundle(), []);

  return (
    <div className="se-diaspora-page">
      <header className="se-section-head se-diaspora-page__head">
        <p className="se-hub-page__eyebrow">{DIASPORA_COMMUNITY_LABEL}</p>
        <h1>Diaspora communities</h1>
        <p>
          {SIGNAL_EVENTS_TITLE} abroad — belonging, roots, and warm introductions.
        </p>
      </header>

      <div className="se-hub-page__grid se-hub-page__grid--cities">
        {cities.map((city) => (
          <CityCommunityCard key={city.slug} city={city} />
        ))}
      </div>
    </div>
  );
}
