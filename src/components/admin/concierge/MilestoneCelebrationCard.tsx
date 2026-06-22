import type { AnniversaryCelebrationId } from "../../../constants/anniversaryCelebrationExperience";
import { getAnniversaryCelebrationDefinition } from "../../../constants/anniversaryCelebrationExperience";

type MilestoneCelebrationCardProps = {
  celebrationId: AnniversaryCelebrationId;
  highlighted?: boolean;
};

export function MilestoneCelebrationCard({
  celebrationId,
  highlighted = false
}: MilestoneCelebrationCardProps) {
  const definition = getAnniversaryCelebrationDefinition(celebrationId);
  if (!definition) return null;

  return (
    <article
      className={`milestone-celebration-card${
        highlighted ? " milestone-celebration-card--highlighted" : ""
      }`}
    >
      <header className="milestone-celebration-card__head">
        <strong>{definition.label}</strong>
        <span className="milestone-celebration-card__status">Reserved</span>
      </header>
      <p className="milestone-celebration-card__display">{definition.displayLabel}</p>
      <p className="milestone-celebration-card__body">{definition.description}</p>
    </article>
  );
}
