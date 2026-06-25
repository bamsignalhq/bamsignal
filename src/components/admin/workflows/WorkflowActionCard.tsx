import {
  WORKFLOW_ACTION_LABELS,
  WORKFLOW_DEFINITION_LABELS
} from "../../../constants/workflowEngine";
import type { WorkflowActionRecord } from "../../../types/workflowEngine";

type WorkflowActionCardProps = {
  actions: WorkflowActionRecord[];
};

export function WorkflowActionCard({ actions }: WorkflowActionCardProps) {
  return (
    <section className="workflow-engine-card workflow-action-card concierge-consultant-card--glass cc-reveal">
      <header className="workflow-engine-card__head">
        <h3>Actions</h3>
        <p>Email, WhatsApp, calendar, assignment, notification, CRM update, archive.</p>
      </header>
      {actions.length ? (
        <ul className="workflow-engine-card__list">
          {actions.map((item) => (
            <li key={item.id}>
              <div className="workflow-engine-card__row">
                <strong>
                  {WORKFLOW_DEFINITION_LABELS[item.workflowId]} — step {item.sequence}
                </strong>
                <span className="workflow-engine-card__action">
                  {WORKFLOW_ACTION_LABELS[item.actionType]}
                </span>
              </div>
              <div className="workflow-engine-card__meta">
                <span>{item.actionRef}</span>
                <span>{item.enabled ? "Enabled" : "Disabled"}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="workflow-engine-card__empty">No actions configured.</p>
      )}
    </section>
  );
}
