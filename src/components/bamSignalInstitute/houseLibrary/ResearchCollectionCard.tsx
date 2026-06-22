import {
  BAMSIGNAL_HOUSE_FORBIDDEN_COPY,
  RESEARCH_COLLECTION_LABEL
} from "../../../constants/houseLibrary";
import type { ResearchCollectionCardViewModel } from "../../../utils/houseLibraryLogic";

type ResearchCollectionCardProps = {
  collection: ResearchCollectionCardViewModel;
};

export function ResearchCollectionCard({ collection }: ResearchCollectionCardProps) {
  return (
    <article className="hlib-research-card institute-glass">
      <header className="hlib-research-card__head">
        <h3>{collection.title}</h3>
        <span className="hlib-research-card__badge">{RESEARCH_COLLECTION_LABEL}</span>
      </header>
      <p className="hlib-research-card__description">{collection.description}</p>
      <p className="hlib-research-card__forbidden">
        Not {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="hlib-research-card__status">{collection.statusLabel}</p>
    </article>
  );
}
