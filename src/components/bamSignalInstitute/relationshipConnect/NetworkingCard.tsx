import { NETWORKING_LABEL } from "../../../constants/relationshipConnect";
import type { NetworkingViewModel } from "../../../utils/relationshipConnectLogic";

type NetworkingCardProps = {
  networking: NetworkingViewModel;
};

export function NetworkingCard({ networking }: NetworkingCardProps) {
  return (
    <article className="rconn-networking-card institute-glass">
      <header className="rconn-networking-card__head">
        <h3>{networking.title}</h3>
        <span className="rconn-networking-card__badge">{NETWORKING_LABEL}</span>
      </header>
      <p className="rconn-networking-card__description">{networking.description}</p>
      <p className="rconn-networking-card__status">{networking.statusLabel}</p>
    </article>
  );
}
