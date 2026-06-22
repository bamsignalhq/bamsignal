import { useState } from "react";
import {
  INTRODUCTION_FOLLOW_UP_INTERVALS,
  INTRODUCTION_INTERNAL_FLAGS,
  INTRODUCTION_STATUS_LABELS,
  type IntroductionFollowUpInterval,
  type IntroductionStatus
} from "../../../constants/conciergeIntroduction";
import { INTRODUCTION_ID_LABEL } from "../../../constants/introductionId";
import type { IntroductionRecord } from "../../../types/conciergeIntroduction";
import {
  advanceIntroductionStatus,
  getIntroductionPreviewForMember,
  getIntroductionRevealForMember,
  getMemberDisplayName,
  recordIntroductionMemberApproval,
  scheduleIntroductionFollowUp
} from "../../../utils/IntroductionEngine";
import { getConciergeMember } from "../../../utils/conciergeConsultantStore";
import { IntroductionFeedbackCard } from "./IntroductionFeedbackCard";

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
      <header className="introduction-card__head">
        <div>
          <p className="introduction-card__id">
            {INTRODUCTION_ID_LABEL}: <strong>{record.introductionId}</strong>
          </p>
          <h3>
            {getMemberDisplayName(record.memberAId)} & {getMemberDisplayName(record.memberBId)}
          </h3>
          <p>{INTRODUCTION_STATUS_LABELS[record.status]}</p>
        </div>
        <div className="introduction-card__meta">
          {record.compatibilityScore != null ? (
            <span className="introduction-card__score">
              Compatibility {record.compatibilityScore}
            </span>
          ) : null}
          {record.consultantName ? (
            <span className="introduction-card__consultant">{record.consultantName}</span>
          ) : null}
          <time dateTime={record.createdAt} className="introduction-card__created">
            {new Date(record.createdAt).toLocaleDateString()}
          </time>
        </div>
      </header>

      <div className="introduction-card__journeys">
        <span>Journey A: {record.journeyAId ?? "—"}</span>
        <span>Journey B: {record.journeyBId ?? "—"}</span>
      </div>

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
              {previewForA.voiceVibeAvailable ? <span>Voice Vibe available</span> : null}
              {previewForA.trustedMember ? <span>Trusted Member</span> : null}
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
              {previewForB.voiceVibeAvailable ? <span>Voice Vibe available</span> : null}
              {previewForB.trustedMember ? <span>Trusted Member</span> : null}
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

      <IntroductionFeedbackCard
        recordId={record.id}
        feedback={record.feedback}
        onUpdated={onUpdated}
      />
    </article>
  );
}
