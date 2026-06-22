import { useMemo } from "react";
import {
  BAMSIGNAL_HOUSE_LABEL,
  BAMSIGNAL_STUDIO_LABEL,
  BAMSIGNAL_STUDIO_PURPOSE_COPY,
  BAMSIGNAL_STUDIO_RESERVED_COPY,
  BAMSIGNAL_STUDIO_SUBCOPY,
  BAMSIGNAL_STUDIO_TITLE,
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  PREPARED_STUDIO_PRODUCTIONS,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/bamSignalStudio";
import { getBamSignalStudioBundle } from "../../../utils/BamSignalStudioEngine";
import { CreatorStudioCard } from "./CreatorStudioCard";
import { DocumentaryStudioCard } from "./DocumentaryStudioCard";
import { PodcastStudioCard } from "./PodcastStudioCard";

export function StudioPage() {
  const bundle = useMemo(() => getBamSignalStudioBundle(), []);

  return (
    <div className="bstu-page">
      <header className="bstu-page__hero institute-glass">
        <p className="bi-page__eyebrow">{BAMSIGNAL_STUDIO_LABEL}</p>
        <h1>{BAMSIGNAL_STUDIO_TITLE}</h1>
        <p>{BAMSIGNAL_STUDIO_SUBCOPY}</p>
        <p className="bstu-page__labels">
          {BAMSIGNAL_HOUSE_LABEL} · {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} ·{" "}
          {RELATIONSHIP_WISDOM_LABEL} · {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="bstu-page__purpose">{BAMSIGNAL_STUDIO_PURPOSE_COPY}</p>
      </header>

      <section className="bstu-page__prepared institute-glass">
        <h2>Prepared productions</h2>
        <p>{bundle.productionCount} formats — studio architecture, not broadcasting yet.</p>
        <ul className="bstu-page__prepared-list">
          {PREPARED_STUDIO_PRODUCTIONS.map((production) => (
            <li key={production.id}>
              <strong>{production.title}</strong>
              <span>{production.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="bstu-page__section">
        <header className="bi-section-head">
          <h2>Podcast studio</h2>
          <p>Podcasts and interviews — prepared, not enabled yet.</p>
        </header>
        <div className="bstu-page__grid">
          {bundle.podcastProductions.map((production) => (
            <PodcastStudioCard key={production.id} production={production} />
          ))}
        </div>
      </section>

      <section className="bstu-page__section">
        <header className="bi-section-head">
          <h2>Documentary studio</h2>
          <p>Visual Legacy — architecture preview only.</p>
        </header>
        <div className="bstu-page__grid">
          {bundle.documentaryProductions.map((production) => (
            <DocumentaryStudioCard key={production.id} production={production} />
          ))}
        </div>
      </section>

      <section className="bstu-page__section">
        <header className="bi-section-head">
          <h2>Creator studio</h2>
          <p>Masterclasses and storytelling — reserved, not publishing yet.</p>
        </header>
        <div className="bstu-page__grid">
          {bundle.creatorProductions.map((production) => (
            <CreatorStudioCard key={production.id} production={production} />
          ))}
        </div>
      </section>

      <section className="bstu-page__reserved-note institute-glass">
        <p>{BAMSIGNAL_STUDIO_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
