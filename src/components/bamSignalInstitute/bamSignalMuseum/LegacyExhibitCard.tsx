import {
  ARCHIVE_LABEL,
  BAMSIGNAL_MUSEUM_FORBIDDEN_COPY,
  LEGACY_EXHIBIT_LABEL,
  PRESERVING_STORIES_LABEL
} from "../../../constants/bamSignalMuseum";
import type { LegacyExhibitViewModel } from "../../../utils/bamSignalMuseumLogic";

type LegacyExhibitCardProps = {
  exhibit: LegacyExhibitViewModel;
};

export function LegacyExhibitCard({ exhibit }: LegacyExhibitCardProps) {
  return (
    <article className="bsmu-exhibit-card institute-glass">
      <header className="bsmu-exhibit-card__head">
        <h3>{exhibit.title}</h3>
        <span className="bsmu-exhibit-card__badge">{LEGACY_EXHIBIT_LABEL}</span>
      </header>
      <p className="bsmu-exhibit-card__labels">
        {ARCHIVE_LABEL} · {PRESERVING_STORIES_LABEL}
      </p>
      <p className="bsmu-exhibit-card__preservation">{exhibit.preservationTitle}</p>
      <p className="bsmu-exhibit-card__description">{exhibit.description}</p>
      <p className="bsmu-exhibit-card__forbidden">
        Not {BAMSIGNAL_MUSEUM_FORBIDDEN_COPY.join(" or ")}.
      </p>
      <p className="bsmu-exhibit-card__status">{exhibit.statusLabel}</p>
    </article>
  );
}
