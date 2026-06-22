import {
  BAMSIGNAL_HOUSE_FORBIDDEN_COPY,
  DINNER_EXPERIENCE_LABEL
} from "../../../constants/familyTable";
import type { DinnerExperienceCardViewModel } from "../../../utils/familyTableLogic";

type DinnerExperienceCardProps = {
  dinner: DinnerExperienceCardViewModel;
};

export function DinnerExperienceCard({ dinner }: DinnerExperienceCardProps) {
  return (
    <article className="ftbl-dinner-card institute-glass">
      <header className="ftbl-dinner-card__head">
        <h3>{dinner.title}</h3>
        <span className="ftbl-dinner-card__badge">{DINNER_EXPERIENCE_LABEL}</span>
      </header>
      <p className="ftbl-dinner-card__description">{dinner.description}</p>
      <p className="ftbl-dinner-card__forbidden">
        Not {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="ftbl-dinner-card__status">{dinner.statusLabel}</p>
    </article>
  );
}
