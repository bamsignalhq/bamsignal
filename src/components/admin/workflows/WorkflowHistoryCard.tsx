import {
  WORKFLOW_DEFINITION_LABELS,
  WORKFLOW_TRIGGER_LABELS
} from "../../../constants/workflowEngine";
import type { WorkflowHistoryRecord, WorkflowStepLog } from "../../../types/workflowEngine";

type WorkflowHistoryCardProps = {
  history: WorkflowHistoryRecord[];
  stepLogs: WorkflowStepLog[];
};

export function WorkflowHistoryCard({ history, stepLogs }: WorkflowHistoryCardProps) {
  return (
    <section className="workflow-engine-card workflow-history-card concierge-consultant-card--glass cc-reveal">
      <header className="workflow-engine-card__head">
        <h3>Workflow history</h3>
        <p>Recent automation runs with trigger source, status, and step-level execution detail.</p>
      </header>
      {history.length ? (
        <ul className="workflow-engine-card__list">
          {history.map((item) => {
            const steps = stepLogs.filter((step) => step.runId === item.id);
            return (
              <li key={item.id}>
                <div className="workflow-engine-card__row">
                  <strong>{WORKFLOW_DEFINITION_LABELS[item.workflowId]}</strong>
                  <span
                    className={`workflow-engine-card__badge workflow-engine-card__badge--${item.status}`}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="workflow-engine-card__meta">
                  <span>{item.historyRef}</span>
                  <span>{WORKFLOW_TRIGGER_LABELS[item.triggerType]}</span>
                  <span>{item.triggeredBy}</span>
                  <time dateTime={item.startedAt}>
                    {new Date(item.startedAt).toLocaleString()}
                  </time>
                </div>
                {item.resultSummary ? (
                  <p className="workflow-engine-card__detail">{item.resultSummary}</p>
                ) : null}
                {steps.length ? (
                  <ul className="workflow-history-card__steps">
                    {steps.map((step) => (
                      <li key={step.id}>
                        {step.actionType} — {step.status}: {step.detail}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="workflow-engine-card__empty">No workflow runs recorded yet.</p>
      )}
    </section>
  );
}
