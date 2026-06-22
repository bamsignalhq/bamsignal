import {
  BAMSIGNAL_HOUSE_FORBIDDEN_COPY,
  LEGACY_DINNER_LABEL
} from "../../../constants/familyTable";
import type { LegacyDinnerCardViewModel } from "../../../utils/familyTableLogic";

type LegacyDinnerCardProps = {
  dinner: LegacyDinnerCardViewModel;
};

export function LegacyDinnerCard({ dinner }: LegacyDinnerCardProps) {
  return (
    <article className="ftbl-legacy-card institute-glass">
      <header className="ftbl-legacy-card__head">
        <h3>{dinner.title}</h3>
        <span className="ftbl-legacy-card__badge">{LEGACY_DINNER_LABEL}</span>
      </header>
      <p className="ftbl-legacy-card__description">{dinner.description}</p>
      <p className="ftbl-legacy-card__forbidden">
        Not {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="ftbl-legacy-card__status">{dinner.statusLabel}</p>
    </article>
  );
}
