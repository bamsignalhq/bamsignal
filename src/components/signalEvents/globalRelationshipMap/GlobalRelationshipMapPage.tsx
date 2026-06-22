import { useMemo } from "react";
import {
  COMMUNITIES_CONNECTED_LABEL,
  GLOBAL_RELATIONSHIP_MAP_LABEL,
  GLOBAL_RELATIONSHIP_MAP_PURPOSE_COPY,
  GLOBAL_RELATIONSHIP_MAP_RESERVED_COPY,
  GLOBAL_RELATIONSHIP_MAP_STATIC_COPY,
  GLOBAL_RELATIONSHIP_MAP_SUBCOPY,
  GLOBAL_RELATIONSHIP_MAP_TITLE,
  JOURNEY_ACROSS_BORDERS_LABEL,
  RELATIONSHIP_MAP_FUTURE_CAPABILITIES,
  RELATIONSHIP_MAP_LAYER_LABELS
} from "../../../constants/globalRelationshipMap";
import { getGlobalRelationshipMapBundle } from "../../../utils/GlobalRelationshipMapEngine";
import { RelationshipCorridorCard } from "./RelationshipCorridorCard";
import { RelationshipMapCard } from "./RelationshipMapCard";

export function GlobalRelationshipMapPage() {
  const bundle = useMemo(() => getGlobalRelationshipMapBundle(), []);

  return (
    <div className="grm-page">
      <header className="grm-page__hero signal-events-glass">
        <p className="se-hub-page__eyebrow">{JOURNEY_ACROSS_BORDERS_LABEL}</p>
        <h1>{GLOBAL_RELATIONSHIP_MAP_TITLE}</h1>
        <p>{GLOBAL_RELATIONSHIP_MAP_SUBCOPY}</p>
        <p className="grm-page__labels">
          {GLOBAL_RELATIONSHIP_MAP_LABEL} · {COMMUNITIES_CONNECTED_LABEL}
        </p>
        <p className="grm-page__purpose">{GLOBAL_RELATIONSHIP_MAP_PURPOSE_COPY}</p>
        <p className="grm-page__static">{GLOBAL_RELATIONSHIP_MAP_STATIC_COPY}</p>
      </header>

      <section className="grm-page__layers signal-events-glass">
        <h2>Map layers</h2>
        <p>Worldwide legacy — alphabetical, never a heat map.</p>
        <ul className="grm-page__layer-list">
          {Object.entries(RELATIONSHIP_MAP_LAYER_LABELS).map(([id, label]) => (
            <li key={id}>
              <strong>{label}</strong>
              <span>Architecture preview — {label.toLowerCase()} on the global map.</span>
            </li>
          ))}
          <li>
            <strong>Diaspora corridors</strong>
            <span>Journey Across Borders — pathway connections between regions.</span>
          </li>
        </ul>
      </section>

      <section className="grm-page__section">
        <header className="se-section-head">
          <h2>Cities</h2>
          <p>Featured cities on the global relationship map.</p>
        </header>
        <div className="grm-page__grid">
          {bundle.cities.map((node) => (
            <RelationshipMapCard
              key={node.id}
              layer={node.layer}
              title={node.title}
              subtitle={node.subtitle}
              displayRows={node.displayRows}
            />
          ))}
        </div>
      </section>

      <section className="grm-page__section">
        <header className="se-section-head">
          <h2>Communities</h2>
          <p>{COMMUNITIES_CONNECTED_LABEL} — community status by city.</p>
        </header>
        <div className="grm-page__grid">
          {bundle.communities.map((node) => (
            <RelationshipMapCard
              key={node.id}
              layer={node.layer}
              title={node.title}
              subtitle={node.subtitle}
              displayRows={node.displayRows}
            />
          ))}
        </div>
      </section>

      <section className="grm-page__section">
        <header className="se-section-head">
          <h2>Diaspora corridors</h2>
          <p>{JOURNEY_ACROSS_BORDERS_LABEL} — international pathways.</p>
        </header>
        <div className="grm-page__grid">
          {bundle.corridors.map((corridor) => (
            <RelationshipCorridorCard key={corridor.id} corridor={corridor} />
          ))}
        </div>
      </section>

      <section className="grm-page__section">
        <header className="se-section-head">
          <h2>Legacy cities</h2>
          <p>Long-term community identity on the map.</p>
        </header>
        <div className="grm-page__grid">
          {bundle.legacyCities.map((node) => (
            <RelationshipMapCard
              key={node.id}
              layer={node.layer}
              title={node.title}
              subtitle={node.subtitle}
              displayRows={node.displayRows}
            />
          ))}
        </div>
      </section>

      <section className="grm-page__section">
        <header className="se-section-head">
          <h2>Founders cities</h2>
          <p>Earliest Signal Concierge stories — founders heritage.</p>
        </header>
        <div className="grm-page__grid">
          {bundle.foundersCities.map((node) => (
            <RelationshipMapCard
              key={node.id}
              layer={node.layer}
              title={node.title}
              subtitle={node.subtitle}
              displayRows={node.displayRows}
            />
          ))}
        </div>
      </section>

      <section className="grm-page__future signal-events-glass">
        <h2>Future ready</h2>
        <ul>
          {RELATIONSHIP_MAP_FUTURE_CAPABILITIES.map((capability) => (
            <li key={capability.id}>
              <strong>{capability.label}</strong>
              <span>{capability.description}</span>
            </li>
          ))}
        </ul>
        <p className="grm-page__reserved">{GLOBAL_RELATIONSHIP_MAP_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
