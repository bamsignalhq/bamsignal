import {
  FAITH_LEADER_LABEL,
  GROWING_TOGETHER_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "../../../constants/faithNetwork";
import type { FaithLeaderViewModel } from "../../../utils/faithNetworkLogic";

type FaithLeaderCardProps = {
  leader: FaithLeaderViewModel;
};

export function FaithLeaderCard({ leader }: FaithLeaderCardProps) {
  return (
    <article className="fnw-leader-card institute-glass">
      <header className="fnw-leader-card__head">
        <h3>{leader.name}</h3>
        <span className="fnw-leader-card__badge">{FAITH_LEADER_LABEL}</span>
      </header>

      <p className="fnw-leader-card__labels">
        {GROWING_TOGETHER_LABEL} · {RELATIONSHIP_WISDOM_LABEL}
      </p>
      <p className="fnw-leader-card__category">{leader.categoryTitle}</p>
      <p className="fnw-leader-card__title">{leader.title}</p>
      <p className="fnw-leader-card__focus">{leader.focus}</p>
      <p className="fnw-leader-card__status">{leader.statusLabel}</p>
    </article>
  );
}
