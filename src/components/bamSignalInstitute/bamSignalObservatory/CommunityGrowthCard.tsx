import {
  COMMUNITIES_LABEL,
  OBSERVATORY_LABEL
} from "../../../constants/bamSignalObservatory";
import type { ObservatorySectionViewModel } from "../../../utils/bamSignalObservatoryLogic";

type CommunityGrowthCardProps = {
  section: ObservatorySectionViewModel;
};

export function CommunityGrowthCard({ section }: CommunityGrowthCardProps) {
  return (
    <article className="bso-community-card institute-glass">
      <header className="bso-community-card__head">
        <h3>{section.title}</h3>
        <span className="bso-community-card__badge">{COMMUNITIES_LABEL}</span>
      </header>

      <p className="bso-community-card__labels">{OBSERVATORY_LABEL}</p>
      <p className="bso-community-card__description">{section.description}</p>
      <p className="bso-community-card__status">{section.statusLabel}</p>
    </article>
  );
}
