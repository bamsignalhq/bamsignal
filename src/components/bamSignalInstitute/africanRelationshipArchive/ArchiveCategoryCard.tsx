import {
  AFRICAN_RELATIONSHIP_ARCHIVE_LABEL,
  CULTURAL_HERITAGE_LABEL
} from "../../../constants/africanRelationshipArchive";
import type { ArchiveRegionViewModel } from "../../../utils/africanRelationshipArchiveLogic";

type ArchiveCategoryCardProps = {
  region: ArchiveRegionViewModel;
};

export function ArchiveCategoryCard({ region }: ArchiveCategoryCardProps) {
  return (
    <article className="ara-category-card institute-glass">
      <header className="ara-category-card__head">
        <h3>{region.label}</h3>
        <span className="ara-category-card__badge">{CULTURAL_HERITAGE_LABEL}</span>
      </header>

      <p className="ara-category-card__labels">{AFRICAN_RELATIONSHIP_ARCHIVE_LABEL}</p>
      <p className="ara-category-card__description">{region.description}</p>
      <p className="ara-category-card__status">{region.statusLabel}</p>
    </article>
  );
}
