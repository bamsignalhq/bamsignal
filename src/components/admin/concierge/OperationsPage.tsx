import { useEffect, useMemo, useState } from "react";
import {
  CONCIERGE_OPERATIONS_BRAND,
  OPERATION_HEALTH_LABELS,
  OPERATION_STAGE_LABELS
} from "../../../constants/conciergeOperations";
import type { ConciergeOperation } from "../../../types/conciergeOperations";
import {
  listConciergeOperations,
  syncConciergeOperationsFromMembers
} from "../../../utils/SignalConciergeOperationsEngine";
import { OperationsHealthCard } from "./OperationsHealthCard";
import { OperationsStageBadge } from "./OperationsStageBadge";
import { OperationsSummaryCard } from "./OperationsSummaryCard";
import { OperationsTimelineCard } from "./OperationsTimelineCard";

export function OperationsPage() {
  const [operations, setOperations] = useState<ConciergeOperation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    syncConciergeOperationsFromMembers();
    setOperations(listConciergeOperations());
    setLoading(false);
  }, []);

  const selected = useMemo(
    () => operations.find((operation) => operation.operationId === selectedId) ?? null,
    [operations, selectedId]
  );

  return (
    <div className="concierge-operations-page">
      <header className="concierge-operations-page__head">
        <div>
          <h3>{CONCIERGE_OPERATIONS_BRAND}</h3>
          <p>Permanent operation IDs, pipeline stages, and append-only continuity.</p>
        </div>
      </header>

      <div className="concierge-operations-page__body">
        <aside className="concierge-operations-page__list concierge-consultant-card--glass">
          <h4>Operations</h4>
          {loading ? <p className="concierge-consultant__empty">Loading operations…</p> : null}
          {!loading && operations.length === 0 ? (
            <p className="concierge-consultant__empty">No concierge operations yet.</p>
          ) : null}
          <ul>
            {operations.map((operation) => (
              <li key={operation.operationId}>
                <button
                  type="button"
                  className={`concierge-consultant-member-row${
                    selectedId === operation.operationId
                      ? " concierge-consultant-member-row--active"
                      : ""
                  }`}
                  onClick={() => setSelectedId(operation.operationId)}
                >
                  <div>
                    <strong>{operation.operationId}</strong>
                    <span>
                      {operation.memberName} · {operation.journeyId}
                    </span>
                    <span>
                      {OPERATION_STAGE_LABELS[operation.currentStage]} ·{" "}
                      {OPERATION_HEALTH_LABELS[operation.health]}
                    </span>
                  </div>
                  <OperationsStageBadge stage={operation.currentStage} />
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="concierge-operations-page__detail">
          {selected ? (
            <div className="concierge-operations-page__cards">
              <OperationsSummaryCard operation={selected} />
              <OperationsHealthCard operation={selected} />
              <OperationsTimelineCard operation={selected} />
            </div>
          ) : (
            <div className="concierge-consultant-card concierge-consultant-card--glass concierge-consultant-dashboard__placeholder cc-reveal">
              <h3>Select an operation</h3>
              <p>Review operation ID, current stage, timeline, health, consultant, and journey ID.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
