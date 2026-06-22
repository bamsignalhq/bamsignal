import {
  BAMSIGNAL_LIBRARY_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "../../../constants/bamSignalLibrary";
import type { BookViewModel } from "../../../utils/bamSignalLibraryLogic";

type BookCardProps = {
  book: BookViewModel;
};

export function BookCard({ book }: BookCardProps) {
  return (
    <article className="bsl-book-card institute-glass">
      <header className="bsl-book-card__head">
        <h3>{book.title}</h3>
        <span className="bsl-book-card__badge">{BAMSIGNAL_LIBRARY_LABEL}</span>
      </header>

      <p className="bsl-book-card__labels">
        {LEARNING_LABEL} · {RELATIONSHIP_WISDOM_LABEL}
      </p>
      <p className="bsl-book-card__author">{book.author}</p>
      <p className="bsl-book-card__description">{book.description}</p>
      <p className="bsl-book-card__status">{book.statusLabel}</p>
    </article>
  );
}
