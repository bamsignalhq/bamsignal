import {
  INSIGHTS_LABEL,
  OBSERVATORY_LABEL
} from "../../../constants/bamSignalObservatory";
import type { ObservatorySectionViewModel } from "../../../utils/bamSignalObservatoryLogic";

type AnnualReportsCardProps = {
  section: ObservatorySectionViewModel;
};

export function AnnualReportsCard({ section }: AnnualReportsCardProps) {
  return (
    <article className="bso-reports-card institute-glass">
      <header className="bso-reports-card__head">
        <h3>{section.title}</h3>
        <span className="bso-reports-card__badge">{INSIGHTS_LABEL}</span>
      </header>

      <p className="bso-reports-card__labels">{OBSERVATORY_LABEL}</p>
      <p className="bso-reports-card__description">{section.description}</p>
      <p className="bso-reports-card__status">{section.statusLabel}</p>
    </article>
  );
}
