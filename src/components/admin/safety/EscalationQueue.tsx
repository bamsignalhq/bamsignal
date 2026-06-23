import { SAFETY_CASE_TYPE_LABELS, SAFETY_SEVERITY_LABELS } from "../../../constants/safetyCenter";
import type { SafetyCaseRecord } from "../../../types/safetyCenter";
import { SafetySeverityBadge } from "./SafetySeverityBadge";

type EscalationQueueProps = {
  cases: SafetyCaseRecord[];
  selectedCaseId: string | null;
  onSelectCase: (caseId: string) => void;
};

export function EscalationQueue({ cases, selectedCaseId, onSelectCase }: EscalationQueueProps) {
  return (
    <section className="escalation-queue concierge-consultant-card--glass cc-reveal" aria-label="Escalation queue">
      <header className="escalation-queue__head">
        <h3>Escalation queue</h3>
        <p>Critical and action-required cases requiring senior review.</p>
      </header>

      {cases.length ? (
        <div className="escalation-queue__list">
          {cases.map((record) => {
            const caseTypeId = record.caseTypeId ?? record.categoryId ?? "harassment";
            const caseRef = record.caseRef ?? record.incidentRef ?? record.id;
            return (
              <button
                key={record.id}
                type="button"
                className={`escalation-queue__row${selectedCaseId === record.id ? " is-selected" : ""}`}
                onClick={() => onSelectCase(record.id)}
              >
                <div className="escalation-queue__row-head">
                  <strong>{caseRef}</strong>
                  <SafetySeverityBadge severity={record.severity} />
                </div>
                <span>{record.summary}</span>
                <span>
                  {SAFETY_CASE_TYPE_LABELS[caseTypeId]} · {SAFETY_SEVERITY_LABELS[record.severity]}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="escalation-queue__empty">No escalated cases in queue.</p>
      )}
    </section>
  );
}
