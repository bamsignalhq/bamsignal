import {
  SUCCESS_STORY_PHOTO_LABELS,
  SUCCESS_STORY_PRIVACY_HEADLINE,
  SUCCESS_STORY_TESTIMONIAL_LABELS,
  SUCCESS_STORY_VIDEO_LABELS,
  SUCCESS_STORY_WITHDRAWAL_NOTE
} from "../../constants/conciergeSuccessStoryConsent";
import type { SuccessStoryConsentRecord } from "../../types/conciergeSuccessStoryConsent";
import { canPublishSuccessStory, getPartyApprovalStatus } from "../../utils/successStoryConsentLogic";
import { StoryVisibilityBadge } from "./StoryVisibilityBadge";

type ConsentSummaryCardProps = {
  consent: SuccessStoryConsentRecord;
  className?: string;
};

export function ConsentSummaryCard({ consent, className = "" }: ConsentSummaryCardProps) {
  const status = getPartyApprovalStatus(consent);
  const publishable = canPublishSuccessStory(consent);

  return (
    <section className={`consent-summary-card signal-concierge-glass${className ? ` ${className}` : ""}`}>
      <header className="consent-summary-card__head">
        <h3>{SUCCESS_STORY_PRIVACY_HEADLINE}</h3>
        <StoryVisibilityBadge level={consent.visibility} publishable={publishable} />
      </header>

      <dl className="consent-summary-card__grid">
        <div>
          <dt>Photo permissions</dt>
          <dd>{SUCCESS_STORY_PHOTO_LABELS[consent.photoPermission]}</dd>
        </div>
        <div>
          <dt>Video permissions</dt>
          <dd>{SUCCESS_STORY_VIDEO_LABELS[consent.videoPermission]}</dd>
        </div>
        <div>
          <dt>Testimonial permissions</dt>
          <dd>{SUCCESS_STORY_TESTIMONIAL_LABELS[consent.testimonialPermission]}</dd>
        </div>
        <div>
          <dt>Couple approval</dt>
          <dd>
            {status.memberA.memberName}: {status.memberA.approved ? "Approved" : "Pending"}
            {" · "}
            {status.memberB.memberName}: {status.memberB.approved ? "Approved" : "Pending"}
          </dd>
        </div>
        {status.memberA.approvedAt ? (
          <div>
            <dt>{status.memberA.memberName} approved</dt>
            <dd>{new Date(status.memberA.approvedAt).toLocaleString()}</dd>
          </div>
        ) : null}
        {status.memberB.approvedAt ? (
          <div>
            <dt>{status.memberB.memberName} approved</dt>
            <dd>{new Date(status.memberB.approvedAt).toLocaleString()}</dd>
          </div>
        ) : null}
        {consent.withdrawnAt ? (
          <div>
            <dt>Withdrawn</dt>
            <dd>{new Date(consent.withdrawnAt).toLocaleString()}</dd>
          </div>
        ) : null}
      </dl>

      <p className="consent-summary-card__note">{SUCCESS_STORY_WITHDRAWAL_NOTE}</p>
    </section>
  );
}
