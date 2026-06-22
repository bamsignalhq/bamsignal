import { useMemo, useState } from "react";
import {
  CELEBRATING_LOVE_LABEL,
  OUR_STORY_LABEL,
  SUCCESS_STORY_ENGINE_SUBCOPY,
  SUCCESS_STORY_ENGINE_TITLE
} from "../../../constants/successStoryEngine";
import { listSuccessStoryConsents } from "../../../utils/conciergeSuccessStoryConsentStore";
import { getSuccessStoryWithConsent } from "../../../utils/SuccessStoryEngine";
import { StoryConsentCard } from "./StoryConsentCard";
import { StoryTimelineCard } from "./StoryTimelineCard";
import { SuccessStoryCard } from "./SuccessStoryCard";

type SuccessStoryPageProps = {
  /** Optional — defaults to first seeded journey or first consent. */
  journeyId?: string;
};

export function SuccessStoryPage({ journeyId: journeyIdProp }: SuccessStoryPageProps) {
  const consents = listSuccessStoryConsents();
  const defaultJourneyId = journeyIdProp ?? consents[0]?.journeyId ?? "BS-JR-2028-0045";
  const [journeyId, setJourneyId] = useState(defaultJourneyId);

  const bundle = useMemo(() => getSuccessStoryWithConsent(journeyId), [journeyId]);

  return (
    <div className="success-story-engine-page">
      <header className="success-story-engine-page__head">
        <h2>{SUCCESS_STORY_ENGINE_TITLE}</h2>
        <p>{SUCCESS_STORY_ENGINE_SUBCOPY}</p>
      </header>

      {consents.length > 1 ? (
        <div className="success-story-engine-page__picker concierge-consultant-card--glass">
          <label htmlFor="success-story-journey-picker">
            Journey
            <select
              id="success-story-journey-picker"
              value={journeyId}
              onChange={(event) => setJourneyId(event.target.value)}
            >
              {consents.map((consent) => (
                <option key={consent.journeyId} value={consent.journeyId}>
                  {consent.memberAName} & {consent.memberBName} · {consent.journeyId}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      <div className="success-story-engine-page__grid">
        <SuccessStoryCard journeyId={journeyId} story={bundle.story} />
        <StoryConsentCard consent={bundle.consent} />
        <StoryTimelineCard journeyId={journeyId} />
      </div>

      <p className="success-story-engine-page__footer">
        {OUR_STORY_LABEL} · {CELEBRATING_LOVE_LABEL} — preserved with dignity.
      </p>
    </div>
  );
}
