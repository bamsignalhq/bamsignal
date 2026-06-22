import {
  SUCCESS_STORY_DUAL_APPROVAL_NOTE,
  SUCCESS_STORY_PRIVACY_NOTE,
  SUCCESS_STORY_VISIBILITY_LABELS,
  SUCCESS_STORY_WITHDRAWAL_NOTE
} from "../../../constants/conciergeSuccessStoryConsent";
import {
  CELEBRATING_LOVE_LABEL,
  SUCCESS_STORY_DEFAULT_PRIVATE_COPY,
  SUCCESS_STORY_TYPE_LABELS
} from "../../../constants/successStoryEngine";
import type { SuccessStoryConsentRecord } from "../../../types/conciergeSuccessStoryConsent";
import { canPublishSuccessStory } from "../../../utils/successStoryConsentLogic";
import { SuccessStoryBadge } from "./SuccessStoryBadge";

type StoryConsentCardProps = {
  consent: SuccessStoryConsentRecord | null;
};

export function StoryConsentCard({ consent }: StoryConsentCardProps) {
  const publishable = consent ? canPublishSuccessStory(consent) : false;

  return (
    <section className="story-consent-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Consent</h3>
        <p>{CELEBRATING_LOVE_LABEL}</p>
      </header>

      <p className="story-consent-card__private">{SUCCESS_STORY_DEFAULT_PRIVATE_COPY}</p>
      <p className="story-consent-card__privacy">{SUCCESS_STORY_PRIVACY_NOTE}</p>
      <p className="story-consent-card__dual">{SUCCESS_STORY_DUAL_APPROVAL_NOTE}</p>

      {consent ? (
        <>
          <div className="story-consent-card__badge-row">
            <SuccessStoryBadge
              storyType={consent.visibility}
              privateDefault
              publishable={publishable}
            />
            <span className="story-consent-card__publishable">
              {publishable ? "Dual consent complete" : "Awaiting dual consent"}
            </span>
          </div>

          <ul className="story-consent-card__levels">
            {(Object.keys(SUCCESS_STORY_TYPE_LABELS) as Array<keyof typeof SUCCESS_STORY_TYPE_LABELS>).map(
              (level) => (
                <li
                  key={level}
                  className={`story-consent-card__level${consent.visibility === level ? " is-active" : ""}`}
                >
                  <strong>{SUCCESS_STORY_VISIBILITY_LABELS[level]}</strong>
                </li>
              )
            )}
          </ul>

          <p className="story-consent-card__withdrawal">{SUCCESS_STORY_WITHDRAWAL_NOTE}</p>
        </>
      ) : (
        <p className="concierge-consultant__empty">No consent record for this journey yet.</p>
      )}
    </section>
  );
}
