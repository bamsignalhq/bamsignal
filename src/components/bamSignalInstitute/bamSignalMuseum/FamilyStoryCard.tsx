import {
  ARCHIVE_LABEL,
  BAMSIGNAL_MUSEUM_FORBIDDEN_COPY,
  FAMILY_STORY_LABEL,
  PRESERVING_STORIES_LABEL
} from "../../../constants/bamSignalMuseum";
import type { FamilyStoryViewModel } from "../../../utils/bamSignalMuseumLogic";

type FamilyStoryCardProps = {
  story: FamilyStoryViewModel;
};

export function FamilyStoryCard({ story }: FamilyStoryCardProps) {
  return (
    <article className="bsmu-story-card institute-glass">
      <header className="bsmu-story-card__head">
        <h3>{story.title}</h3>
        <span className="bsmu-story-card__badge">{FAMILY_STORY_LABEL}</span>
      </header>
      <p className="bsmu-story-card__labels">
        {ARCHIVE_LABEL} · {PRESERVING_STORIES_LABEL}
      </p>
      <p className="bsmu-story-card__preservation">{story.preservationTitle}</p>
      <p className="bsmu-story-card__summary">{story.summary}</p>
      <p className="bsmu-story-card__forbidden">
        Not {BAMSIGNAL_MUSEUM_FORBIDDEN_COPY.join(" or ")}.
      </p>
      <p className="bsmu-story-card__status">{story.statusLabel}</p>
    </article>
  );
}
