import { SAFETY_IMMUTABLE_RULES, SAFETY_STATUS_LABELS, SAFETY_WORKFLOWS } from "../../../constants/safetyCenter";

export function EscalationWorkflowCard() {
  return (
    <section className="escalation-workflow-card concierge-consultant-card--glass cc-reveal">
      <header className="escalation-workflow-card__head">
        <h3>Escalation workflows</h3>
        <p>Proactive safety response — not reactive.</p>
      </header>

      <ol className="escalation-workflow-card__steps">
        {SAFETY_WORKFLOWS.map((workflow) => (
          <li key={workflow.id}>
            <strong>{workflow.label}</strong>
            {workflow.targetStatus ? (
              <span>→ {SAFETY_STATUS_LABELS[workflow.targetStatus]}</span>
            ) : (
              <span>→ assigns investigator</span>
            )}
          </li>
        ))}
      </ol>

      <footer className="escalation-workflow-card__rules">
        <h4>Rules</h4>
        <ul>
          {SAFETY_IMMUTABLE_RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </footer>
    </section>
  );
}
