import { READINESS_RESULT_LABELS } from "../../../constants/institutionalReadiness";
import { navigateToPath } from "../../../constants/routes";
import type { ReadinessSubsystemHealth } from "../../../types/institutionalReadiness";

type SubsystemHealthCardProps = {
  subsystems: ReadinessSubsystemHealth[];
};

export function SubsystemHealthCard({ subsystems }: SubsystemHealthCardProps) {
  return (
    <section className="readiness-verification-card subsystem-health-card concierge-consultant-card--glass cc-reveal">
      <header className="readiness-verification-card__head">
        <h3>Subsystem health</h3>
        <p>19 institutional subsystems — each exposes a readiness contract.</p>
      </header>

      <div className="subsystem-health-card__list">
        {subsystems.map((subsystem) => (
          <article
            key={subsystem.id}
            className={`subsystem-health-card__row subsystem-health-card__row--${subsystem.status}`}
          >
            <div>
              <h4>{subsystem.label}</h4>
              <p>{subsystem.summary}</p>
              <small>
                Score {subsystem.score}/100 · {subsystem.issueCount} issue(s)
                {subsystem.failedDependencies.length
                  ? ` · Upstream: ${subsystem.failedDependencies.join(", ")}`
                  : ""}
              </small>
            </div>
            <div className="subsystem-health-card__actions">
              <span className={`readiness-result-badge readiness-result-badge--${subsystem.status}`}>
                {READINESS_RESULT_LABELS[subsystem.status]}
              </span>
              {subsystem.auditPath ? (
                <button
                  type="button"
                  className="concierge-consultant-btn concierge-consultant-btn--ghost"
                  onClick={() => navigateToPath(subsystem.auditPath!)}
                >
                  Open audit
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
