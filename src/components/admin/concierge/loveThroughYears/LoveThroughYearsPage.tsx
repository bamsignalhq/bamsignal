import { useMemo, useState } from "react";
import {
  CELEBRATING_YOUR_STORY_LABEL,
  JOURNEY_MEMORIES_LABEL,
  LOVE_THROUGH_YEARS_SUBCOPY,
  LOVE_THROUGH_YEARS_TITLE
} from "../../../../constants/loveThroughYears";
import { LOVE_THROUGH_YEARS_ARCHITECTURE_JOURNEY_IDS } from "../../../../data/loveThroughYearsSeed";
import { getLoveThroughYearsBundle } from "../../../../utils/LoveThroughYearsEngine";
import { JourneyMemoryCard } from "./JourneyMemoryCard";
import { LegacyQuoteCard } from "./LegacyQuoteCard";
import { MemoryTimelineCard } from "./MemoryTimelineCard";
import { MilestonePhotoCard } from "./MilestonePhotoCard";

type LoveThroughYearsPageProps = {
  journeyId?: string;
};

export function LoveThroughYearsPage({ journeyId: journeyIdProp }: LoveThroughYearsPageProps) {
  const defaultJourneyId = journeyIdProp ?? LOVE_THROUGH_YEARS_ARCHITECTURE_JOURNEY_IDS[0] ?? "";
  const [journeyId, setJourneyId] = useState(defaultJourneyId);

  const bundle = useMemo(() => getLoveThroughYearsBundle(journeyId), [journeyId]);

  return (
    <div className="love-through-years-page">
      <header className="love-through-years-page__head">
        <h2>{LOVE_THROUGH_YEARS_TITLE}</h2>
        <p>{LOVE_THROUGH_YEARS_SUBCOPY}</p>
        <p className="love-through-years-page__labels">
          {JOURNEY_MEMORIES_LABEL} · {CELEBRATING_YOUR_STORY_LABEL}
        </p>
      </header>

      {LOVE_THROUGH_YEARS_ARCHITECTURE_JOURNEY_IDS.length > 1 ? (
        <div className="love-through-years-page__picker concierge-consultant-card--glass">
          <label htmlFor="love-through-years-journey-picker">
            Journey
            <select
              id="love-through-years-journey-picker"
              value={journeyId}
              onChange={(event) => setJourneyId(event.target.value)}
            >
              {LOVE_THROUGH_YEARS_ARCHITECTURE_JOURNEY_IDS.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      <div className="love-through-years-page__grid">
        <JourneyMemoryCard
          journeyId={bundle.journeyId}
          timeline={bundle.timeline}
          reachedCount={bundle.reachedCount}
        />
        <MemoryTimelineCard timeline={bundle.timeline} />
        <MilestonePhotoCard photoSlots={bundle.photoSlots} />
        <LegacyQuoteCard quotes={bundle.quotes} />
      </div>
    </div>
  );
}
