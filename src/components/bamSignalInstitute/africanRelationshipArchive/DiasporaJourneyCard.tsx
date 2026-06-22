import {
  AFRICAN_RELATIONSHIP_ARCHIVE_LABEL,
  JOURNEY_STORIES_LABEL
} from "../../../constants/africanRelationshipArchive";
import type { ArchiveEntryViewModel } from "../../../utils/africanRelationshipArchiveLogic";

type DiasporaJourneyCardProps = {
  entry: ArchiveEntryViewModel;
};

export function DiasporaJourneyCard({ entry }: DiasporaJourneyCardProps) {
  return (
    <article className="ara-diaspora-card institute-glass">
      <header className="ara-diaspora-card__head">
        <h3>{entry.title}</h3>
        <span className="ara-diaspora-card__badge">{JOURNEY_STORIES_LABEL}</span>
      </header>

      <p className="ara-diaspora-card__labels">{AFRICAN_RELATIONSHIP_ARCHIVE_LABEL}</p>
      <p className="ara-diaspora-card__meta">
        {entry.categoryLabel} · {entry.regionLabel}
      </p>
      <p className="ara-diaspora-card__summary">{entry.summary}</p>
      <p className="ara-diaspora-card__status">{entry.statusLabel}</p>
    </article>
  );
}
