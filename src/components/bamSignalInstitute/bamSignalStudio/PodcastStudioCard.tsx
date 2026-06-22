import {
  BAMSIGNAL_HOUSE_FORBIDDEN_COPY,
  PODCAST_STUDIO_LABEL
} from "../../../constants/bamSignalStudio";
import type { PodcastStudioCardViewModel } from "../../../utils/bamSignalStudioLogic";

type PodcastStudioCardProps = {
  production: PodcastStudioCardViewModel;
};

export function PodcastStudioCard({ production }: PodcastStudioCardProps) {
  return (
    <article className="bstu-podcast-card institute-glass">
      <header className="bstu-podcast-card__head">
        <h3>{production.title}</h3>
        <span className="bstu-podcast-card__badge">{PODCAST_STUDIO_LABEL}</span>
      </header>
      <p className="bstu-podcast-card__description">{production.description}</p>
      <p className="bstu-podcast-card__forbidden">
        Not {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="bstu-podcast-card__status">{production.statusLabel}</p>
    </article>
  );
}
