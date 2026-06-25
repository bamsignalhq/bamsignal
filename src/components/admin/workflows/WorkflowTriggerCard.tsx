import {
  WORKFLOW_DEFINITION_LABELS,
  WORKFLOW_TRIGGER_LABELS
} from "../../../constants/workflowEngine";
import type { WorkflowTriggerRecord } from "../../../types/workflowEngine";

type WorkflowTriggerCardProps = {
  triggers: WorkflowTriggerRecord[];
};

export function WorkflowTriggerCard({ triggers }: WorkflowTriggerCardProps) {
  return (
    <section className="workflow-engine-card workflow-trigger-card concierge-consultant-card--glass cc-reveal">
      <header className="workflow-engine-card__head">
        <h3>Triggers</h3>
        <p>Payment, status change, date, consultant action, admin action, journey milestone.</p>
      </header>
      {triggers.length ? (
        <ul className="workflow-engine-card__list">
          {triggers.map((item) => (
            <li key={item.id}>
              <div className="workflow-engine-card__row">
                <strong>{WORKFLOW_DEFINITION_LABELS[item.workflowId]}</strong>
                <span className="workflow-engine-card__trigger">
                  {WORKFLOW_TRIGGER_LABELS[item.triggerType]}
                </span>
              </div>
              <div className="workflow-engine-card__meta">
                <span>{item.triggerRef}</span>
                <span>{item.enabled ? "Enabled" : "Disabled"}</span>
              </div>
              <code className="workflow-engine-card__config">{JSON.stringify(item.config)}</code>
            </li>
          ))}
        </ul>
      ) : (
        <p className="workflow-engine-card__empty">No triggers configured.</p>
      )}
    </section>
  );
}
