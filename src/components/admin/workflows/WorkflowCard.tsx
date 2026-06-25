import {
  WORKFLOW_DEFINITION_LABELS,
  WORKFLOW_STATUS_LABELS
} from "../../../constants/workflowEngine";
import type { WorkflowRecord } from "../../../types/workflowEngine";

type WorkflowCardProps = {
  workflows: WorkflowRecord[];
};

export function WorkflowCard({ workflows }: WorkflowCardProps) {
  return (
    <section className="workflow-engine-card workflow-card concierge-consultant-card--glass cc-reveal">
      <header className="workflow-engine-card__head">
        <h3>Workflows</h3>
        <p>Institutional automation definitions — application through success story request.</p>
      </header>
      {workflows.length ? (
        <ul className="workflow-engine-card__list">
          {workflows.map((item) => (
            <li key={item.id}>
              <div className="workflow-engine-card__row">
                <strong>{WORKFLOW_DEFINITION_LABELS[item.workflowId]}</strong>
                <span
                  className={`workflow-engine-card__badge workflow-engine-card__badge--${item.status}`}
                >
                  {WORKFLOW_STATUS_LABELS[item.status]}
                </span>
              </div>
              <div className="workflow-engine-card__meta">
                <span>{item.workflowRef}</span>
                <span>{item.runCount} runs</span>
                <span>{item.ownerEmail}</span>
              </div>
              {item.description ? (
                <p className="workflow-engine-card__detail">{item.description}</p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="workflow-engine-card__empty">No workflows match this filter.</p>
      )}
    </section>
  );
}
