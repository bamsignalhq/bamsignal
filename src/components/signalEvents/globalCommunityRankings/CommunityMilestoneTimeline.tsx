import {
  COMMUNITY_JOURNEY_LABEL,
  getCommunityMaturityFactorDefinition
} from "../../../constants/globalCommunityRankings";
import type { CommunityMaturityMilestoneEntry } from "../../../constants/globalCommunityRankings";

type CommunityMilestoneTimelineProps = {
  cityName: string;
  milestones: CommunityMaturityMilestoneEntry[];
};

export function CommunityMilestoneTimeline({ cityName, milestones }: CommunityMilestoneTimelineProps) {
  const sorted = [...milestones].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );

  return (
    <section className="gcr-community-milestone-timeline signal-events-glass">
      <header className="gcr-community-milestone-timeline__head">
        <h3>{COMMUNITY_JOURNEY_LABEL}</h3>
        <p>{cityName} — community milestones preserved with care.</p>
      </header>

      {sorted.length ? (
        <ol className="gcr-community-milestone-timeline__list">
          {sorted.map((entry) => {
            const factor = getCommunityMaturityFactorDefinition(entry.factorId);
            return (
              <li key={entry.id} className="gcr-community-milestone-timeline__item">
                <span className="gcr-community-milestone-timeline__dot" aria-hidden />
                <div>
                  <strong>{factor?.label ?? entry.factorId}</strong>
                  {entry.note ? <p className="gcr-community-milestone-timeline__note">{entry.note}</p> : null}
                  <time dateTime={entry.recordedAt}>
                    {new Date(entry.recordedAt).toLocaleDateString()}
                  </time>
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="gcr-community-milestone-timeline__empty">
          Community milestones will appear as your local journey matures.
        </p>
      )}
    </section>
  );
}
