import { useMemo } from "react";
import {
  CORRIDOR_STORIES_PURPOSE_COPY,
  CORRIDOR_STORIES_RESERVED_COPY,
  CORRIDOR_STORIES_SUBCOPY,
  CORRIDOR_STORIES_TITLE,
  CORRIDOR_STORY_CATEGORIES,
  CORRIDOR_STORY_FUTURE_CAPABILITIES,
  DIASPORA_STORY_LABEL,
  JOURNEY_ACROSS_BORDERS_LABEL,
  LOVE_WITHOUT_BORDERS_LABEL
} from "../../../constants/corridorStories";
import { getCorridorStoriesBundle } from "../../../utils/CorridorStoriesEngine";
import { CorridorStoryCard } from "./CorridorStoryCard";
import { CorridorStoryCategoryCard } from "./CorridorStoryCategoryCard";
import { CorridorStoryTimeline } from "./CorridorStoryTimeline";

export function CorridorStoriesPage() {
  const bundle = useMemo(() => getCorridorStoriesBundle(), []);

  return (
    <div className="cs-page">
      <header className="cs-page__hero signal-events-glass">
        <p className="se-hub-page__eyebrow">{JOURNEY_ACROSS_BORDERS_LABEL}</p>
        <h1>{CORRIDOR_STORIES_TITLE}</h1>
        <p>{CORRIDOR_STORIES_SUBCOPY}</p>
        <p className="cs-page__labels">
          {LOVE_WITHOUT_BORDERS_LABEL} · {DIASPORA_STORY_LABEL}
        </p>
        <p className="cs-page__purpose">{CORRIDOR_STORIES_PURPOSE_COPY}</p>
      </header>

      <CorridorStoryCategoryCard />

      <section className="cs-page__categories signal-events-glass">
        <h2>Prepared stories</h2>
        <p>Architecture preview — alphabetical, never ranked.</p>
        <ul className="cs-page__category-list">
          {CORRIDOR_STORY_CATEGORIES.map((category) => (
            <li key={category.id}>
              <strong>{category.title}</strong>
              <span>{category.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="cs-page__section">
        <header className="se-section-head">
          <h2>Corridor stories</h2>
          <p>International love stories — private by default.</p>
        </header>
        <div className="cs-page__grid">
          {bundle.stories.map((story) => (
            <CorridorStoryCard key={story.id} story={story} />
          ))}
        </div>
      </section>

      {bundle.stories.map((story) => (
        <CorridorStoryTimeline
          key={`${story.storyId}-timeline`}
          title={story.title}
          entries={bundle.timelinesByStoryId[story.storyId] ?? []}
        />
      ))}

      <section className="cs-page__future signal-events-glass">
        <h2>Future ready</h2>
        <ul>
          {CORRIDOR_STORY_FUTURE_CAPABILITIES.map((capability) => (
            <li key={capability.id}>
              <strong>{capability.label}</strong>
              <span>{capability.description}</span>
            </li>
          ))}
        </ul>
        <p className="cs-page__reserved">{CORRIDOR_STORIES_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
