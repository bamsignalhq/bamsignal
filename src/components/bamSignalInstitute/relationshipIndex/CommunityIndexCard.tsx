import {
  COMMUNITY_STRENGTH_LABEL,
  RELATIONSHIP_INDEX_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/relationshipIndex";
import type { RelationshipIndexViewModel } from "../../../utils/relationshipIndexLogic";

type CommunityIndexCardProps = {
  index: RelationshipIndexViewModel;
};

export function CommunityIndexCard({ index }: CommunityIndexCardProps) {
  return (
    <article className="rix-community-card institute-glass">
      <header className="rix-community-card__head">
        <h3>{index.title}</h3>
        <span className="rix-community-card__badge">{COMMUNITY_STRENGTH_LABEL}</span>
      </header>

      <p className="rix-community-card__labels">
        {RELATIONSHIP_INDEX_LABEL} · {UNDERSTANDING_RELATIONSHIPS_LABEL}
      </p>
      <p className="rix-community-card__year">Indicator year {index.indicatorYear}</p>
      <p className="rix-community-card__description">{index.description}</p>
      <p className="rix-community-card__status">{index.statusLabel}</p>
    </article>
  );
}
