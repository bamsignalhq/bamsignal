import { OPERATION_STATUS_LABELS } from "../../../constants/conciergeOperations";
import type { ConciergeOperation } from "../../../types/conciergeOperations";
import { OperationsStageBadge } from "./OperationsStageBadge";

type OperationsSummaryCardProps = {
  operation: ConciergeOperation;
};

export function OperationsSummaryCard({ operation }: OperationsSummaryCardProps) {
  return (
    <section className="operations-summary concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Operation Summary</h3>
        <p>{operation.operationId}</p>
      </header>
      <dl className="operations-summary__grid">
        <div>
          <dt>Member</dt>
          <dd>{operation.memberName}</dd>
        </div>
        <div>
          <dt>Journey ID</dt>
          <dd>{operation.journeyId}</dd>
        </div>
        <div>
          <dt>Current stage</dt>
          <dd>
            <OperationsStageBadge stage={operation.currentStage} primary />
          </dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{OPERATION_STATUS_LABELS[operation.status]}</dd>
        </div>
        <div>
          <dt>Assigned consultant</dt>
          <dd>{operation.assignedConsultantName ?? "Unassigned"}</dd>
        </div>
        <div>
          <dt>Last updated</dt>
          <dd>
            <time dateTime={operation.updatedAt}>
              {new Date(operation.updatedAt).toLocaleString()}
            </time>
          </dd>
        </div>
      </dl>
    </section>
  );
}
