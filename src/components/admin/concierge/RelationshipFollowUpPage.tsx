import { useCallback, useEffect, useMemo, useState } from "react";
import {
  RELATIONSHIP_FOLLOW_UP_SUBCOPY,
  RELATIONSHIP_FOLLOW_UP_TITLE,
  RELATIONSHIP_STAGE_LABELS,
  type RelationshipStage
} from "../../../constants/relationshipFollowUp";
import { listIntroductionRecords } from "../../../utils/conciergeIntroductionStore";
import type { RelationshipFollowUpRecord } from "../../../types/relationshipFollowUp";
import {
  advanceRelationshipStage,
  createRelationshipFollowUp,
  getFollowUpMemberDisplayName,
  listRelationshipFollowUpHistory
} from "../../../utils/RelationshipFollowUpEngine";
import { RelationshipAnniversaryCard } from "./RelationshipAnniversaryCard";
import { RelationshipCelebrationCard } from "./RelationshipCelebrationCard";
import { RelationshipCheckInCard } from "./RelationshipCheckInCard";
import { RelationshipHealthCard } from "./RelationshipHealthCard";
import { RelationshipJournalCard } from "./RelationshipJournalCard";
import { RelationshipMilestoneCard } from "./RelationshipMilestoneCard";
import { RelationshipOutcomeCard } from "./RelationshipOutcomeCard";
import { RelationshipPauseCard } from "./RelationshipPauseCard";
import { RelationshipRecoveryCard } from "./RelationshipRecoveryCard";
import { RelationshipStageCard } from "./RelationshipStageCard";
import { RelationshipSuccessCard } from "./RelationshipSuccessCard";
import { RelationshipTimeline } from "./RelationshipTimeline";
import { useAdminToast } from "../AdminToast";

export function RelationshipFollowUpPage() {
  const { pushToast } = useAdminToast();
  const [records, setRecords] = useState<RelationshipFollowUpRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [introductionId, setIntroductionId] = useState("");

  const introductions = useMemo(() => listIntroductionRecords(), [records]);
  const eligibleIntroductions = useMemo(
    () =>
      introductions.filter(
        (intro) =>
          intro.bothConsented &&
          ["active-conversation", "exclusive", "relationship", "engaged", "married"].includes(intro.status)
      ),
    [introductions]
  );

  const refresh = useCallback(() => {
    setRecords(listRelationshipFollowUpHistory());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const selected = records.find((record) => record.id === selectedId) ?? null;

  const handleCreate = () => {
    const intro = introductions.find((item) => item.introductionId === introductionId);
    if (!intro) {
      pushToast("Select a valid introduction.");
      return;
    }
    const created = createRelationshipFollowUp({
      introductionId: intro.introductionId,
      memberAId: intro.memberAId,
      memberBId: intro.memberBId,
      journeyAId: intro.journeyAId,
      journeyBId: intro.journeyBId,
      consultantId: intro.consultantId
    });
    if (!created) {
      pushToast("Could not create follow-up — may already exist.");
      return;
    }
    pushToast(`Follow-up started for ${intro.introductionId}.`);
    setIntroductionId("");
    setSelectedId(created.id);
    refresh();
  };

  const handleAdvanceStage = (stage: RelationshipStage) => {
    if (!selected) return;
    advanceRelationshipStage(selected.id, stage);
    refresh();
  };

  return (
    <div className="relationship-follow-up">
      <header className="relationship-follow-up__head">
        <div>
          <h2>{RELATIONSHIP_FOLLOW_UP_TITLE}</h2>
          <p>{RELATIONSHIP_FOLLOW_UP_SUBCOPY}</p>
        </div>
      </header>

      <section className="relationship-follow-up__create concierge-consultant-card--glass">
        <h3>Start follow-up</h3>
        <div className="relationship-follow-up__create-grid">
          <label>
            Introduction
            <select value={introductionId} onChange={(e) => setIntroductionId(e.target.value)}>
              <option value="">Select introduction</option>
              {eligibleIntroductions.map((intro) => (
                <option key={intro.id} value={intro.introductionId}>
                  {intro.introductionId} — {getFollowUpMemberDisplayName(intro.memberAId)} &{" "}
                  {getFollowUpMemberDisplayName(intro.memberBId)}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="concierge-consultant-btn" onClick={handleCreate}>
            Begin follow-up
          </button>
        </div>
      </section>

      <section className="relationship-follow-up__list concierge-consultant-card--glass">
        <h3>Active journeys</h3>
        {records.length ? (
          <ul className="relationship-follow-up__rows">
            {records.map((record) => (
              <li key={record.id}>
                <button
                  type="button"
                  className={`relationship-follow-up__row${selectedId === record.id ? " is-active" : ""}`}
                  onClick={() => setSelectedId(record.id)}
                >
                  <span className="relationship-follow-up__id">{record.introductionId}</span>
                  <strong>
                    {getFollowUpMemberDisplayName(record.memberAId)} &{" "}
                    {getFollowUpMemberDisplayName(record.memberBId)}
                  </strong>
                  <span>{RELATIONSHIP_STAGE_LABELS[record.stage]}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="concierge-consultant__empty">No relationship follow-ups yet.</p>
        )}
      </section>

      {selected ? (
        <div className="relationship-follow-up__detail">
          <RelationshipTimeline record={selected} />
          <div className="relationship-follow-up__detail-grid">
            <RelationshipStageCard record={selected} onAdvance={handleAdvanceStage} />
            <RelationshipHealthCard record={selected} onUpdated={refresh} />
            <RelationshipCheckInCard record={selected} onUpdated={refresh} />
            <RelationshipJournalCard record={selected} onUpdated={refresh} />
            <RelationshipMilestoneCard record={selected} onUpdated={refresh} />
            <RelationshipCelebrationCard record={selected} onUpdated={refresh} />
            <RelationshipAnniversaryCard record={selected} onUpdated={refresh} />
            <RelationshipOutcomeCard record={selected} onUpdated={refresh} />
            <RelationshipPauseCard record={selected} onUpdated={refresh} />
            <RelationshipRecoveryCard record={selected} onUpdated={refresh} />
            <RelationshipSuccessCard record={selected} onUpdated={refresh} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
