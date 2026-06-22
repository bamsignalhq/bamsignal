import { useState } from "react";
import {
  SUCCESS_STORY_DUAL_APPROVAL_NOTE,
  SUCCESS_STORY_LEVEL_EXAMPLES,
  SUCCESS_STORY_PHOTO_LABELS,
  SUCCESS_STORY_PRIVACY_NOTE,
  SUCCESS_STORY_TESTIMONIAL_LABELS,
  SUCCESS_STORY_VIDEO_LABELS,
  SUCCESS_STORY_VISIBILITY_LABELS,
  type SuccessStoryPhotoPermission,
  type SuccessStoryTestimonialPermission,
  type SuccessStoryVideoPermission,
  type SuccessStoryVisibilityLevel
} from "../../constants/conciergeSuccessStoryConsent";
import type { SuccessStoryConsentRecord } from "../../types/conciergeSuccessStoryConsent";
import type { SuccessStoryConsentPermissions } from "../../types/conciergeSuccessStoryConsent";

type SuccessStoryConsentCardProps = {
  consent: SuccessStoryConsentRecord;
  currentMemberId: string;
  currentMemberName: string;
  readOnly?: boolean;
  onSavePermissions?: (permissions: Partial<SuccessStoryConsentPermissions>) => void;
  onApprove?: () => void;
  onWithdraw?: () => void;
};

export function SuccessStoryConsentCard({
  consent,
  currentMemberId,
  currentMemberName,
  readOnly = false,
  onSavePermissions,
  onApprove,
  onWithdraw
}: SuccessStoryConsentCardProps) {
  const [visibility, setVisibility] = useState(consent.visibility);
  const [photoPermission, setPhotoPermission] = useState(consent.photoPermission);
  const [videoPermission, setVideoPermission] = useState(consent.videoPermission);
  const [testimonialPermission, setTestimonialPermission] = useState(consent.testimonialPermission);

  const isParty =
    currentMemberId === consent.memberAId || currentMemberId === consent.memberBId;
  const partyApproval =
    currentMemberId === consent.memberAId
      ? consent.partyApprovals.memberA
      : consent.partyApprovals.memberB;

  const handleSave = () => {
    onSavePermissions?.({
      visibility,
      photoPermission,
      videoPermission,
      testimonialPermission
    });
  };

  return (
    <section className="success-story-consent-card signal-concierge-glass">
      <p className="success-story-consent-card__privacy">{SUCCESS_STORY_PRIVACY_NOTE}</p>
      <p className="success-story-consent-card__dual">{SUCCESS_STORY_DUAL_APPROVAL_NOTE}</p>

      <div className="success-story-consent-card__levels">
        {(Object.keys(SUCCESS_STORY_VISIBILITY_LABELS) as SuccessStoryVisibilityLevel[]).map((level) => (
          <label key={level} className={`success-story-consent-card__level${visibility === level ? " is-active" : ""}`}>
            <input
              type="radio"
              name="visibility"
              value={level}
              checked={visibility === level}
              disabled={readOnly}
              onChange={() => setVisibility(level)}
            />
            <strong>{SUCCESS_STORY_VISIBILITY_LABELS[level]}</strong>
            <span>{SUCCESS_STORY_LEVEL_EXAMPLES[level]}</span>
          </label>
        ))}
      </div>

      <div className="success-story-consent-card__permissions">
        <label>
          Photos
          <select
            value={photoPermission}
            disabled={readOnly}
            onChange={(event) => setPhotoPermission(event.target.value as SuccessStoryPhotoPermission)}
          >
            {(Object.keys(SUCCESS_STORY_PHOTO_LABELS) as SuccessStoryPhotoPermission[]).map((key) => (
              <option key={key} value={key}>
                {SUCCESS_STORY_PHOTO_LABELS[key]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Video
          <select
            value={videoPermission}
            disabled={readOnly}
            onChange={(event) => setVideoPermission(event.target.value as SuccessStoryVideoPermission)}
          >
            {(Object.keys(SUCCESS_STORY_VIDEO_LABELS) as SuccessStoryVideoPermission[]).map((key) => (
              <option key={key} value={key}>
                {SUCCESS_STORY_VIDEO_LABELS[key]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Testimonial
          <select
            value={testimonialPermission}
            disabled={readOnly}
            onChange={(event) =>
              setTestimonialPermission(event.target.value as SuccessStoryTestimonialPermission)
            }
          >
            {(Object.keys(SUCCESS_STORY_TESTIMONIAL_LABELS) as SuccessStoryTestimonialPermission[]).map(
              (key) => (
                <option key={key} value={key}>
                  {SUCCESS_STORY_TESTIMONIAL_LABELS[key]}
                </option>
              )
            )}
          </select>
        </label>
      </div>

      {!readOnly && isParty ? (
        <div className="success-story-consent-card__actions">
          <button type="button" className="signal-concierge-btn signal-concierge-btn--ghost" onClick={handleSave}>
            Save preferences
          </button>
          <button
            type="button"
            className="signal-concierge-btn signal-concierge-btn--primary"
            onClick={onApprove}
            disabled={partyApproval.approved}
          >
            {partyApproval.approved ? `${currentMemberName} approved` : "Approve sharing"}
          </button>
          <button type="button" className="signal-concierge-btn signal-concierge-btn--ghost" onClick={onWithdraw}>
            Withdraw consent
          </button>
        </div>
      ) : null}
    </section>
  );
}
