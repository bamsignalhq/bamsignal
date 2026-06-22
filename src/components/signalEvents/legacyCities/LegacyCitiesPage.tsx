import { useMemo } from "react";
import {
  COMMUNITY_JOURNEY_LABEL,
  COMMUNITY_MATURITY_LEVELS,
  GROWING_TOGETHER_LABEL,
  LEGACY_CITIES_PURPOSE_COPY,
  LEGACY_CITIES_RESERVED_COPY,
  LEGACY_CITIES_SUBCOPY,
  LEGACY_CITIES_TITLE,
  LEGACY_CITY_FUTURE_CAPABILITIES,
  LEGACY_CITY_LABEL,
  PREPARED_LEGACY_CITIES
} from "../../../constants/legacyCities";
import { getLegacyCitiesBundle } from "../../../utils/LegacyCitiesEngine";
import { LegacyCityBadge } from "./LegacyCityBadge";
import { LegacyCityCard } from "./LegacyCityCard";
import { LegacyCityTimeline } from "./LegacyCityTimeline";

export function LegacyCitiesPage() {
  const bundle = useMemo(() => getLegacyCitiesBundle(), []);

  return (
    <div className="lc-page">
      <header className="lc-page__hero signal-events-glass">
        <p className="se-hub-page__eyebrow">{COMMUNITY_JOURNEY_LABEL}</p>
        <h1>{LEGACY_CITIES_TITLE}</h1>
        <p>{LEGACY_CITIES_SUBCOPY}</p>
        <p className="lc-page__labels">
          {LEGACY_CITY_LABEL} · {GROWING_TOGETHER_LABEL}
        </p>
        <p className="lc-page__purpose">{LEGACY_CITIES_PURPOSE_COPY}</p>
      </header>

      <section className="lc-page__levels signal-events-glass">
        <h2>Community levels</h2>
        <p>Maturity stages — never a leaderboard.</p>
        <ul className="lc-page__level-list">
          {COMMUNITY_MATURITY_LEVELS.map((level) => (
            <li key={level.id}>
              <LegacyCityBadge level={level.id} />
              <span>{level.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="lc-page__prepared signal-events-glass">
        <h2>Prepared legacy cities</h2>
        <p>Architecture preview — alphabetical, not ranked.</p>
        <ul className="lc-page__prepared-list">
          {PREPARED_LEGACY_CITIES.map((city) => (
            <li key={city.slug}>
              <strong>{city.title}</strong>
              <span>{city.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="lc-page__section">
        <header className="se-section-head">
          <h2>Legacy cities</h2>
          <p>Long-term community identity — growing together.</p>
        </header>
        <div className="lc-page__grid">
          {bundle.cities.map((city) => (
            <LegacyCityCard key={city.slug} city={city} />
          ))}
        </div>
      </section>

      {bundle.cities.map((city) => (
        <LegacyCityTimeline
          key={`${city.slug}-timeline`}
          title={city.title}
          entries={bundle.timelinesByCitySlug[city.slug] ?? []}
        />
      ))}

      <section className="lc-page__future signal-events-glass">
        <h2>Future preparation</h2>
        <ul>
          {LEGACY_CITY_FUTURE_CAPABILITIES.map((capability) => (
            <li key={capability.id}>
              <strong>{capability.label}</strong>
              <span>{capability.description}</span>
            </li>
          ))}
        </ul>
        <p className="lc-page__reserved">{LEGACY_CITIES_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
