import type { ObservabilityErrorRecord } from "../../../types/productionObservability";
import { formatObservabilityCheckedAt } from "../../../utils/productionObservabilityLogic";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";

type RecentErrorsCardProps = {
  errors: ObservabilityErrorRecord[];
  onTriage: (errorId: string, action: "resolve" | "ignore" | "assign") => void;
};

const TRIAGE_BADGE = {
  open: "warning",
  assigned: "review",
  resolved: "healthy",
  ignored: "review"
} as const;

export function RecentErrorsCard({ errors, onTriage }: RecentErrorsCardProps) {
  return (
    <section className="observability-card concierge-consultant-card--glass cc-reveal">
      <header className="observability-card__head">
        <h3>Recent Errors</h3>
        <p>Latest exceptions with stack traces, frequency, and triage controls.</p>
      </header>
      <ul className="observability-card__errors">
        {errors.map((error) => (
          <li key={error.id} className="observability-card__error">
            <div className="observability-card__error-head">
              <strong>{error.errorRef}</strong>
              <InstitutionalStatusBadge status={TRIAGE_BADGE[error.triageStatus]} label={error.triageStatus} />
              <span>{error.frequency}×</span>
            </div>
            <p className="observability-card__error-event">{error.event}</p>
            <p>{error.message}</p>
            <pre className="observability-card__stack">{error.stackTrace}</pre>
            {error.affectedMembers.length ? (
              <p className="observability-card__muted">
                Affected: {error.affectedMembers.join(", ")}
              </p>
            ) : null}
            <p className="observability-card__muted">
              First {formatObservabilityCheckedAt(error.firstSeenAt)} · Last{" "}
              {formatObservabilityCheckedAt(error.lastSeenAt)}
            </p>
            {error.assignedTo ? (
              <p className="observability-card__muted">Assigned to {error.assignedTo}</p>
            ) : null}
            {error.triageStatus === "open" || error.triageStatus === "assigned" ? (
              <div className="observability-card__actions">
                <button type="button" className="concierge-consultant-btn" onClick={() => onTriage(error.id, "resolve")}>
                  Resolved
                </button>
                <button
                  type="button"
                  className="concierge-consultant-btn concierge-consultant-btn--ghost"
                  onClick={() => onTriage(error.id, "ignore")}
                >
                  Ignore
                </button>
                <button
                  type="button"
                  className="concierge-consultant-btn concierge-consultant-btn--ghost"
                  onClick={() => onTriage(error.id, "assign")}
                >
                  Assign
                </button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
