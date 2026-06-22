import {
  BAMSIGNAL_HOUSE_FORBIDDEN_COPY,
  CELEBRATION_EXPERIENCE_LABEL
} from "../../../constants/houseExperiences";
import type { CelebrationViewModel } from "../../../utils/houseExperiencesLogic";

type CelebrationCardProps = {
  celebration: CelebrationViewModel;
};

export function CelebrationCard({ celebration }: CelebrationCardProps) {
  return (
    <article className="hexp-celebration-card institute-glass">
      <header className="hexp-celebration-card__head">
        <h3>{celebration.title}</h3>
        <span className="hexp-celebration-card__badge">{CELEBRATION_EXPERIENCE_LABEL}</span>
      </header>
      <p className="hexp-celebration-card__description">{celebration.description}</p>
      <p className="hexp-celebration-card__forbidden">
        Not {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="hexp-celebration-card__status">{celebration.statusLabel}</p>
    </article>
  );
}
