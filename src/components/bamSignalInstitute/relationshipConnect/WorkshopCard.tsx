import { WORKSHOP_LABEL } from "../../../constants/relationshipConnect";
import type { WorkshopViewModel } from "../../../utils/relationshipConnectLogic";

type WorkshopCardProps = {
  workshop: WorkshopViewModel;
};

export function WorkshopCard({ workshop }: WorkshopCardProps) {
  return (
    <article className="rconn-workshop-card institute-glass">
      <header className="rconn-workshop-card__head">
        <h3>{workshop.title}</h3>
        <span className="rconn-workshop-card__badge">{WORKSHOP_LABEL}</span>
      </header>
      <p className="rconn-workshop-card__description">{workshop.description}</p>
      <p className="rconn-workshop-card__status">{workshop.statusLabel}</p>
    </article>
  );
}
