import {
  COMMUNITY_JOURNEY_LABEL,
  GROWING_TOGETHER_LABEL,
  LEGACY_CITY_LABEL
} from "../../../constants/legacyCities";
import type { LegacyCityViewModel } from "../../../utils/legacyCitiesLogic";
import { LegacyCityBadge } from "./LegacyCityBadge";

type LegacyCityCardProps = {
  city: LegacyCityViewModel;
};

export function LegacyCityCard({ city }: LegacyCityCardProps) {
  return (
    <article className="lc-city-card signal-events-glass">
      <header className="lc-city-card__head">
        <h3>{city.title}</h3>
        <LegacyCityBadge level={city.communityLevel} primary />
      </header>

      <p className="lc-city-card__labels">
        {LEGACY_CITY_LABEL} · {COMMUNITY_JOURNEY_LABEL} · {GROWING_TOGETHER_LABEL}
      </p>

      <p className="lc-city-card__description">{city.description}</p>

      <dl className="lc-city-card__display">
        {city.displayRows.map((row) => (
          <div key={row.id} className="lc-city-card__row">
            <dt>{row.label}</dt>
            <dd>{row.value ?? "—"}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
