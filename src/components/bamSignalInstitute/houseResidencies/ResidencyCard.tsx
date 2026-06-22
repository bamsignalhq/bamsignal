import { BAMSIGNAL_HOUSE_FORBIDDEN_COPY, RESIDENCY_LABEL } from "../../../constants/houseResidencies";
import type { ResidencyCardViewModel } from "../../../utils/houseResidenciesLogic";

type ResidencyCardProps = {
  residency: ResidencyCardViewModel;
};

export function ResidencyCard({ residency }: ResidencyCardProps) {
  return (
    <article className="hres-residency-card institute-glass">
      <header className="hres-residency-card__head">
        <h3>{residency.title}</h3>
        <span className="hres-residency-card__badge">{RESIDENCY_LABEL}</span>
      </header>
      <p className="hres-residency-card__order">Program {residency.programOrder}</p>
      <p className="hres-residency-card__description">{residency.description}</p>
      <p className="hres-residency-card__forbidden">
        Not {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="hres-residency-card__status">{residency.statusLabel}</p>
    </article>
  );
}
