import {
  BAMSIGNAL_HOUSE_FORBIDDEN_COPY,
  GOLDEN_ANNIVERSARY_CARD_LABEL
} from "../../../constants/legacyHall";
import type { GoldenAnniversaryCardViewModel } from "../../../utils/legacyHallLogic";

type GoldenAnniversaryCardProps = {
  honour: GoldenAnniversaryCardViewModel;
};

export function GoldenAnniversaryCard({ honour }: GoldenAnniversaryCardProps) {
  return (
    <article className="lghal-anniversary-card institute-glass">
      <header className="lghal-anniversary-card__head">
        <h3>{honour.title}</h3>
        <span className="lghal-anniversary-card__badge">{GOLDEN_ANNIVERSARY_CARD_LABEL}</span>
      </header>
      <p className="lghal-anniversary-card__description">{honour.description}</p>
      <p className="lghal-anniversary-card__forbidden">
        Not {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="lghal-anniversary-card__status">{honour.statusLabel}</p>
    </article>
  );
}
