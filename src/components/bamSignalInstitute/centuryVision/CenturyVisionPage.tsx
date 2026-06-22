import { useMemo } from "react";
import {
  CENTURY_VISION_FORBIDDEN_COPY,
  CENTURY_VISION_GOOD_COPY,
  CENTURY_VISION_LABEL,
  CENTURY_VISION_PURPOSE_COPY,
  CENTURY_VISION_RESERVED_COPY,
  CENTURY_VISION_SUBCOPY,
  CENTURY_VISION_TITLE,
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  PREPARED_CENTURY_PRINCIPLES,
  PREPARED_VISION_DOCUMENTS,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/centuryVision";
import { getCenturyVisionBundle } from "../../../utils/CenturyVisionEngine";
import { FoundingValuesCard } from "./FoundingValuesCard";
import { PrincipleCard } from "./PrincipleCard";
import { VisionTimelineCard } from "./VisionTimelineCard";

export function CenturyVisionPage() {
  const bundle = useMemo(() => getCenturyVisionBundle(), []);

  return (
    <div className="cvis-page">
      <header className="cvis-page__hero institute-glass">
        <p className="bi-page__eyebrow">{CENTURY_VISION_LABEL}</p>
        <h1>{CENTURY_VISION_TITLE}</h1>
        <p>{CENTURY_VISION_SUBCOPY}</p>
        <p className="cvis-page__labels">
          {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} · {RELATIONSHIP_WISDOM_LABEL} ·{" "}
          {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="cvis-page__purpose">{CENTURY_VISION_PURPOSE_COPY}</p>
      </header>

      <section className="cvis-page__copy-rules institute-glass">
        <h2>Copy guidance</h2>
        <p>
          Use: {CENTURY_VISION_GOOD_COPY.join(", ")}. Avoid:{" "}
          {CENTURY_VISION_FORBIDDEN_COPY.join(", ")}.
        </p>
      </section>

      <section className="cvis-page__prepared institute-glass">
        <h2>Document</h2>
        <p>
          {bundle.documentCount} themes — 100-year vision, not{" "}
          {CENTURY_VISION_FORBIDDEN_COPY[0].toLowerCase()}.
        </p>
        <ul className="cvis-page__prepared-list">
          {PREPARED_VISION_DOCUMENTS.map((document) => (
            <li key={document.id}>
              <strong>{document.title}</strong>
              <span>{document.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="cvis-page__section">
        <header className="bi-section-head">
          <h2>Founding values</h2>
          <p>Why BamSignal exists — documented, not a startup vision.</p>
        </header>
        <div className="cvis-page__grid">
          {bundle.foundingValues.map((values) => (
            <FoundingValuesCard key={values.id} values={values} />
          ))}
        </div>
      </section>

      <section className="cvis-page__section">
        <header className="bi-section-head">
          <h2>Principles</h2>
          <p>{bundle.principleCount} principles — Century Vision stewardship.</p>
        </header>
        <div className="cvis-page__grid">
          {bundle.principles.map((principle) => (
            <PrincipleCard key={principle.id} principle={principle} />
          ))}
        </div>
      </section>

      <section className="cvis-page__prepared institute-glass">
        <h2>Principles list</h2>
        <ul className="cvis-page__prepared-list">
          {PREPARED_CENTURY_PRINCIPLES.map((principle) => (
            <li key={principle.id}>
              <strong>{principle.title}</strong>
              <span>{principle.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="cvis-page__section">
        <header className="bi-section-head">
          <h2>Vision timelines</h2>
          <p>100-year milestones — architecture preview, not published yet.</p>
        </header>
        <div className="cvis-page__grid">
          {bundle.timelines.map((timeline) => (
            <VisionTimelineCard key={timeline.id} timeline={timeline} />
          ))}
        </div>
      </section>

      <section className="cvis-page__reserved-note institute-glass">
        <p>{CENTURY_VISION_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
