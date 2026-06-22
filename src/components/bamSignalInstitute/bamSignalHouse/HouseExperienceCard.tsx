import {
  BAMSIGNAL_HOUSE_FORBIDDEN_COPY,
  HOUSE_EXPERIENCE_LABEL
} from "../../../constants/bamSignalHouse";
import type { HouseExperienceViewModel } from "../../../utils/bamSignalHouseLogic";

type HouseExperienceCardProps = {
  experience: HouseExperienceViewModel;
};

export function HouseExperienceCard({ experience }: HouseExperienceCardProps) {
  return (
    <article className="bsho-experience-card institute-glass">
      <header className="bsho-experience-card__head">
        <h3>{experience.title}</h3>
        <span className="bsho-experience-card__badge">{HOUSE_EXPERIENCE_LABEL}</span>
      </header>
      <p className="bsho-experience-card__description">{experience.description}</p>
      <p className="bsho-experience-card__forbidden">
        Not {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="bsho-experience-card__status">{experience.statusLabel}</p>
    </article>
  );
}
