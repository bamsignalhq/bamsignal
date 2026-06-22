import { CONSULTATION_STATUS_LABELS } from "../../../constants/consultationScheduler";
import type { ConsultationMeetingStatus } from "../../../types/consultationScheduler";

type ConsultationStatusBadgeProps = {
  status: ConsultationMeetingStatus;
};

export function ConsultationStatusBadge({ status }: ConsultationStatusBadgeProps) {
  return (
    <span className={`consultation-status-badge consultation-status-badge--${status}`}>
      {CONSULTATION_STATUS_LABELS[status]}
    </span>
  );
}
