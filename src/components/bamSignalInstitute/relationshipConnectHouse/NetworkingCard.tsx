import {
  BAMSIGNAL_HOUSE_FORBIDDEN_COPY,
  CONNECT_HOUSE_NETWORKING_LABEL,
  RELATIONSHIP_CONNECT_FORBIDDEN_COPY
} from "../../../constants/relationshipConnectHouse";
import type { ConnectHouseNetworkingCardViewModel } from "../../../utils/relationshipConnectHouseLogic";

type NetworkingCardProps = {
  networking: ConnectHouseNetworkingCardViewModel;
};

export function NetworkingCard({ networking }: NetworkingCardProps) {
  return (
    <article className="rchp-networking-card institute-glass">
      <header className="rchp-networking-card__head">
        <h3>{networking.title}</h3>
        <span className="rchp-networking-card__badge">{CONNECT_HOUSE_NETWORKING_LABEL}</span>
      </header>
      <p className="rchp-networking-card__description">{networking.description}</p>
      <p className="rchp-networking-card__forbidden">
        Not {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}. Not{" "}
        {RELATIONSHIP_CONNECT_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="rchp-networking-card__status">{networking.statusLabel}</p>
    </article>
  );
}
