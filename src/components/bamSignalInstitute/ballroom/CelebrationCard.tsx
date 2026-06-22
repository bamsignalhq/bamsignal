import {
  BALLROOM_CELEBRATION_LABEL,
  BAMSIGNAL_HOUSE_FORBIDDEN_COPY
} from "../../../constants/ballroom";
import type { CelebrationCardViewModel } from "../../../utils/ballroomLogic";

type CelebrationCardProps = {
  celebration: CelebrationCardViewModel;
};

export function CelebrationCard({ celebration }: CelebrationCardProps) {
  return (
    <article className="blrm-celebration-card institute-glass">
      <header className="blrm-celebration-card__head">
        <h3>{celebration.title}</h3>
        <span className="blrm-celebration-card__badge">{BALLROOM_CELEBRATION_LABEL}</span>
      </header>
      <p className="blrm-celebration-card__description">{celebration.description}</p>
      <p className="blrm-celebration-card__forbidden">
        Not {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="blrm-celebration-card__status">{celebration.statusLabel}</p>
    </article>
  );
}
