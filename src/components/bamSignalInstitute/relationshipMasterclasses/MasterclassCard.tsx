import {
  LEARNING_LABEL,
  MASTERCLASS_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "../../../constants/relationshipMasterclasses";
import type { MasterclassViewModel } from "../../../utils/relationshipMasterclassesLogic";

type MasterclassCardProps = {
  masterclass: MasterclassViewModel;
};

export function MasterclassCard({ masterclass }: MasterclassCardProps) {
  return (
    <article className="rmc-masterclass-card institute-glass">
      <header className="rmc-masterclass-card__head">
        <h3>{masterclass.title}</h3>
        <span className="rmc-masterclass-card__badge">{MASTERCLASS_LABEL}</span>
      </header>

      <p className="rmc-masterclass-card__labels">
        {LEARNING_LABEL} · {RELATIONSHIP_WISDOM_LABEL}
      </p>
      <p className="rmc-masterclass-card__speaker">{masterclass.speakerName}</p>
      <p className="rmc-masterclass-card__description">{masterclass.description}</p>
      <p className="rmc-masterclass-card__status">{masterclass.statusLabel}</p>
    </article>
  );
}
