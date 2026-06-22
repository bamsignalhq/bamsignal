import { CONCIERGE_EMAIL_STATUS_LABELS } from "../../../constants/emailTemplates";
import type { EmailDeliveryStatus } from "../../../types/conciergeEmail";

type EmailStatusBadgeProps = {
  status: EmailDeliveryStatus;
};

export function EmailStatusBadge({ status }: EmailStatusBadgeProps) {
  return (
    <span className={`email-status-badge email-status-badge--${status}`}>
      {CONCIERGE_EMAIL_STATUS_LABELS[status]}
    </span>
  );
}
