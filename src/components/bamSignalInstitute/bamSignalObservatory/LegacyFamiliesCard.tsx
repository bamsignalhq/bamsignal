import {
  LEGACY_LABEL,
  OBSERVATORY_LABEL
} from "../../../constants/bamSignalObservatory";
import type { ObservatorySectionViewModel } from "../../../utils/bamSignalObservatoryLogic";

type LegacyFamiliesCardProps = {
  section: ObservatorySectionViewModel;
};

export function LegacyFamiliesCard({ section }: LegacyFamiliesCardProps) {
  return (
    <article className="bso-legacy-card institute-glass">
      <header className="bso-legacy-card__head">
        <h3>{section.title}</h3>
        <span className="bso-legacy-card__badge">{LEGACY_LABEL}</span>
      </header>

      <p className="bso-legacy-card__labels">{OBSERVATORY_LABEL}</p>
      <p className="bso-legacy-card__description">{section.description}</p>
      <p className="bso-legacy-card__status">{section.statusLabel}</p>
    </article>
  );
}
