import {
  CELEBRATING_YOUR_STORY_LABEL,
  JOURNEY_LABEL,
  LEGACY_LABEL
} from "../../../constants/relationshipLegacyExperience";
import type { JourneyMilestoneEntry } from "../../../types/journeyMilestone";
import type { LegacyQuoteEntry } from "../../../constants/relationshipLegacyQuotes";
import type { LegacyProfileViewModel } from "../../../utils/relationshipLegacyIndexLogic";
import { buildLegacyExperienceDisplayRows } from "../../../utils/relationshipLegacyExperienceLogic";
import { LegacyQuoteTimeline } from "./LegacyQuoteTimeline";

type LegacyTimelinePageProps = {
  profile: LegacyProfileViewModel;
  milestones?: JourneyMilestoneEntry[];
  quotes?: LegacyQuoteEntry[];
};

export function LegacyTimelinePage({
  profile,
  milestones = [],
  quotes = []
}: LegacyTimelinePageProps) {
  const rows = buildLegacyExperienceDisplayRows(profile, quotes, milestones);

  return (
    <div className="legacy-timeline-page">
      <section className="legacy-timeline-page__summary concierge-consultant-card--glass cc-reveal">
        <header className="concierge-consultant-card__head">
          <h3>{JOURNEY_LABEL} timeline</h3>
          <p>
            {LEGACY_LABEL} · {CELEBRATING_YOUR_STORY_LABEL}
          </p>
        </header>

        <ol className="legacy-timeline-page__list">
          {rows.map((row) => (
            <li
              key={row.id}
              className={`legacy-timeline-page__item${row.reached ? " is-reached" : ""}`}
            >
              <span className="legacy-timeline-page__label">{row.label}</span>
              {row.value ? (
                <span className="legacy-timeline-page__value">{row.value}</span>
              ) : (
                <span className="legacy-timeline-page__pending">—</span>
              )}
            </li>
          ))}
        </ol>
      </section>

      {quotes.length ? (
        <section className="legacy-timeline-page__quotes concierge-consultant-card--glass cc-reveal">
          <header className="concierge-consultant-card__head">
            <h3>Legacy Quotes</h3>
            <p>{CELEBRATING_YOUR_STORY_LABEL}</p>
          </header>
          <LegacyQuoteTimeline quotes={quotes} />
        </section>
      ) : null}
    </div>
  );
}
