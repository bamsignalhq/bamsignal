import { useMemo } from "react";
import {
  COMMUNITY_STRENGTH_LABEL,
  FAMILY_VALUES_LABEL,
  INSIGHTS_LABEL,
  PREPARED_RELATIONSHIP_INDICES,
  RELATIONSHIP_INDEX_FUTURE_CAPABILITIES,
  RELATIONSHIP_INDEX_LABEL,
  RELATIONSHIP_INDEX_PURPOSE_COPY,
  RELATIONSHIP_INDEX_RESERVED_COPY,
  RELATIONSHIP_INDEX_SUBCOPY,
  RELATIONSHIP_INDEX_TITLE,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/relationshipIndex";
import { getRelationshipIndexBundle } from "../../../utils/RelationshipIndexEngine";
import { CommunityIndexCard } from "./CommunityIndexCard";
import { IndexCard } from "./IndexCard";
import { IndexTimelineCard } from "./IndexTimelineCard";

export function RelationshipIndexPage() {
  const bundle = useMemo(() => getRelationshipIndexBundle(), []);

  return (
    <div className="rix-page">
      <header className="rix-page__hero institute-glass">
        <p className="bi-page__eyebrow">{RELATIONSHIP_INDEX_LABEL}</p>
        <h1>{RELATIONSHIP_INDEX_TITLE}</h1>
        <p>{RELATIONSHIP_INDEX_SUBCOPY}</p>
        <p className="rix-page__labels">
          {COMMUNITY_STRENGTH_LABEL} · {FAMILY_VALUES_LABEL} · {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="rix-page__purpose">{RELATIONSHIP_INDEX_PURPOSE_COPY}</p>
      </header>

      <section className="rix-page__prepared institute-glass">
        <h2>Prepared indices</h2>
        <p>
          {bundle.indexCount} indices — architecture preview, never ratings or leaderboards.
        </p>
        <ul className="rix-page__prepared-list">
          {PREPARED_RELATIONSHIP_INDICES.map((index) => (
            <li key={index.id}>
              <strong>{index.title}</strong>
              <span>{index.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rix-page__section">
        <header className="bi-section-head">
          <h2>Relationship indices</h2>
          <p>{INSIGHTS_LABEL} — yearly indicators prepared, not published.</p>
        </header>
        <div className="rix-page__grid">
          {bundle.generalIndices.map((index) => (
            <IndexCard key={index.id} index={index} />
          ))}
        </div>
      </section>

      <section className="rix-page__section">
        <header className="bi-section-head">
          <h2>Community indices</h2>
          <p>{COMMUNITY_STRENGTH_LABEL} — local dignity first, never scores.</p>
        </header>
        <div className="rix-page__grid">
          {bundle.communityIndices.map((index) => (
            <CommunityIndexCard key={index.id} index={index} />
          ))}
        </div>
      </section>

      {bundle.indices.map((index) => (
        <IndexTimelineCard key={`${index.id}-timeline`} title={index.title} entries={index.timeline} />
      ))}

      <section className="rix-page__future institute-glass">
        <h2>Future ready</h2>
        <ul>
          {RELATIONSHIP_INDEX_FUTURE_CAPABILITIES.map((capability) => (
            <li key={capability.id}>
              <strong>{capability.label}</strong>
              <span>{capability.description}</span>
            </li>
          ))}
        </ul>
        <p className="rix-page__reserved">{RELATIONSHIP_INDEX_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
