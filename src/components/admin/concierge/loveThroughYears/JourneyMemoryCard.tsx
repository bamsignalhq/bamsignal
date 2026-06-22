import {
  CELEBRATING_YOUR_STORY_LABEL,
  JOURNEY_MEMORIES_LABEL,
  LOVE_THROUGH_YEARS_SUBCOPY
} from "../../../../constants/loveThroughYears";
import type { LoveThroughYearsTimelineRow } from "../../../../utils/loveThroughYearsLogic";

type JourneyMemoryCardProps = {
  journeyId: string;
  timeline: LoveThroughYearsTimelineRow[];
  reachedCount: number;
};

export function JourneyMemoryCard({ journeyId, timeline, reachedCount }: JourneyMemoryCardProps) {
  const latestReached = [...timeline].reverse().find((row) => row.reached);

  return (
    <section className="journey-memory-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>{JOURNEY_MEMORIES_LABEL}</h3>
        <p>{LOVE_THROUGH_YEARS_SUBCOPY}</p>
      </header>

      <p className="journey-memory-card__labels">{CELEBRATING_YOUR_STORY_LABEL}</p>

      <div className="journey-memory-card__journey">
        <span>Journey ID</span>
        <strong>{journeyId}</strong>
      </div>

      <div className="journey-memory-card__summary">
        <p>
          <strong>{reachedCount}</strong> of {timeline.length} chapters preserved
        </p>
        {latestReached ? (
          <p className="journey-memory-card__latest">
            Latest: {latestReached.label}
            {latestReached.year ? ` · ${latestReached.year}` : ""}
          </p>
        ) : null}
      </div>
    </section>
  );
}
