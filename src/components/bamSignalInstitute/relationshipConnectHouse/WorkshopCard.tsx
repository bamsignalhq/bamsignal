import {
  BAMSIGNAL_HOUSE_FORBIDDEN_COPY,
  CONNECT_HOUSE_WORKSHOP_LABEL,
  RELATIONSHIP_CONNECT_FORBIDDEN_COPY
} from "../../../constants/relationshipConnectHouse";
import type { ConnectHouseWorkshopCardViewModel } from "../../../utils/relationshipConnectHouseLogic";

type WorkshopCardProps = {
  workshop: ConnectHouseWorkshopCardViewModel;
};

export function WorkshopCard({ workshop }: WorkshopCardProps) {
  return (
    <article className="rchp-workshop-card institute-glass">
      <header className="rchp-workshop-card__head">
        <h3>{workshop.title}</h3>
        <span className="rchp-workshop-card__badge">{CONNECT_HOUSE_WORKSHOP_LABEL}</span>
      </header>
      <p className="rchp-workshop-card__description">{workshop.description}</p>
      <p className="rchp-workshop-card__forbidden">
        Not {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}. Not{" "}
        {RELATIONSHIP_CONNECT_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="rchp-workshop-card__status">{workshop.statusLabel}</p>
    </article>
  );
}
