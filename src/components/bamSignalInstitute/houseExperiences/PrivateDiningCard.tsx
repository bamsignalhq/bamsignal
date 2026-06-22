import {
  BAMSIGNAL_HOUSE_FORBIDDEN_COPY,
  PRIVATE_DINING_LABEL
} from "../../../constants/houseExperiences";
import type { PrivateDiningViewModel } from "../../../utils/houseExperiencesLogic";

type PrivateDiningCardProps = {
  dining: PrivateDiningViewModel;
};

export function PrivateDiningCard({ dining }: PrivateDiningCardProps) {
  return (
    <article className="hexp-dining-card institute-glass">
      <header className="hexp-dining-card__head">
        <h3>{dining.title}</h3>
        <span className="hexp-dining-card__badge">{PRIVATE_DINING_LABEL}</span>
      </header>
      <p className="hexp-dining-card__description">{dining.description}</p>
      <p className="hexp-dining-card__forbidden">
        Not {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="hexp-dining-card__status">{dining.statusLabel}</p>
    </article>
  );
}
