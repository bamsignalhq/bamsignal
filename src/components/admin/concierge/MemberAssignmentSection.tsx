import { useMemo } from "react";
import { CONSULTANT_ASSIGNMENT_ENGINE_BRAND } from "../../../constants/consultantAssignment";
import type { ConciergeMemberRecord } from "../../../types/conciergeConsultant";
import { buildMemberAssignmentBundle } from "../../../utils/consultantAssignmentEngine";
import { getMemberStewardName } from "../../../utils/conciergeMemberStewardship";
import { AssignmentHealthBadge } from "./AssignmentHealthBadge";
import { AssignmentReasonCard } from "./AssignmentReasonCard";
import { ConsultantRecommendationCard } from "./ConsultantRecommendationCard";
import { WorkloadCard } from "./WorkloadCard";

type MemberAssignmentSectionProps = {
  member: ConciergeMemberRecord;
};

export function MemberAssignmentSection({ member }: MemberAssignmentSectionProps) {
  const bundle = useMemo(() => buildMemberAssignmentBundle(member), [member]);
  const stewardName = getMemberStewardName(member);

  if (!bundle.recommendation || !bundle.summary) {
    return (
      <section className="member-assignment concierge-consultant-card concierge-consultant-card--glass cc-reveal">
        <header className="concierge-consultant-card__head">
          <h3>Assignment</h3>
          <p>{CONSULTANT_ASSIGNMENT_ENGINE_BRAND}</p>
        </header>
        <p className="member-assignment__empty">No active consultants available for stewardship recommendations.</p>
      </section>
    );
  }

  return (
    <section className="member-assignment">
      <header className="member-assignment__section-head cc-reveal">
        <h2>Assignment</h2>
        <p>{CONSULTANT_ASSIGNMENT_ENGINE_BRAND} — members belong to BamSignal; consultants act as stewards.</p>
      </header>

      <div className="member-assignment__overview concierge-consultant-card concierge-consultant-card--glass cc-reveal">
        <dl className="member-assignment__grid">
          <div>
            <dt>Current steward</dt>
            <dd>{stewardName ?? "Awaiting steward assignment"}</dd>
          </div>
          <div>
            <dt>Recommended consultant</dt>
            <dd>{bundle.summary.recommendedConsultantName}</dd>
          </div>
          <div>
            <dt>Assignment reason</dt>
            <dd>{bundle.summary.reason.label}</dd>
          </div>
          <div>
            <dt>Workload status</dt>
            <dd>
              <AssignmentHealthBadge health={bundle.summary.workloadHealth} />
            </dd>
          </div>
          {member.journeyId ? (
            <div>
              <dt>Journey ID</dt>
              <dd className="member-assignment__journey-id">{member.journeyId}</dd>
            </div>
          ) : null}
        </dl>
      </div>

      <div className="member-assignment__cards">
        <ConsultantRecommendationCard recommendation={bundle.recommendation} />
        <AssignmentReasonCard reason={bundle.summary.reason} />
        {bundle.currentStewardWorkload ? (
          <WorkloadCard workload={bundle.currentStewardWorkload} title="Current steward workload" />
        ) : (
          <WorkloadCard workload={bundle.recommendation.workload} title="Recommended steward workload" />
        )}
      </div>
    </section>
  );
}
