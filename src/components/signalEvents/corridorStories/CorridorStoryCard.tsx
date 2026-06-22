import {
  CORRIDOR_STORIES_PRIVATE_COPY,
  DIASPORA_STORY_LABEL,
  LOVE_WITHOUT_BORDERS_LABEL
} from "../../../constants/corridorStories";
import type { CorridorStoryEntry } from "../../../constants/corridorStories";
import { getVisibleStoryBody } from "../../../utils/corridorStoriesLogic";
import { CorridorStoryConsentBadge } from "./CorridorStoryConsentBadge";

type CorridorStoryCardProps = {
  story: CorridorStoryEntry;
};

export function CorridorStoryCard({ story }: CorridorStoryCardProps) {
  const visibleBody = getVisibleStoryBody(story);

  return (
    <article className="cs-story-card signal-events-glass">
      <header className="cs-story-card__head">
        <h3>{story.title}</h3>
        <CorridorStoryConsentBadge
          consentLevel={story.consentLevel}
          consentGranted={story.consentGranted}
        />
      </header>

      <p className="cs-story-card__route">{story.routeLabel}</p>
      <p className="cs-story-card__labels">
        {DIASPORA_STORY_LABEL} · {LOVE_WITHOUT_BORDERS_LABEL}
      </p>

      {visibleBody ? (
        <blockquote className="cs-story-card__body">&ldquo;{visibleBody}&rdquo;</blockquote>
      ) : (
        <p className="cs-story-card__private">{CORRIDOR_STORIES_PRIVATE_COPY}</p>
      )}

      <time dateTime={story.recordedAt}>
        Preserved {new Date(story.recordedAt).toLocaleDateString()}
      </time>
    </article>
  );
}
