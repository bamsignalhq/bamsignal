import { OPERATION_PIPELINE_STAGES } from "../../../constants/conciergeOperations";
import type { ConciergeOperation } from "../../../types/conciergeOperations";
import { OperationsStageBadge } from "./OperationsStageBadge";

type OperationsTimelineCardProps = {
  operation: ConciergeOperation;
};

export function OperationsTimelineCard({ operation }: OperationsTimelineCardProps) {
  const reachedStages = new Set(operation.timeline.map((entry) => entry.stage));

  return (
    <section className="operations-timeline concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Operations Timeline</h3>
        <p>Append-only history — preserved for continuity.</p>
      </header>

      <ol className="operations-timeline__pipeline" aria-label="Operation pipeline">
        {OPERATION_PIPELINE_STAGES.map((stage) => {
          const reached = reachedStages.has(stage);
          const active = operation.currentStage === stage;
          return (
            <li
              key={stage}
              className={`operations-timeline__pipeline-item${
                reached ? " operations-timeline__pipeline-item--reached" : ""
              }${active ? " operations-timeline__pipeline-item--active" : ""}`}
            >
              <span className="operations-timeline__pipeline-dot" aria-hidden />
              <OperationsStageBadge stage={stage} />
            </li>
          );
        })}
      </ol>

      {operation.timeline.length ? (
        <ol className="operations-timeline__entries">
          {operation.timeline.map((entry) => (
            <li key={entry.id} className="operations-timeline__entry">
              <span className="operations-timeline__entry-dot" aria-hidden />
              <div>
                <strong>{entry.label}</strong>
                {entry.detail ? <p>{entry.detail}</p> : null}
                {entry.actorName ? <span className="operations-timeline__actor">{entry.actorName}</span> : null}
                <time dateTime={entry.at}>{new Date(entry.at).toLocaleString()}</time>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="concierge-consultant__empty">Timeline entries will appear as the journey advances.</p>
      )}
    </section>
  );
}
