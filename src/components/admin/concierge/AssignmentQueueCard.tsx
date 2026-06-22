import { useMemo, useState } from "react";
import {
  RECOMMENDATION_LEVEL_LABELS,
  WORKLOAD_HEALTH_LABELS
} from "../../../constants/consultantAssignment";
import type { OperationsCenterBundle } from "../../../types/operationsCenter";
import type { AssignmentDecision } from "../../../types/consultantAssignment";
import { listConciergeMembers } from "../../../utils/conciergeConsultantStore";
import {
  confirmAssignmentDecision,
  prepareAssignmentDecision
} from "../../../utils/consultantAssignmentEngine";
import { assignAdminConciergeMember } from "../../../services/adminConcierge";
import { AssignmentDecisionCard } from "./AssignmentDecisionCard";
import { ConsultantCapacityBadge } from "./ConsultantCapacityBadge";
import { ConsultantWorkloadCard } from "./ConsultantWorkloadCard";

type AssignmentQueueCardProps = {
  bundle: OperationsCenterBundle;
  onAssignmentConfirmed?: () => void;
};

function AssignmentList({
  title,
  rows,
  emptyLabel
}: {
  title: string;
  rows: OperationsCenterBundle["assignmentQueue"]["unassignedApplications"];
  emptyLabel: string;
}) {
  return (
    <div className="operations-center-panel__block">
      <h4>{title}</h4>
      {rows.length === 0 ? <p className="concierge-consultant__empty">{emptyLabel}</p> : null}
      <ul className="concierge-consultant-list">
        {rows.slice(0, 10).map((row) => (
          <li key={row.id} className="concierge-consultant-list__item">
            <div>
              <strong>{row.memberName}</strong>
              <span>
                {row.journeyStage} · {row.city}
              </span>
              {row.recommendedConsultantName ? (
                <span>
                  Recommend {row.recommendedConsultantName}
                  {row.level ? ` · ${RECOMMENDATION_LEVEL_LABELS[row.level]}` : ""}
                </span>
              ) : null}
              {row.reason ? <span>{row.reason}</span> : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AssignmentQueueCard({ bundle, onAssignmentConfirmed }: AssignmentQueueCardProps) {
  const { assignmentQueue } = bundle;
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const selectedDecision = useMemo((): AssignmentDecision | null => {
    if (!selectedMemberId) return null;
    const member = listConciergeMembers().find((item) => item.id === selectedMemberId);
    return member ? prepareAssignmentDecision(member) : null;
  }, [selectedMemberId, bundle.generatedAt]);

  const handleConfirm = async (decision: AssignmentDecision) => {
    setConfirming(true);
    try {
      const local = confirmAssignmentDecision(decision, "Operations Center");
      if (!local) {
        await assignAdminConciergeMember(decision.memberId, decision.consultantId);
      }
      setSelectedMemberId(null);
      onAssignmentConfirmed?.();
    } finally {
      setConfirming(false);
    }
  };

  return (
    <section className="operations-center-assignments concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Assignment Queue</h3>
        <p>Consultant Assignment Engine™ — workload balancing and intelligent recommendations.</p>
      </header>

      <AssignmentList
        title="Unassigned Applications"
        rows={assignmentQueue.unassignedApplications}
        emptyLabel="All applications have stewards."
      />
      <AssignmentList
        title="Pending Review"
        rows={assignmentQueue.pendingReview}
        emptyLabel="No applications awaiting review."
      />

      <div className="operations-center-panel__block">
        <h4>Consultant Workload Overview</h4>
        {assignmentQueue.workloadOverview.length === 0 ? (
          <p className="concierge-consultant__empty">No consultants loaded.</p>
        ) : (
          <div className="operations-center-assignments__workloads">
            {assignmentQueue.workloadOverview.slice(0, 4).map((row) => (
              <article key={row.consultantId} className="operations-center-assignments__workload-row">
                <div>
                  <strong>{row.consultantName}</strong>
                  <ConsultantCapacityBadge level={row.capacityLevel} workload={row.health} />
                </div>
                <span>
                  {WORKLOAD_HEALTH_LABELS[row.health]} · score {row.workloadScore} · {row.regionLabel}
                </span>
                <span>
                  {row.activeMembers} members · {row.pendingConsultations} consultations ·{" "}
                  {row.introductionsInProgress} introductions · {row.pendingFollowUps} follow-ups ·{" "}
                  {row.upcomingMeetings} meetings
                </span>
              </article>
            ))}
          </div>
        )}
      </div>

      <AssignmentList
        title="Assignment Recommendations"
        rows={assignmentQueue.recommendations}
        emptyLabel="No assignment recommendations right now."
      />

      {assignmentQueue.recommendations.length > 0 ? (
        <div className="operations-center-panel__block">
          <h4>Admin-confirmed auto assignment</h4>
          <p className="concierge-consultant__empty">
            Select a member to review the recommended steward. Assignments never run automatically.
          </p>
          <div className="operations-center-assignments__picker">
            {assignmentQueue.recommendations.slice(0, 6).map((row) => (
              <button
                key={row.id}
                type="button"
                className={`concierge-consultant-btn${selectedMemberId === row.id ? " is-active" : ""}`}
                onClick={() => setSelectedMemberId(row.id)}
              >
                {row.memberName}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {selectedDecision ? (
        <AssignmentDecisionCard
          decision={selectedDecision}
          confirming={confirming}
          onConfirm={handleConfirm}
        />
      ) : null}
    </section>
  );
}
