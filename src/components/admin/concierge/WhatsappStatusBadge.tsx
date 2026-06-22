import { WHATSAPP_STATUS_LABELS } from "../../../constants/whatsappTemplates";
import type { WhatsappDeliveryStatus } from "../../../types/conciergeWhatsapp";

type WhatsappStatusBadgeProps = {
  status: WhatsappDeliveryStatus;
};

export function WhatsappStatusBadge({ status }: WhatsappStatusBadgeProps) {
  return (
    <span className={`whatsapp-status-badge whatsapp-status-badge--${status}`}>
      {WHATSAPP_STATUS_LABELS[status]}
    </span>
  );
}
