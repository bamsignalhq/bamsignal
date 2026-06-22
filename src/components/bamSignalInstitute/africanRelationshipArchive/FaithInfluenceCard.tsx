import {
  AFRICAN_RELATIONSHIP_ARCHIVE_LABEL,
  CULTURAL_HERITAGE_LABEL,
  FAMILY_TRADITIONS_LABEL
} from "../../../constants/africanRelationshipArchive";
import type { ArchiveEntryViewModel } from "../../../utils/africanRelationshipArchiveLogic";

type FaithInfluenceCardProps = {
  entry: ArchiveEntryViewModel;
};

export function FaithInfluenceCard({ entry }: FaithInfluenceCardProps) {
  return (
    <article className="ara-faith-card institute-glass">
      <header className="ara-faith-card__head">
        <h3>{entry.title}</h3>
        <span className="ara-faith-card__badge">{CULTURAL_HERITAGE_LABEL}</span>
      </header>

      <p className="ara-faith-card__labels">
        {AFRICAN_RELATIONSHIP_ARCHIVE_LABEL} · {FAMILY_TRADITIONS_LABEL}
      </p>
      <p className="ara-faith-card__meta">
        {entry.categoryLabel} · {entry.regionLabel}
      </p>
      <p className="ara-faith-card__summary">{entry.summary}</p>
      <p className="ara-faith-card__status">{entry.statusLabel}</p>
    </article>
  );
}
