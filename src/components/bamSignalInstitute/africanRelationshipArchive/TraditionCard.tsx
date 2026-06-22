import {
  AFRICAN_RELATIONSHIP_ARCHIVE_LABEL,
  FAMILY_TRADITIONS_LABEL
} from "../../../constants/africanRelationshipArchive";
import type { ArchiveEntryViewModel } from "../../../utils/africanRelationshipArchiveLogic";

type TraditionCardProps = {
  entry: ArchiveEntryViewModel;
};

export function TraditionCard({ entry }: TraditionCardProps) {
  return (
    <article className="ara-tradition-card institute-glass">
      <header className="ara-tradition-card__head">
        <h3>{entry.title}</h3>
        <span className="ara-tradition-card__badge">{FAMILY_TRADITIONS_LABEL}</span>
      </header>

      <p className="ara-tradition-card__labels">{AFRICAN_RELATIONSHIP_ARCHIVE_LABEL}</p>
      <p className="ara-tradition-card__meta">
        {entry.categoryLabel} · {entry.regionLabel}
      </p>
      <p className="ara-tradition-card__summary">{entry.summary}</p>
      <p className="ara-tradition-card__status">{entry.statusLabel}</p>
    </article>
  );
}
