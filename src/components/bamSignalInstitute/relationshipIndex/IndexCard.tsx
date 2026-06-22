import {
  FAMILY_VALUES_LABEL,
  RELATIONSHIP_INDEX_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/relationshipIndex";
import type { RelationshipIndexViewModel } from "../../../utils/relationshipIndexLogic";

type IndexCardProps = {
  index: RelationshipIndexViewModel;
};

export function IndexCard({ index }: IndexCardProps) {
  return (
    <article className="rix-index-card institute-glass">
      <header className="rix-index-card__head">
        <h3>{index.title}</h3>
        <span className="rix-index-card__badge">{RELATIONSHIP_INDEX_LABEL}</span>
      </header>

      <p className="rix-index-card__labels">
        {FAMILY_VALUES_LABEL} · {UNDERSTANDING_RELATIONSHIPS_LABEL}
      </p>
      <p className="rix-index-card__year">Indicator year {index.indicatorYear}</p>
      <p className="rix-index-card__description">{index.description}</p>
      <p className="rix-index-card__status">{index.statusLabel}</p>
    </article>
  );
}
