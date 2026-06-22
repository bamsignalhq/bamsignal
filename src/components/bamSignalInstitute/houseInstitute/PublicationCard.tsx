import { BAMSIGNAL_HOUSE_FORBIDDEN_COPY, PUBLICATION_LABEL } from "../../../constants/houseInstitute";
import type { PublicationCardViewModel } from "../../../utils/houseInstituteLogic";

type PublicationCardProps = {
  publication: PublicationCardViewModel;
};

export function PublicationCard({ publication }: PublicationCardProps) {
  return (
    <article className="hins-publication-card institute-glass">
      <header className="hins-publication-card__head">
        <h3>{publication.title}</h3>
        <span className="hins-publication-card__badge">{PUBLICATION_LABEL}</span>
      </header>
      <p className="hins-publication-card__order">Program {publication.programOrder}</p>
      <p className="hins-publication-card__description">{publication.description}</p>
      <p className="hins-publication-card__forbidden">
        Not {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="hins-publication-card__status">{publication.statusLabel}</p>
    </article>
  );
}
