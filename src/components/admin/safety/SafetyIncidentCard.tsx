import {
  SAFETY_CATEGORY_LABELS,
  SAFETY_STATUS_LABELS
} from "../../../constants/safetyCenter";
import type { SafetyIncidentRecord } from "../../../types/safetyCenter";
import { SafetySeverityBadge } from "./SafetySeverityBadge";

type SafetyIncidentCardProps = {
  incident: SafetyIncidentRecord;
  selected?: boolean;
  onSelect?: () => void;
};

export function SafetyIncidentCard({ incident, selected = false, onSelect }: SafetyIncidentCardProps) {
  const content = (
    <>
      <div className="safety-incident-card__head">
        <p className="safety-incident-card__ref">{incident.incidentRef}</p>
        <SafetySeverityBadge severity={incident.severity} />
      </div>
      <h3>{SAFETY_CATEGORY_LABELS[incident.categoryId]}</h3>
      <p>{incident.summary}</p>
      <dl className="safety-incident-card__meta">
        <div>
          <dt>Status</dt>
          <dd>{SAFETY_STATUS_LABELS[incident.status]}</dd>
        </div>
        <div>
          <dt>Subject</dt>
          <dd>{incident.subjectLabel}</dd>
        </div>
        <div>
          <dt>Investigator</dt>
          <dd>{incident.investigator ?? "Unassigned"}</dd>
        </div>
        <div>
          <dt>Reported</dt>
          <dd>{new Date(incident.reportedAt).toLocaleDateString()}</dd>
        </div>
      </dl>
    </>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        className={`safety-incident-card safety-incident-card--button${selected ? " is-selected" : ""}`}
        onClick={onSelect}
      >
        {content}
      </button>
    );
  }

  return <article className="safety-incident-card">{content}</article>;
}
