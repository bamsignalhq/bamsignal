import {
  BAMSIGNAL_LIBRARY_LABEL,
  GROWING_TOGETHER_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "../../../constants/bamSignalLibrary";
import type { PodcastViewModel } from "../../../utils/bamSignalLibraryLogic";

type PodcastCardProps = {
  podcast: PodcastViewModel;
};

export function PodcastCard({ podcast }: PodcastCardProps) {
  return (
    <article className="bsl-podcast-card institute-glass">
      <header className="bsl-podcast-card__head">
        <h3>{podcast.title}</h3>
        <span className="bsl-podcast-card__badge">{BAMSIGNAL_LIBRARY_LABEL}</span>
      </header>

      <p className="bsl-podcast-card__labels">
        {GROWING_TOGETHER_LABEL} · {RELATIONSHIP_WISDOM_LABEL}
      </p>
      <p className="bsl-podcast-card__host">{podcast.host}</p>
      <p className="bsl-podcast-card__description">{podcast.description}</p>
      <p className="bsl-podcast-card__status">{podcast.statusLabel}</p>
    </article>
  );
}
