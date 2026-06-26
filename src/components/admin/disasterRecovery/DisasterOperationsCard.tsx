import { DISASTER_RECOVERY_OPERATIONS } from "../../../constants/disasterRecovery";
import type { DisasterRecoveryOperationId } from "../../../constants/disasterRecovery";

type DisasterOperationsCardProps = {
  onOperation: (operationId: DisasterRecoveryOperationId) => void;
  busyOperation: string | null;
};

export function DisasterOperationsCard({ onOperation, busyOperation }: DisasterOperationsCardProps) {
  return (
    <section className="disaster-operations-card concierge-consultant-card--glass cc-reveal">
      <header>
        <h3>Operations</h3>
        <p>Run backup, restore, verify integrity, compare snapshots, and recovery simulation.</p>
      </header>
      <div className="disaster-operations-card__grid">
        {DISASTER_RECOVERY_OPERATIONS.map((operation) => (
          <button
            key={operation.id}
            type="button"
            className="disaster-operation-chip"
            disabled={busyOperation === operation.id}
            onClick={() => onOperation(operation.id)}
          >
            <strong>{operation.label}</strong>
            <span>{busyOperation === operation.id ? "Working…" : "Execute"}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
