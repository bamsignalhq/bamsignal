import { useState } from "react";
import {
  SUCCESS_STORY_CONSENT_TITLE,
  SUCCESS_STORY_PRIVACY_HEADLINE
} from "../../../constants/conciergeSuccessStoryConsent";
import { listSuccessStoryConsents } from "../../../utils/conciergeSuccessStoryConsentStore";
import { canPublishSuccessStory } from "../../../utils/successStoryConsentLogic";
import { ConsentHistoryTimeline } from "../../signalConcierge/ConsentHistoryTimeline";
import { ConsentSummaryCard } from "../../signalConcierge/ConsentSummaryCard";
import { StoryVisibilityBadge } from "../../signalConcierge/StoryVisibilityBadge";

export function SuccessStoryConsentAdminPage() {
  const consents = listSuccessStoryConsents();
  const [selectedJourneyId, setSelectedJourneyId] = useState(consents[0]?.journeyId ?? "");
  const selected = consents.find((item) => item.journeyId === selectedJourneyId) ?? null;

  return (
    <div className="success-story-consent-admin">
      <header className="success-story-consent-admin__head">
        <h2>{SUCCESS_STORY_CONSENT_TITLE}</h2>
        <p>{SUCCESS_STORY_PRIVACY_HEADLINE} — admin view. Nothing publishes without dual approval.</p>
      </header>

      <div className="success-story-consent-admin__body">
        <aside className="success-story-consent-admin__list concierge-consultant-card--glass">
          <h3>Couple consents</h3>
          {!consents.length ? (
            <p className="concierge-consultant__empty">No success story consents yet.</p>
          ) : null}
          <ul>
            {consents.map((consent) => (
              <li key={consent.journeyId}>
                <button
                  type="button"
                  className={`success-story-consent-admin__row${
                    selectedJourneyId === consent.journeyId ? " is-active" : ""
                  }`}
                  onClick={() => setSelectedJourneyId(consent.journeyId)}
                >
                  <strong>
                    {consent.memberAName} & {consent.memberBName}
                  </strong>
                  <span>{consent.journeyId}</span>
                  <StoryVisibilityBadge
                    level={consent.visibility}
                    publishable={canPublishSuccessStory(consent)}
                  />
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="success-story-consent-admin__detail">
          {selected ? (
            <>
              <ConsentSummaryCard consent={selected} className="consent-summary-card--admin" />
              <section className="concierge-consultant-card concierge-consultant-card--glass cc-reveal">
                <header className="concierge-consultant-card__head">
                  <h3>Consent history</h3>
                </header>
                <ConsentHistoryTimeline history={selected.history} />
              </section>
            </>
          ) : (
            <div className="concierge-consultant-card concierge-consultant-card--glass">
              <p className="concierge-consultant__empty">Select a couple to review consent.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
