import {
  INTRODUCTION_STATUS_LABELS,
  type IntroductionStatus
} from "../../../constants/conciergeIntroduction";

type IntroductionStatusBadgeProps = {
  status: IntroductionStatus;
};

export function IntroductionStatusBadge({ status }: IntroductionStatusBadgeProps) {
  return (
    <span className={`introduction-status-badge introduction-status-badge--${status}`}>
      {INTRODUCTION_STATUS_LABELS[status]}
    </span>
  );
}
