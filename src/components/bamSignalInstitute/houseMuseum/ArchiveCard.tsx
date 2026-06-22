import { ARCHIVE_LABEL, BAMSIGNAL_HOUSE_FORBIDDEN_COPY } from "../../../constants/houseMuseum";
import type { ArchiveCardViewModel } from "../../../utils/houseMuseumLogic";

type ArchiveCardProps = {
  archive: ArchiveCardViewModel;
};

export function ArchiveCard({ archive }: ArchiveCardProps) {
  return (
    <article className="hmsm-archive-card institute-glass">
      <header className="hmsm-archive-card__head">
        <h3>{archive.title}</h3>
        <span className="hmsm-archive-card__badge">{ARCHIVE_LABEL}</span>
      </header>
      <p className="hmsm-archive-card__order">Collection {archive.collectionOrder}</p>
      <p className="hmsm-archive-card__description">{archive.description}</p>
      <p className="hmsm-archive-card__forbidden">
        Not {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="hmsm-archive-card__status">{archive.statusLabel}</p>
    </article>
  );
}
