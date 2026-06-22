import {
  BAMSIGNAL_HOUSE_FORBIDDEN_COPY,
  LEGACY_COUPLE_CARD_LABEL
} from "../../../constants/legacyHall";
import type { LegacyCoupleCardViewModel } from "../../../utils/legacyHallLogic";

type LegacyCoupleCardProps = {
  honour: LegacyCoupleCardViewModel;
};

export function LegacyCoupleCard({ honour }: LegacyCoupleCardProps) {
  return (
    <article className="lghal-couple-card institute-glass">
      <header className="lghal-couple-card__head">
        <h3>{honour.title}</h3>
        <span className="lghal-couple-card__badge">{LEGACY_COUPLE_CARD_LABEL}</span>
      </header>
      <p className="lghal-couple-card__description">{honour.description}</p>
      <p className="lghal-couple-card__forbidden">
        Not {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="lghal-couple-card__status">{honour.statusLabel}</p>
    </article>
  );
}
