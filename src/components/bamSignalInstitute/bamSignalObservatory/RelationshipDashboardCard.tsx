import {
  OBSERVATORY_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/bamSignalObservatory";
import type { ObservatorySectionViewModel } from "../../../utils/bamSignalObservatoryLogic";

type RelationshipDashboardCardProps = {
  section: ObservatorySectionViewModel;
};

export function RelationshipDashboardCard({ section }: RelationshipDashboardCardProps) {
  return (
    <article className="bso-dashboard-card institute-glass">
      <header className="bso-dashboard-card__head">
        <h3>{section.title}</h3>
        <span className="bso-dashboard-card__badge">{OBSERVATORY_LABEL}</span>
      </header>

      <p className="bso-dashboard-card__labels">{UNDERSTANDING_RELATIONSHIPS_LABEL}</p>
      <p className="bso-dashboard-card__description">{section.description}</p>
      <p className="bso-dashboard-card__status">{section.statusLabel}</p>
    </article>
  );
}
