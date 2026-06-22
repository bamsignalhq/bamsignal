import {
  BAMSIGNAL_HOUSE_FORBIDDEN_COPY,
  FAMILY_RESIDENCE_LABEL
} from "../../../constants/houseResidencies";
import type { FamilyResidenceCardViewModel } from "../../../utils/houseResidenciesLogic";

type FamilyResidenceCardProps = {
  residence: FamilyResidenceCardViewModel;
};

export function FamilyResidenceCard({ residence }: FamilyResidenceCardProps) {
  return (
    <article className="hres-family-card institute-glass">
      <header className="hres-family-card__head">
        <h3>{residence.title}</h3>
        <span className="hres-family-card__badge">{FAMILY_RESIDENCE_LABEL}</span>
      </header>
      <p className="hres-family-card__order">Program {residence.programOrder}</p>
      <p className="hres-family-card__description">{residence.description}</p>
      <p className="hres-family-card__forbidden">
        Not {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="hres-family-card__status">{residence.statusLabel}</p>
    </article>
  );
}
