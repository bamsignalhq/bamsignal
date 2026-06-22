import { EXPERIENCE_LABEL } from "../../../constants/relationshipConnect";
import type { ExperienceViewModel } from "../../../utils/relationshipConnectLogic";

type ExperienceCardProps = {
  experience: ExperienceViewModel;
};

export function ExperienceCard({ experience }: ExperienceCardProps) {
  return (
    <article className="rconn-experience-card institute-glass">
      <header className="rconn-experience-card__head">
        <h3>{experience.title}</h3>
        <span className="rconn-experience-card__badge">{EXPERIENCE_LABEL}</span>
      </header>
      <p className="rconn-experience-card__description">{experience.description}</p>
      <p className="rconn-experience-card__status">{experience.statusLabel}</p>
    </article>
  );
}
