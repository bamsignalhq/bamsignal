import { useMemo } from "react";
import {
  BAMSIGNAL_HOUSE_LABEL,
  GROWING_TOGETHER_LABEL,
  HOUSE_LIBRARY_LABEL,
  HOUSE_LIBRARY_PURPOSE_COPY,
  HOUSE_LIBRARY_RESERVED_COPY,
  HOUSE_LIBRARY_SUBCOPY,
  HOUSE_LIBRARY_TITLE,
  LEARNING_LABEL,
  PREPARED_HOUSE_LIBRARY_COLLECTIONS,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/houseLibrary";
import { getHouseLibraryBundle } from "../../../utils/HouseLibraryEngine";
import { BookCollectionCard } from "./BookCollectionCard";
import { PodcastCollectionCard } from "./PodcastCollectionCard";
import { ResearchCollectionCard } from "./ResearchCollectionCard";

export function HouseLibraryPage() {
  const bundle = useMemo(() => getHouseLibraryBundle(), []);

  return (
    <div className="hlib-page">
      <header className="hlib-page__hero institute-glass">
        <p className="bi-page__eyebrow">{HOUSE_LIBRARY_LABEL}</p>
        <h1>{HOUSE_LIBRARY_TITLE}</h1>
        <p>{HOUSE_LIBRARY_SUBCOPY}</p>
        <p className="hlib-page__labels">
          {BAMSIGNAL_HOUSE_LABEL} · {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} ·{" "}
          {RELATIONSHIP_WISDOM_LABEL} · {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="hlib-page__purpose">{HOUSE_LIBRARY_PURPOSE_COPY}</p>
      </header>

      <section className="hlib-page__prepared institute-glass">
        <h2>Collections</h2>
        <p>{bundle.collectionCount} collections — curated at the House, not lending yet.</p>
        <ul className="hlib-page__prepared-list">
          {PREPARED_HOUSE_LIBRARY_COLLECTIONS.map((collection) => (
            <li key={collection.id}>
              <strong>{collection.title}</strong>
              <span>{collection.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="hlib-page__section">
        <header className="bi-section-head">
          <h2>Book collections</h2>
          <p>{bundle.bookCollections.length} shelves — prepared, not enabled yet.</p>
        </header>
        <div className="hlib-page__grid">
          {bundle.bookCollections.map((collection) => (
            <BookCollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </section>

      <section className="hlib-page__section">
        <header className="bi-section-head">
          <h2>Research collections</h2>
          <p>Institute reports — architecture preview only.</p>
        </header>
        <div className="hlib-page__grid">
          {bundle.researchCollections.map((collection) => (
            <ResearchCollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </section>

      <section className="hlib-page__section">
        <header className="bi-section-head">
          <h2>Podcast collections</h2>
          <p>
            {bundle.podcastCollections.length} audio and visual collections — reserved, not
            streaming yet.
          </p>
        </header>
        <div className="hlib-page__grid">
          {bundle.podcastCollections.map((collection) => (
            <PodcastCollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </section>

      <section className="hlib-page__reserved-note institute-glass">
        <p>{HOUSE_LIBRARY_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
