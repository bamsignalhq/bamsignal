import { BAMSIGNAL_HOUSE_FORBIDDEN_COPY, MASTERCLASS_LABEL } from "../../../constants/houseAcademy";
import type { MasterclassCardViewModel } from "../../../utils/houseAcademyLogic";

type MasterclassCardProps = {
  masterclass: MasterclassCardViewModel;
};

export function MasterclassCard({ masterclass }: MasterclassCardProps) {
  return (
    <article className="hacd-masterclass-card institute-glass">
      <header className="hacd-masterclass-card__head">
        <h3>{masterclass.title}</h3>
        <span className="hacd-masterclass-card__badge">{MASTERCLASS_LABEL}</span>
      </header>
      <p className="hacd-masterclass-card__order">Program {masterclass.programOrder}</p>
      <p className="hacd-masterclass-card__description">{masterclass.description}</p>
      <p className="hacd-masterclass-card__forbidden">
        Not {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="hacd-masterclass-card__status">{masterclass.statusLabel}</p>
    </article>
  );
}
