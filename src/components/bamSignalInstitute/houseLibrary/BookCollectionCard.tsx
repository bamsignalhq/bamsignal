import {
  BAMSIGNAL_HOUSE_FORBIDDEN_COPY,
  BOOK_COLLECTION_LABEL
} from "../../../constants/houseLibrary";
import type { BookCollectionCardViewModel } from "../../../utils/houseLibraryLogic";

type BookCollectionCardProps = {
  collection: BookCollectionCardViewModel;
};

export function BookCollectionCard({ collection }: BookCollectionCardProps) {
  return (
    <article className="hlib-book-card institute-glass">
      <header className="hlib-book-card__head">
        <h3>{collection.title}</h3>
        <span className="hlib-book-card__badge">{BOOK_COLLECTION_LABEL}</span>
      </header>
      <p className="hlib-book-card__description">{collection.description}</p>
      <p className="hlib-book-card__forbidden">
        Not {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="hlib-book-card__status">{collection.statusLabel}</p>
    </article>
  );
}
