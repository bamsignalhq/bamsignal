import { BAMSIGNAL_HOUSE_FORBIDDEN_COPY, EXHIBIT_LABEL } from "../../../constants/houseMuseum";
import type { ExhibitCardViewModel } from "../../../utils/houseMuseumLogic";

type ExhibitCardProps = {
  exhibit: ExhibitCardViewModel;
};

export function ExhibitCard({ exhibit }: ExhibitCardProps) {
  return (
    <article className="hmsm-exhibit-card institute-glass">
      <header className="hmsm-exhibit-card__head">
        <h3>{exhibit.title}</h3>
        <span className="hmsm-exhibit-card__badge">{EXHIBIT_LABEL}</span>
      </header>
      <p className="hmsm-exhibit-card__order">Collection {exhibit.collectionOrder}</p>
      <p className="hmsm-exhibit-card__description">{exhibit.description}</p>
      <p className="hmsm-exhibit-card__forbidden">
        Not {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="hmsm-exhibit-card__status">{exhibit.statusLabel}</p>
    </article>
  );
}
