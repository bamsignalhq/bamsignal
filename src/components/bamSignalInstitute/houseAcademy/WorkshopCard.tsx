import { BAMSIGNAL_HOUSE_FORBIDDEN_COPY, WORKSHOP_LABEL } from "../../../constants/houseAcademy";
import type { WorkshopCardViewModel } from "../../../utils/houseAcademyLogic";

type WorkshopCardProps = {
  workshop: WorkshopCardViewModel;
};

export function WorkshopCard({ workshop }: WorkshopCardProps) {
  return (
    <article className="hacd-workshop-card institute-glass">
      <header className="hacd-workshop-card__head">
        <h3>{workshop.title}</h3>
        <span className="hacd-workshop-card__badge">{WORKSHOP_LABEL}</span>
      </header>
      <p className="hacd-workshop-card__order">Program {workshop.programOrder}</p>
      <p className="hacd-workshop-card__description">{workshop.description}</p>
      <p className="hacd-workshop-card__forbidden">
        Not {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="hacd-workshop-card__status">{workshop.statusLabel}</p>
    </article>
  );
}
