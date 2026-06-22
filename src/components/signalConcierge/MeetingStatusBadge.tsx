import { MEETING_STATUS_LABELS } from "../../constants/meetingInfrastructure";
import type { MeetingInfrastructureStatus } from "../../types/meetingLink";

type MeetingStatusBadgeProps = {
  status: MeetingInfrastructureStatus;
};

export function MeetingStatusBadge({ status }: MeetingStatusBadgeProps) {
  return (
    <span className={`meeting-status-badge meeting-status-badge--${status.replace(/\s+/g, "-")}`}>
      {MEETING_STATUS_LABELS[status]}
    </span>
  );
}
