import {
  BAMSIGNAL_HOUSE_FORBIDDEN_COPY,
  HOUSE_LOCATION_LABEL
} from "../../../constants/bamSignalHouse";
import type { HouseLocationViewModel } from "../../../utils/bamSignalHouseLogic";

type HouseLocationCardProps = {
  location: HouseLocationViewModel;
};

export function HouseLocationCard({ location }: HouseLocationCardProps) {
  return (
    <article className="bsho-location-card institute-glass">
      <header className="bsho-location-card__head">
        <h3>{location.title}</h3>
        <span className="bsho-location-card__badge">{HOUSE_LOCATION_LABEL}</span>
      </header>
      <p className="bsho-location-card__description">{location.description}</p>
      <p className="bsho-location-card__forbidden">
        Not {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="bsho-location-card__status">{location.statusLabel}</p>
    </article>
  );
}
