import {
  COMMUNITIES_LABEL,
  OBSERVATORY_LABEL,
  RELATIONSHIP_TRENDS_LABEL
} from "../../../constants/bamSignalObservatory";
import type { ObservatorySectionViewModel } from "../../../utils/bamSignalObservatoryLogic";

type DiasporaCorridorCardProps = {
  section: ObservatorySectionViewModel;
};

export function DiasporaCorridorCard({ section }: DiasporaCorridorCardProps) {
  return (
    <article className="bso-diaspora-card institute-glass">
      <header className="bso-diaspora-card__head">
        <h3>{section.title}</h3>
        <span className="bso-diaspora-card__badge">{COMMUNITIES_LABEL}</span>
      </header>

      <p className="bso-diaspora-card__labels">
        {OBSERVATORY_LABEL} · {RELATIONSHIP_TRENDS_LABEL}
      </p>
      <p className="bso-diaspora-card__description">{section.description}</p>
      <p className="bso-diaspora-card__status">{section.statusLabel}</p>
    </article>
  );
}
