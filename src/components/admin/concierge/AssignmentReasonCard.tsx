import { ASSIGNMENT_RULE_TARGET_ROLE } from "../../../constants/consultantAssignment";
import { CONCIERGE_CONSULTANT_ROLE_LABELS } from "../../../constants/conciergeConsultantRoles";
import type { AssignmentReason } from "../../../types/consultantAssignment";

type AssignmentReasonCardProps = {
  reason: AssignmentReason;
};

export function AssignmentReasonCard({ reason }: AssignmentReasonCardProps) {
  const targetRole = CONCIERGE_CONSULTANT_ROLE_LABELS[ASSIGNMENT_RULE_TARGET_ROLE[reason.code]];

  return (
    <section className="assignment-reason concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Assignment reason</h3>
        <p>Why this steward fits this member journey.</p>
      </header>
      <div className="assignment-reason__badge">
        <span>Rule</span>
        <strong>{reason.label}</strong>
      </div>
      <p className="assignment-reason__detail">{reason.detail}</p>
      <div className="assignment-reason__target">
        <span>Target role</span>
        <strong>{targetRole}</strong>
      </div>
    </section>
  );
}
