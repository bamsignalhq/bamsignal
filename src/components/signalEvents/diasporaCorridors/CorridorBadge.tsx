import type { CorridorStatusId } from "../../../constants/diasporaCorridors";
import { corridorStatusLabel } from "../../../constants/diasporaCorridors";

type CorridorBadgeProps = {
  status: CorridorStatusId;
  primary?: boolean;
};

export function CorridorBadge({ status, primary = false }: CorridorBadgeProps) {
  return (
    <span
      className={`dc-corridor-badge dc-corridor-badge--${status}${
        primary ? " dc-corridor-badge--primary" : ""
      }`}
    >
      {corridorStatusLabel(status)}
    </span>
  );
}
