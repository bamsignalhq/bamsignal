import { useMemo } from "react";
import {
  INSIGHTS_LABEL,
  PREPARED_RESEARCH_LABS,
  RELATIONSHIP_LAB_FUTURE_CAPABILITIES,
  RELATIONSHIP_LAB_PURPOSE_COPY,
  RELATIONSHIP_LAB_RESERVED_COPY,
  RELATIONSHIP_LAB_SUBCOPY,
  RELATIONSHIP_LAB_TITLE,
  RESEARCH_LAB_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/relationshipLab";
import { getRelationshipLabBundle } from "../../../utils/RelationshipLabEngine";
import { LabCategoryCard } from "./LabCategoryCard";
import { LabTimelineCard } from "./LabTimelineCard";
import { ResearchLabCard } from "./ResearchLabCard";

export function RelationshipLabPage() {
  const bundle = useMemo(() => getRelationshipLabBundle(), []);

  return (
    <div className="rl-page">
      <header className="rl-page__hero institute-glass">
        <p className="bi-page__eyebrow">{RESEARCH_LAB_LABEL}</p>
        <h1>{RELATIONSHIP_LAB_TITLE}</h1>
        <p>{RELATIONSHIP_LAB_SUBCOPY}</p>
        <p className="rl-page__labels">
          {INSIGHTS_LABEL} · {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="rl-page__purpose">{RELATIONSHIP_LAB_PURPOSE_COPY}</p>
      </header>

      <section className="rl-page__categories">
        <header className="bi-section-head">
          <h2>Lab categories</h2>
          <p>Specialized divisions — never testing or experiments on members.</p>
        </header>
        <div className="rl-page__grid rl-page__grid--categories">
          {bundle.categories.map((category) => (
            <LabCategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      <section className="rl-page__prepared institute-glass">
        <h2>Prepared labs</h2>
        <p>{PREPARED_RESEARCH_LABS.length} labs — architecture preview, alphabetical.</p>
        <ul className="rl-page__prepared-list">
          {PREPARED_RESEARCH_LABS.map((lab) => (
            <li key={lab.id}>
              <strong>{lab.title}</strong>
              <span>{lab.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rl-page__section">
        <header className="bi-section-head">
          <h2>Research labs</h2>
          <p>Specialized research divisions — prepared, not enabled.</p>
        </header>
        <div className="rl-page__grid">
          {bundle.labs.map((lab) => (
            <ResearchLabCard key={lab.id} lab={lab} />
          ))}
        </div>
      </section>

      {bundle.labs.map((lab) => (
        <LabTimelineCard key={`${lab.id}-timeline`} title={lab.title} entries={lab.timeline} />
      ))}

      <section className="rl-page__future institute-glass">
        <h2>Future ready</h2>
        <ul>
          {RELATIONSHIP_LAB_FUTURE_CAPABILITIES.map((capability) => (
            <li key={capability.id}>
              <strong>{capability.label}</strong>
              <span>{capability.description}</span>
            </li>
          ))}
        </ul>
        <p className="rl-page__reserved">{RELATIONSHIP_LAB_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
