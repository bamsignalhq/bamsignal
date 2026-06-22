import { OPERATION_STAGE_LABELS } from "../../../constants/conciergeOperations";
import type { OperationStage } from "../../../types/conciergeOperations";

type OperationsStageBadgeProps = {
  stage: OperationStage;
  primary?: boolean;
};

export function OperationsStageBadge({ stage, primary = false }: OperationsStageBadgeProps) {
  return (
    <span
      className={`operations-stage-badge operations-stage-badge--${stage}${
        primary ? " operations-stage-badge--primary" : ""
      }`}
    >
      {OPERATION_STAGE_LABELS[stage]}
    </span>
  );
}
