import { useMemo } from "react";
import {
  AFRICAN_RELATIONSHIP_ARCHIVE_FUTURE_CAPABILITIES,
  AFRICAN_RELATIONSHIP_ARCHIVE_LABEL,
  AFRICAN_RELATIONSHIP_ARCHIVE_PURPOSE_COPY,
  AFRICAN_RELATIONSHIP_ARCHIVE_RESERVED_COPY,
  AFRICAN_RELATIONSHIP_ARCHIVE_SUBCOPY,
  AFRICAN_RELATIONSHIP_ARCHIVE_TITLE,
  AFRICAN_RELATIONSHIP_CULTURE_LABEL,
  CULTURAL_HERITAGE_LABEL,
  FAMILY_TRADITIONS_LABEL,
  JOURNEY_STORIES_LABEL,
  PRESERVED_ARCHIVE_CATEGORIES,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/africanRelationshipArchive";
import { getAfricanRelationshipArchiveBundle } from "../../../utils/AfricanRelationshipArchiveEngine";
import { ArchiveCategoryCard } from "./ArchiveCategoryCard";
import { CultureStoryCard } from "./CultureStoryCard";
import { DiasporaJourneyCard } from "./DiasporaJourneyCard";
import { FaithInfluenceCard } from "./FaithInfluenceCard";
import { TraditionCard } from "./TraditionCard";

export function AfricanRelationshipArchivePage() {
  const bundle = useMemo(() => getAfricanRelationshipArchiveBundle(), []);

  return (
    <div className="ara-page">
      <header className="ara-page__hero institute-glass">
        <p className="bi-page__eyebrow">{AFRICAN_RELATIONSHIP_ARCHIVE_LABEL}</p>
        <h1>{AFRICAN_RELATIONSHIP_ARCHIVE_TITLE}</h1>
        <p>{AFRICAN_RELATIONSHIP_ARCHIVE_SUBCOPY}</p>
        <p className="ara-page__labels">
          {CULTURAL_HERITAGE_LABEL} · {FAMILY_TRADITIONS_LABEL} · {JOURNEY_STORIES_LABEL} ·{" "}
          {AFRICAN_RELATIONSHIP_CULTURE_LABEL}
        </p>
        <p className="ara-page__purpose">{AFRICAN_RELATIONSHIP_ARCHIVE_PURPOSE_COPY}</p>
      </header>

      <section className="ara-page__prepared institute-glass">
        <h2>Preserved categories</h2>
        <p>
          {bundle.categoryCount} categories — never a database, repository, or history log.
        </p>
        <ul className="ara-page__prepared-list">
          {PRESERVED_ARCHIVE_CATEGORIES.map((category) => (
            <li key={category.id}>
              <strong>{category.label}</strong>
              <span>{category.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="ara-page__section">
        <header className="bi-section-head">
          <h2>Regions</h2>
          <p>{bundle.regionCount} regions — {UNDERSTANDING_RELATIONSHIPS_LABEL}.</p>
        </header>
        <div className="ara-page__grid ara-page__grid--regions">
          {bundle.regions.map((region) => (
            <ArchiveCategoryCard key={region.id} region={region} />
          ))}
        </div>
      </section>

      <section className="ara-page__section">
        <header className="bi-section-head">
          <h2>Culture stories</h2>
          <p>{JOURNEY_STORIES_LABEL} — love stories prepared, not published.</p>
        </header>
        <div className="ara-page__grid">
          {bundle.cultureStories.map((entry) => (
            <CultureStoryCard key={entry.id} entry={entry} />
          ))}
        </div>
      </section>

      <section className="ara-page__section">
        <header className="bi-section-head">
          <h2>Traditions</h2>
          <p>{FAMILY_TRADITIONS_LABEL} — wedding, language, and courtship customs.</p>
        </header>
        <div className="ara-page__grid">
          {bundle.traditions.map((entry) => (
            <TraditionCard key={entry.id} entry={entry} />
          ))}
        </div>
      </section>

      <section className="ara-page__section">
        <header className="bi-section-head">
          <h2>Diaspora journeys</h2>
          <p>Cross-border relationships — archived with dignity.</p>
        </header>
        <div className="ara-page__grid">
          {bundle.diasporaJourneys.map((entry) => (
            <DiasporaJourneyCard key={entry.id} entry={entry} />
          ))}
        </div>
      </section>

      <section className="ara-page__section">
        <header className="bi-section-head">
          <h2>Faith influences</h2>
          <p>{CULTURAL_HERITAGE_LABEL} — family values and faith pathways.</p>
        </header>
        <div className="ara-page__grid">
          {bundle.faithInfluences.map((entry) => (
            <FaithInfluenceCard key={entry.id} entry={entry} />
          ))}
        </div>
      </section>

      <section className="ara-page__future institute-glass">
        <h2>Future ready</h2>
        <ul>
          {AFRICAN_RELATIONSHIP_ARCHIVE_FUTURE_CAPABILITIES.map((capability) => (
            <li key={capability.id}>
              <strong>{capability.label}</strong>
              <span>{capability.description}</span>
            </li>
          ))}
        </ul>
        <p className="ara-page__reserved">{AFRICAN_RELATIONSHIP_ARCHIVE_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
