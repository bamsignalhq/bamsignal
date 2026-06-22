import type { SupportTicketStatusId } from "../../constants/supportCenter";
import { SUPPORT_TICKET_STATUS_LABELS } from "../../constants/supportCenter";

type TicketStatusBadgeProps = {
  status: SupportTicketStatusId;
};

export function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
  return (
    <span className={`support-status-badge support-status-badge--${status}`}>
      {SUPPORT_TICKET_STATUS_LABELS[status]}
    </span>
  );
}
