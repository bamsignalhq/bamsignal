import { useState } from "react";
import {
  INTRODUCTION_FOLLOW_UP_INTERVALS,
  INTRODUCTION_INTERNAL_FLAGS,
  type IntroductionFollowUpInterval,
  type IntroductionStatus
} from "../../../constants/conciergeIntroduction";
import type { IntroductionRecord } from "../../../types/conciergeIntroduction";
import {
  advanceIntroductionStatus,
  getIntroductionPreviewForMember,
  getIntroductionRevealForMember,
  recordIntroductionMemberApproval,
  scheduleIntroductionFollowUp
} from "../../../utils/IntroductionEngine";
import { getConciergeMember } from "../../../utils/conciergeConsultantStore";
import { IntroductionFeedbackCard } from "./IntroductionFeedbackCard";
import { IntroductionHeader } from "./IntroductionHeader";

type IntroductionCardProps = {
  record: IntroductionRecord;
  onUpdated: () => void;
};

export function IntroductionCard({ record, onUpdated }: IntroductionCardProps) {
  const [followUpInterval, setFollowUpInterval] = useState<IntroductionFollowUpInterval>(
    record.followUpInterval ?? "7-days"
  );
  const memberA = getConciergeMember(record.memberAId);
  const memberB = getConciergeMember(record.memberBId);
  const previewForA = getIntroductionPreviewForMember(record, record.memberAId);
  const previewForB = getIntroductionPreviewForMember(record, record.memberBId);
  const revealForA = getIntroductionRevealForMember(record, record.memberAId);
  const revealForB = getIntroductionRevealForMember(record, record.memberBId);

  const handleAdvance = (status: IntroductionStatus) => {
    const result = advanceIntroductionStatus(record.id, status);
    if (!result.ok) return;
    onUpdated();
  };

  const handleApproval = (memberId: string, approved: boolean) => {
    void recordIntroductionMemberApproval(record.id, memberId, approved);
    onUpdated();
  };

  const handleFollowUp = () => {
    scheduleIntroductionFollowUp(record.id, followUpInterval);
    onUpdated();
  };

  return (
    <article className="introduction-card concierge-consultant-card--glass">
      <IntroductionHeader record={record} />

      {record.internalFlags.length ? (
        <div className="introduction-card__flags">
          {record.internalFlags.map((flag) => {
            const label = INTRODUCTION_INTERNAL_FLAGS.find((item) => item.id === flag)?.label ?? flag;
            return (
              <span key={flag} className="introduction-card__flag">
                {label}
              </span>
            );
          })}
        </div>
      ) : null}

      <section className="introduction-card__section">
        <h4>Consultant message</h4>
        <p className="introduction-card__message">{record.consultantMessage}</p>
        {record.notes ? <p className="introduction-card__notes">{record.notes}</p> : null}
      </section>

      <div className="introduction-card__consent">
        <div className="introduction-card__consent-col">
          <h4>{memberA?.aboutYou.name ?? "Member A"}</h4>
          <p>{record.memberAApproved === true ? "Accepted" : record.memberAApproved === false ? "Declined" : "Pending"}</p>
          <div className="introduction-card__consent-actions">
            <button type="button" className="concierge-consultant-btn" onClick={() => handleApproval(record.memberAId, true)}>
              Present
            </button>
            <button type="button" className="concierge-consultant-btn" onClick={() => handleApproval(record.memberAId, false)}>
              Decline
            </button>
          </div>
          {previewForA ? (
            <div className="introduction-card__preview">
              <strong>{previewForA.firstName}</strong>
              <span>
                {previewForA.age} · {previewForA.city} · {previewForA.occupation}
              </span>
              <span>{previewForA.relationshipGoalsSummary}</span>
              {previewForA.connectionReasons.length ? (
                <ul className="introduction-card__reasons">
                  {previewForA.connectionReasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              ) : null}
              <em>{previewForA.consultantNote}</em>
            </div>
          ) : (
            <p className="introduction-card__preview-placeholder">Preview locked until mutual acceptance.</p>
          )}
        </div>

        <div className="introduction-card__consent-col">
          <h4>{memberB?.aboutYou.name ?? "Member B"}</h4>
          <p>{record.memberBApproved === true ? "Accepted" : record.memberBApproved === false ? "Declined" : "Pending"}</p>
          <div className="introduction-card__consent-actions">
            <button type="button" className="concierge-consultant-btn" onClick={() => handleApproval(record.memberBId, true)}>
              Present
            </button>
            <button type="button" className="concierge-consultant-btn" onClick={() => handleApproval(record.memberBId, false)}>
              Decline
            </button>
          </div>
          {previewForB ? (
            <div className="introduction-card__preview">
              <strong>{previewForB.firstName}</strong>
              <span>
                {previewForB.age} · {previewForB.city} · {previewForB.occupation}
              </span>
              <span>{previewForB.relationshipGoalsSummary}</span>
              {previewForB.connectionReasons.length ? (
                <ul className="introduction-card__reasons">
                  {previewForB.connectionReasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              ) : null}
              <em>{previewForB.consultantNote}</em>
            </div>
          ) : (
            <p className="introduction-card__preview-placeholder">Preview locked until mutual acceptance.</p>
          )}
        </div>
      </div>

      {record.bothConsented && (revealForA || revealForB) ? (
        <section className="introduction-card__section introduction-card__reveal">
          <h4>After both accept</h4>
          <p>Photos, Voice Vibe, video introduction, and contact bridge may be shared.</p>
          <div className="introduction-card__reveal-grid">
            <div>
              <strong>{memberA?.aboutYou.name}</strong>
              <p>{memberA?.photos.length ?? 0} photos · Voice {memberA?.voiceVibe.completed ? "yes" : "no"} · Video {memberA?.videoIntro.completed ? "yes" : "no"}</p>
            </div>
            <div>
              <strong>{memberB?.aboutYou.name}</strong>
              <p>{memberB?.photos.length ?? 0} photos · Voice {memberB?.voiceVibe.completed ? "yes" : "no"} · Video {memberB?.videoIntro.completed ? "yes" : "no"}</p>
            </div>
          </div>
        </section>
      ) : (
        <p className="introduction-card__consent-rule">
          Neither member sees the other until both agree.
        </p>
      )}

      <section className="introduction-card__actions">
        <button type="button" className="concierge-consultant-btn" onClick={() => handleAdvance("pending-review")}>
          Internal review
        </button>
        <button type="button" className="concierge-consultant-btn" onClick={() => handleAdvance("compatibility-review")}>
          Compatibility review
        </button>
        <button
          type="button"
          className="concierge-consultant-btn"
          disabled={!record.bothConsented}
          onClick={() => handleAdvance("active-conversation")}
        >
          Active conversation
        </button>
        <label className="introduction-card__follow-up">
          Follow-up
          <select
            value={followUpInterval}
            onChange={(event) => setFollowUpInterval(event.target.value as IntroductionFollowUpInterval)}
          >
            {INTRODUCTION_FOLLOW_UP_INTERVALS.map((interval) => (
              <option key={interval.id} value={interval.id}>
                {interval.label}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="concierge-consultant-btn" onClick={handleFollowUp}>
          Schedule follow-up
        </button>
        <button type="button" className="concierge-consultant-btn" onClick={() => handleAdvance("paused")}>
          Pause
        </button>
        <button type="button" className="concierge-consultant-btn" onClick={() => handleAdvance("closed")}>
          Close introduction
        </button>
      </section>

      <IntroductionFeedbackCard recordId={record.id} feedback={record.feedback} onUpdated={onUpdated} />
    </article>
  );
}
