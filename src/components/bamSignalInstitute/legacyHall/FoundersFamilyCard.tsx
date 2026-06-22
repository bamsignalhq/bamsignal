import {
  BAMSIGNAL_HOUSE_FORBIDDEN_COPY,
  FOUNDERS_FAMILY_CARD_LABEL
} from "../../../constants/legacyHall";
import type { FoundersFamilyCardViewModel } from "../../../utils/legacyHallLogic";

type FoundersFamilyCardProps = {
  honour: FoundersFamilyCardViewModel;
};

export function FoundersFamilyCard({ honour }: FoundersFamilyCardProps) {
  return (
    <article className="lghal-family-card institute-glass">
      <header className="lghal-family-card__head">
        <h3>{honour.title}</h3>
        <span className="lghal-family-card__badge">{FOUNDERS_FAMILY_CARD_LABEL}</span>
      </header>
      <p className="lghal-family-card__description">{honour.description}</p>
      <p className="lghal-family-card__forbidden">
        Not {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="lghal-family-card__status">{honour.statusLabel}</p>
    </article>
  );
}
