import {
  BAMSIGNAL_HOUSE_FORBIDDEN_COPY,
  GARDEN_EXPERIENCE_LABEL
} from "../../../constants/legacyGarden";
import type { GardenExperienceCardViewModel } from "../../../utils/legacyGardenLogic";

type GardenExperienceCardProps = {
  experience: GardenExperienceCardViewModel;
};

export function GardenExperienceCard({ experience }: GardenExperienceCardProps) {
  return (
    <article className="lgdn-experience-card institute-glass">
      <header className="lgdn-experience-card__head">
        <h3>{experience.title}</h3>
        <span className="lgdn-experience-card__badge">{GARDEN_EXPERIENCE_LABEL}</span>
      </header>
      <p className="lgdn-experience-card__description">{experience.description}</p>
      <p className="lgdn-experience-card__forbidden">
        Not {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="lgdn-experience-card__status">{experience.statusLabel}</p>
    </article>
  );
}
