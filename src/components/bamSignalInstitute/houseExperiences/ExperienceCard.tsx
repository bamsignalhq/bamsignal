import {
  BAMSIGNAL_HOUSE_FORBIDDEN_COPY,
  EXPERIENCE_CARD_LABEL
} from "../../../constants/houseExperiences";
import type { ExperienceCardViewModel } from "../../../utils/houseExperiencesLogic";

type ExperienceCardProps = {
  experience: ExperienceCardViewModel;
};

export function ExperienceCard({ experience }: ExperienceCardProps) {
  return (
    <article className="hexp-experience-card institute-glass">
      <header className="hexp-experience-card__head">
        <h3>{experience.title}</h3>
        <span className="hexp-experience-card__badge">{EXPERIENCE_CARD_LABEL}</span>
      </header>
      <p className="hexp-experience-card__description">{experience.description}</p>
      <p className="hexp-experience-card__forbidden">
        Not {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="hexp-experience-card__status">{experience.statusLabel}</p>
    </article>
  );
}
