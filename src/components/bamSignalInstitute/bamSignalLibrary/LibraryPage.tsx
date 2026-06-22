import { useMemo } from "react";
import {
  BAMSIGNAL_LIBRARY_FUTURE_CAPABILITIES,
  BAMSIGNAL_LIBRARY_LABEL,
  BAMSIGNAL_LIBRARY_PURPOSE_COPY,
  BAMSIGNAL_LIBRARY_RESERVED_COPY,
  BAMSIGNAL_LIBRARY_SUBCOPY,
  BAMSIGNAL_LIBRARY_TITLE,
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  PREPARED_LIBRARY_CATEGORIES,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/bamSignalLibrary";
import { getBamSignalLibraryBundle } from "../../../utils/BamSignalLibraryEngine";
import { BookCard } from "./BookCard";
import { PodcastCard } from "./PodcastCard";
import { ResourceCard } from "./ResourceCard";

export function LibraryPage() {
  const bundle = useMemo(() => getBamSignalLibraryBundle(), []);

  return (
    <div className="bsl-page">
      <header className="bsl-page__hero institute-glass">
        <p className="bi-page__eyebrow">{BAMSIGNAL_LIBRARY_LABEL}</p>
        <h1>{BAMSIGNAL_LIBRARY_TITLE}</h1>
        <p>{BAMSIGNAL_LIBRARY_SUBCOPY}</p>
        <p className="bsl-page__labels">
          {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} · {RELATIONSHIP_WISDOM_LABEL} ·{" "}
          {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="bsl-page__purpose">{BAMSIGNAL_LIBRARY_PURPOSE_COPY}</p>
      </header>

      <section className="bsl-page__prepared institute-glass">
        <h2>Prepared collections</h2>
        <p>{bundle.categoryCount} collections — architecture preview, not live yet.</p>
        <ul className="bsl-page__prepared-list">
          {PREPARED_LIBRARY_CATEGORIES.map((category) => (
            <li key={category.id}>
              <strong>{category.title}</strong>
              <span>{category.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="bsl-page__section">
        <header className="bi-section-head">
          <h2>Books</h2>
          <p>Curated reading prepared — not enabled yet.</p>
        </header>
        <div className="bsl-page__grid">
          {bundle.books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      <section className="bsl-page__section">
        <header className="bi-section-head">
          <h2>Podcasts</h2>
          <p>Listening collections prepared — not streaming yet.</p>
        </header>
        <div className="bsl-page__grid">
          {bundle.podcasts.map((podcast) => (
            <PodcastCard key={podcast.id} podcast={podcast} />
          ))}
        </div>
      </section>

      <section className="bsl-page__section">
        <header className="bi-section-head">
          <h2>Resources</h2>
          <p>Articles, videos, research, and family stories — prepared, not live yet.</p>
        </header>
        <div className="bsl-page__grid">
          {bundle.resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </section>

      <section className="bsl-page__future institute-glass">
        <h2>Future ready</h2>
        <ul>
          {BAMSIGNAL_LIBRARY_FUTURE_CAPABILITIES.map((capability) => (
            <li key={capability.id}>
              <strong>{capability.label}</strong>
              <span>{capability.description}</span>
            </li>
          ))}
        </ul>
        <p className="bsl-page__reserved">{BAMSIGNAL_LIBRARY_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
