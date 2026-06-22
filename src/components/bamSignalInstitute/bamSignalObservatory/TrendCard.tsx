import {
  OBSERVATORY_LABEL,
  RELATIONSHIP_TRENDS_LABEL
} from "../../../constants/bamSignalObservatory";
import type { ObservatorySectionViewModel } from "../../../utils/bamSignalObservatoryLogic";

type TrendCardProps = {
  section: ObservatorySectionViewModel;
};

export function TrendCard({ section }: TrendCardProps) {
  return (
    <article className="bso-trend-card institute-glass">
      <header className="bso-trend-card__head">
        <h3>{section.title}</h3>
        <span className="bso-trend-card__badge">{RELATIONSHIP_TRENDS_LABEL}</span>
      </header>

      <p className="bso-trend-card__labels">{OBSERVATORY_LABEL}</p>
      <p className="bso-trend-card__description">{section.description}</p>
      <p className="bso-trend-card__status">{section.statusLabel}</p>
    </article>
  );
}
