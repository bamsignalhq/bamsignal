import {
  AFRICAN_RELATIONSHIP_ARCHIVE_LABEL,
  JOURNEY_STORIES_LABEL
} from "../../../constants/africanRelationshipArchive";
import type { ArchiveEntryViewModel } from "../../../utils/africanRelationshipArchiveLogic";

type CultureStoryCardProps = {
  entry: ArchiveEntryViewModel;
};

export function CultureStoryCard({ entry }: CultureStoryCardProps) {
  return (
    <article className="ara-culture-card institute-glass">
      <header className="ara-culture-card__head">
        <h3>{entry.title}</h3>
        <span className="ara-culture-card__badge">{JOURNEY_STORIES_LABEL}</span>
      </header>

      <p className="ara-culture-card__labels">{AFRICAN_RELATIONSHIP_ARCHIVE_LABEL}</p>
      <p className="ara-culture-card__meta">
        {entry.categoryLabel} · {entry.regionLabel}
      </p>
      <p className="ara-culture-card__summary">{entry.summary}</p>
      <p className="ara-culture-card__status">{entry.statusLabel}</p>
    </article>
  );
}
