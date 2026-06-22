import {
  BAMSIGNAL_HOUSE_FORBIDDEN_COPY,
  PODCAST_COLLECTION_LABEL
} from "../../../constants/houseLibrary";
import type { PodcastCollectionCardViewModel } from "../../../utils/houseLibraryLogic";

type PodcastCollectionCardProps = {
  collection: PodcastCollectionCardViewModel;
};

export function PodcastCollectionCard({ collection }: PodcastCollectionCardProps) {
  return (
    <article className="hlib-podcast-card institute-glass">
      <header className="hlib-podcast-card__head">
        <h3>{collection.title}</h3>
        <span className="hlib-podcast-card__badge">{PODCAST_COLLECTION_LABEL}</span>
      </header>
      <p className="hlib-podcast-card__description">{collection.description}</p>
      <p className="hlib-podcast-card__forbidden">
        Not {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="hlib-podcast-card__status">{collection.statusLabel}</p>
    </article>
  );
}
