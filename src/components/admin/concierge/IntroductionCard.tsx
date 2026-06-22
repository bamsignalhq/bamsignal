import { useState } from "react";
import {
  INTRODUCTION_FOLLOW_UP_INTERVALS,
  INTRODUCTION_INTERNAL_FLAGS,
  INTRODUCTION_OUTCOME_LABELS,
  INTRODUCTION_STATUS_LABELS,
  type IntroductionFollowUpInterval,
  type IntroductionOutcome,
  type IntroductionStatus
} from "../../../constants/conciergeIntroduction";
import type { IntroductionRecord } from "../../../types/conciergeIntroduction";
import {
  advanceIntroductionStatus,
  getIntroductionPreviewForMember,
  getMemberDisplayName,
  recordIntroductionMemberApproval,
  scheduleIntroductionFollowUp,
  setIntroductionOutcome
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

  const handleOutcome = (outcome: IntroductionOutcome) => {
    setIntroductionOutcome(record.id, outcome);
    onUpdated();
  };

  return (
    <article className="introduction-card concierge-consultant-card--glass">
      <header className="introduction-card__head">
        <div>
          <h3>
            {getMemberDisplayName(record.memberAId)} & {getMemberDisplayName(record.memberBId)}
          </h3>
          <p>{INTRODUCTION_STATUS_LABELS[record.status]}</p>
        </div>
        <div className="introduction-card__meta">
          {record.successProbability != null ? (
            <span className="introduction-card__probability">{record.successProbability}% journey fit</span>
          ) : null}
          {record.outcome ? (
            <span className="introduction-card__outcome">{INTRODUCTION_OUTCOME_LABELS[record.outcome]}</span>
          ) : null}
        </div>
      </header>

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
          <p>{record.memberAApproved === true ? "Approved" : record.memberAApproved === false ? "Declined" : "Pending"}</p>
          <div className="introduction-card__consent-actions">
            <button type="button" className="concierge-consultant-btn" onClick={() => handleApproval(record.memberAId, true)}>
              Approve
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
          ) : null}
        </div>

        <div className="introduction-card__consent-col">
          <h4>{memberB?.aboutYou.name ?? "Member B"}</h4>
          <p>{record.memberBApproved === true ? "Approved" : record.memberBApproved === false ? "Declined" : "Pending"}</p>
          <div className="introduction-card__consent-actions">
            <button type="button" className="concierge-consultant-btn" onClick={() => handleApproval(record.memberBId, true)}>
              Approve
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
          ) : null}
        </div>
      </div>

      {record.bothConsented ? (
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
          No introduction may proceed without both members agreeing.
        </p>
      )}

      <section className="introduction-card__actions">
        <button type="button" className="concierge-consultant-btn" onClick={() => handleAdvance("consultant-review")}>
          Consultant review
        </button>
        <button
          type="button"
          className="concierge-consultant-btn"
          disabled={!record.bothConsented}
          onClick={() => handleAdvance("conversation-started")}
        >
          Conversation started
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
        <label className="introduction-card__outcome-select">
          Outcome
          <select
            value={record.outcome ?? ""}
            onChange={(event) => handleOutcome(event.target.value as IntroductionOutcome)}
          >
            <option value="">Select outcome</option>
            {Object.entries(INTRODUCTION_OUTCOME_LABELS).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
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
