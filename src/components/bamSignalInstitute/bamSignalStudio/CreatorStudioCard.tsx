import {
  BAMSIGNAL_HOUSE_FORBIDDEN_COPY,
  CREATOR_STUDIO_LABEL
} from "../../../constants/bamSignalStudio";
import type { CreatorStudioCardViewModel } from "../../../utils/bamSignalStudioLogic";

type CreatorStudioCardProps = {
  production: CreatorStudioCardViewModel;
};

export function CreatorStudioCard({ production }: CreatorStudioCardProps) {
  return (
    <article className="bstu-creator-card institute-glass">
      <header className="bstu-creator-card__head">
        <h3>{production.title}</h3>
        <span className="bstu-creator-card__badge">{CREATOR_STUDIO_LABEL}</span>
      </header>
      <p className="bstu-creator-card__description">{production.description}</p>
      <p className="bstu-creator-card__forbidden">
        Not {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="bstu-creator-card__status">{production.statusLabel}</p>
    </article>
  );
}
