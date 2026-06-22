import { BAMSIGNAL_SUMMIT_FORBIDDEN_COPY, SUMMIT_EXPERIENCE_LABEL } from "../../../constants/bamSignalSummit";
import type { SummitExperienceViewModel } from "../../../utils/bamSignalSummitLogic";

type SummitExperienceCardProps = {
  experience: SummitExperienceViewModel;
};

export function SummitExperienceCard({ experience }: SummitExperienceCardProps) {
  return (
    <article className="bsmt-experience-card institute-glass">
      <header className="bsmt-experience-card__head">
        <h3>{experience.title}</h3>
        <span className="bsmt-experience-card__badge">{SUMMIT_EXPERIENCE_LABEL}</span>
      </header>
      <p className="bsmt-experience-card__description">{experience.description}</p>
      <p className="bsmt-experience-card__forbidden">
        Not {BAMSIGNAL_SUMMIT_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="bsmt-experience-card__status">{experience.statusLabel}</p>
    </article>
  );
}
