import { APPLICATION_APPROVAL_STATUS_LABELS } from "../../../constants/applicationApproval";
import type { ApplicationApprovalStatus } from "../../../types/applicationApproval";

type ApprovalStatusBadgeProps = {
  status: ApplicationApprovalStatus;
};

export function ApprovalStatusBadge({ status }: ApprovalStatusBadgeProps) {
  return (
    <span className={`approval-status-badge approval-status-badge--${status}`}>
      {APPLICATION_APPROVAL_STATUS_LABELS[status]}
    </span>
  );
}
