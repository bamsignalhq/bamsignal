import { navigateToPath } from "../../constants/routes";
import { signalEventsPathForCity } from "../../constants/signalEventsRoutes";
import type { CityCommunityViewModel } from "../../utils/signalEventsLogic";

type CityCommunityCardProps = {
  city: CityCommunityViewModel;
};

export function CityCommunityCard({ city }: CityCommunityCardProps) {
  return (
    <article className="se-city-community-card signal-events-glass">
      <div className="se-city-community-card__head">
        <h3>{city.name}</h3>
        <span className={`se-city-status se-city-status--${city.status}`}>{city.statusLabel}</span>
      </div>
      <p className="se-city-community-card__region">{city.regionLabel}</p>
      {city.diaspora ? (
        <p className="se-city-community-card__diaspora">Diaspora Community</p>
      ) : null}
      {city.upcomingCount ? (
        <p className="se-city-community-card__upcoming">
          {city.upcomingCount} upcoming gathering{city.upcomingCount === 1 ? "" : "s"} reserved
        </p>
      ) : null}
      <button
        type="button"
        className="se-city-community-card__cta"
        onClick={() => navigateToPath(signalEventsPathForCity(city.slug))}
      >
        View community
      </button>
    </article>
  );
}
