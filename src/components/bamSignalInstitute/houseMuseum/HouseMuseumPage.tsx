import { useMemo } from "react";
import {
  BAMSIGNAL_HOUSE_LABEL,
  GROWING_TOGETHER_LABEL,
  HOUSE_MUSEUM_LABEL,
  HOUSE_MUSEUM_PURPOSE_COPY,
  HOUSE_MUSEUM_RESERVED_COPY,
  HOUSE_MUSEUM_SUBCOPY,
  HOUSE_MUSEUM_TITLE,
  LEARNING_LABEL,
  PRESERVED_MUSEUM_COLLECTIONS,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/houseMuseum";
import { getHouseMuseumBundle } from "../../../utils/HouseMuseumEngine";
import { ArchiveCard } from "./ArchiveCard";
import { ExhibitCard } from "./ExhibitCard";

export function HouseMuseumPage() {
  const bundle = useMemo(() => getHouseMuseumBundle(), []);

  return (
    <div className="hmsm-page">
      <header className="hmsm-page__hero institute-glass">
        <p className="bi-page__eyebrow">{HOUSE_MUSEUM_LABEL}</p>
        <h1>{HOUSE_MUSEUM_TITLE}</h1>
        <p>{HOUSE_MUSEUM_SUBCOPY}</p>
        <p className="hmsm-page__labels">
          {BAMSIGNAL_HOUSE_LABEL} · {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} ·{" "}
          {RELATIONSHIP_WISDOM_LABEL} · {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="hmsm-page__purpose">{HOUSE_MUSEUM_PURPOSE_COPY}</p>
      </header>

      <section className="hmsm-page__prepared institute-glass">
        <h2>Preserved</h2>
        <p>{bundle.collectionCount} collections — architecture preview, not physical museum yet.</p>
        <ul className="hmsm-page__prepared-list">
          {PRESERVED_MUSEUM_COLLECTIONS.map((collection) => (
            <li key={collection.id}>
              <strong>{collection.title}</strong>
              <span>{collection.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="hmsm-page__section">
        <header className="bi-section-head">
          <h2>Exhibits</h2>
          <p>Love Stories through Legacy Families — preserved, not enabled yet.</p>
        </header>
        <div className="hmsm-page__grid">
          {bundle.exhibits.map((exhibit) => (
            <ExhibitCard key={exhibit.id} exhibit={exhibit} />
          ))}
        </div>
      </section>

      <section className="hmsm-page__section">
        <header className="bi-section-head">
          <h2>Archives</h2>
          <p>Diaspora Journeys and African Family Culture — architecture reserved, not catalogued yet.</p>
        </header>
        <div className="hmsm-page__grid">
          {bundle.archives.map((archive) => (
            <ArchiveCard key={archive.id} archive={archive} />
          ))}
        </div>
      </section>

      <section className="hmsm-page__reserved-note institute-glass">
        <p>{HOUSE_MUSEUM_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
