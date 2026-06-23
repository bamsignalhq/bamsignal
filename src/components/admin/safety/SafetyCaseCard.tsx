import { SAFETY_CASE_TYPE_LABELS, SAFETY_STATUS_LABELS } from "../../../constants/safetyCenter";
import type { SafetyCaseRecord } from "../../../types/safetyCenter";
import { SafetySeverityBadge } from "./SafetySeverityBadge";

type SafetyCaseCardProps = {
  record: SafetyCaseRecord;
  selected?: boolean;
  onSelect?: () => void;
};

export function SafetyCaseCard({ record, selected = false, onSelect }: SafetyCaseCardProps) {
  const caseTypeId = record.caseTypeId ?? record.categoryId ?? "harassment";
  const caseRef = record.caseRef ?? record.incidentRef ?? record.id;

  const content = (
    <>
      <div className="safety-case-card__head">
        <p className="safety-case-card__ref">{caseRef}</p>
        <SafetySeverityBadge severity={record.severity} />
      </div>
      <h3>{SAFETY_CASE_TYPE_LABELS[caseTypeId]}</h3>
      <p>{record.summary}</p>
      <dl className="safety-case-card__meta">
        <div>
          <dt>Status</dt>
          <dd>{SAFETY_STATUS_LABELS[record.status]}</dd>
        </div>
        <div>
          <dt>Subject</dt>
          <dd>{record.subjectLabel}</dd>
        </div>
        <div>
          <dt>Investigator</dt>
          <dd>{record.investigator ?? "Unassigned"}</dd>
        </div>
        <div>
          <dt>Reported</dt>
          <dd>{new Date(record.reportedAt).toLocaleDateString()}</dd>
        </div>
      </dl>
    </>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        className={`safety-case-card safety-case-card--button${selected ? " is-selected" : ""}`}
        onClick={onSelect}
      >
        {content}
      </button>
    );
  }

  return <article className="safety-case-card">{content}</article>;
}
