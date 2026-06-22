import { CONVERSATIONS_LABEL, INSIGHTS_LABEL } from "../../../constants/bamSignalInsights";
import type { PodcastViewModel } from "../../../utils/bamSignalInsightsLogic";

type PodcastCardProps = {
  podcast: PodcastViewModel;
};

export function PodcastCard({ podcast }: PodcastCardProps) {
  return (
    <article className="bsi-podcast-card institute-glass">
      <header className="bsi-podcast-card__head">
        <h3>{podcast.title}</h3>
        <span className="bsi-podcast-card__badge">{CONVERSATIONS_LABEL}</span>
      </header>

      <p className="bsi-podcast-card__labels">{INSIGHTS_LABEL}</p>
      <p className="bsi-podcast-card__episodes">{podcast.episodeLabel}</p>
      <p className="bsi-podcast-card__summary">{podcast.summary}</p>
      <p className="bsi-podcast-card__status">{podcast.statusLabel}</p>
    </article>
  );
}
