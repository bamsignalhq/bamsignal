import { useMemo } from "react";
import {
  BAMSIGNAL_MUSEUM_FORBIDDEN_COPY,
  BAMSIGNAL_MUSEUM_FUTURE_READY_COPY,
  BAMSIGNAL_MUSEUM_GOOD_COPY,
  BAMSIGNAL_MUSEUM_LABEL,
  BAMSIGNAL_MUSEUM_PURPOSE_COPY,
  BAMSIGNAL_MUSEUM_RESERVED_COPY,
  BAMSIGNAL_MUSEUM_SUBCOPY,
  BAMSIGNAL_MUSEUM_TITLE,
  FUTURE_READY_MUSEUM_CAPABILITIES,
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  PREPARED_MUSEUM_PRESERVATIONS,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/bamSignalMuseum";
import { getBamSignalMuseumBundle } from "../../../utils/BamSignalMuseumEngine";
import { FamilyStoryCard } from "./FamilyStoryCard";
import { LegacyExhibitCard } from "./LegacyExhibitCard";
import { RelationshipTimelineCard } from "./RelationshipTimelineCard";

export function MuseumPage() {
  const bundle = useMemo(() => getBamSignalMuseumBundle(), []);

  return (
    <div className="bsmu-page">
      <header className="bsmu-page__hero institute-glass">
        <p className="bi-page__eyebrow">{BAMSIGNAL_MUSEUM_LABEL}</p>
        <h1>{BAMSIGNAL_MUSEUM_TITLE}</h1>
        <p>{BAMSIGNAL_MUSEUM_SUBCOPY}</p>
        <p className="bsmu-page__labels">
          {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} · {RELATIONSHIP_WISDOM_LABEL} ·{" "}
          {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="bsmu-page__purpose">{BAMSIGNAL_MUSEUM_PURPOSE_COPY}</p>
      </header>

      <section className="bsmu-page__copy-rules institute-glass">
        <h2>Copy guidance</h2>
        <p>
          Use: {BAMSIGNAL_MUSEUM_GOOD_COPY.join(", ")}. Avoid:{" "}
          {BAMSIGNAL_MUSEUM_FORBIDDEN_COPY.join(", ")}.
        </p>
      </section>

      <section className="bsmu-page__prepared institute-glass">
        <h2>Preserve</h2>
        <p>
          {bundle.preservationCount} collections — Preserving Stories, not{" "}
          {BAMSIGNAL_MUSEUM_FORBIDDEN_COPY[0].toLowerCase()}.
        </p>
        <ul className="bsmu-page__prepared-list">
          {PREPARED_MUSEUM_PRESERVATIONS.map((preservation) => (
            <li key={preservation.id}>
              <strong>{preservation.title}</strong>
              <span>{preservation.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="bsmu-page__section">
        <header className="bi-section-head">
          <h2>Legacy exhibits</h2>
          <p>Relationship and family history — prepared, not enabled yet.</p>
        </header>
        <div className="bsmu-page__grid">
          {bundle.exhibits.map((exhibit) => (
            <LegacyExhibitCard key={exhibit.id} exhibit={exhibit} />
          ))}
        </div>
      </section>

      <section className="bsmu-page__section">
        <header className="bi-section-head">
          <h2>Family stories</h2>
          <p>Archive entries reserved — museum dignity, not database records.</p>
        </header>
        <div className="bsmu-page__grid">
          {bundle.stories.map((story) => (
            <FamilyStoryCard key={story.id} story={story} />
          ))}
        </div>
      </section>

      <section className="bsmu-page__section">
        <header className="bi-section-head">
          <h2>Relationship timelines</h2>
          <p>Preserving Stories across generations — architecture preview only.</p>
        </header>
        <div className="bsmu-page__grid">
          {bundle.timelines.map((timeline) => (
            <RelationshipTimelineCard key={timeline.id} timeline={timeline} />
          ))}
        </div>
      </section>

      <section className="bsmu-page__future-ready institute-glass">
        <h2>Future-ready capabilities</h2>
        <p>{BAMSIGNAL_MUSEUM_FUTURE_READY_COPY}</p>
        <ul className="bsmu-page__prepared-list">
          {FUTURE_READY_MUSEUM_CAPABILITIES.map((capability) => (
            <li key={capability.id}>
              <strong>{capability.title}</strong>
              <span>{capability.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="bsmu-page__reserved-note institute-glass">
        <p>{BAMSIGNAL_MUSEUM_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
