import { useMemo } from "react";
import {
  BAMSIGNAL_FOUNDATION_RESERVED_COPY,
  GIVING_BACK_LABEL,
  IMPACT_LABEL,
  SUPPORTING_FAMILIES_LABEL
} from "../../constants/bamSignalFoundation";
import { getBamSignalFoundationBundle } from "../../utils/BamSignalFoundationEngine";

export function FoundationStoriesPage() {
  const bundle = useMemo(() => getBamSignalFoundationBundle(), []);

  return (
    <div className="bf-page">
      <header className="bf-page__hero foundation-glass">
        <p className="bf-page__eyebrow">{IMPACT_LABEL}</p>
        <h1>Foundation Stories</h1>
        <p>Impact stories preserved with dignity — private by default.</p>
        <p className="bf-page__labels">
          {GIVING_BACK_LABEL} · {SUPPORTING_FAMILIES_LABEL}
        </p>
      </header>

      <section className="bf-page__section">
        <header className="bf-section-head">
          <h2>Prepared stories</h2>
          <p>Architecture preview — consent required before any story is shared.</p>
        </header>
        <div className="bf-page__stories">
          {bundle.stories.map((story) => (
            <article key={story.id} className="bf-story-card foundation-glass">
              <header className="bf-story-card__head">
                <h3>{story.title}</h3>
                <span className="bf-story-card__badge">{story.visibilityLabel}</span>
              </header>
              <p className="bf-story-card__summary">{story.summary}</p>
              <time dateTime={story.recordedAt}>
                Preserved {new Date(story.recordedAt).toLocaleDateString()}
              </time>
            </article>
          ))}
        </div>
      </section>

      <p className="bf-page__reserved foundation-glass">{BAMSIGNAL_FOUNDATION_RESERVED_COPY}</p>
    </div>
  );
}
