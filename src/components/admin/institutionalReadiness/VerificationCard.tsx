import {
  READINESS_CHECK_TYPE_LABELS,
  READINESS_RESULT_LABELS,
  READINESS_SUBSYSTEM_LABELS
} from "../../../constants/institutionalReadiness";
import type { ReadinessVerificationCheck } from "../../../types/institutionalReadiness";

type VerificationCardProps = {
  checks: ReadinessVerificationCheck[];
  passedChecks: ReadinessVerificationCheck[];
};

export function VerificationCard({ checks, passedChecks }: VerificationCardProps) {
  const failedChecks = checks.filter((check) => !check.passed);

  return (
    <section className="readiness-verification-card verification-card concierge-consultant-card--glass cc-reveal">
      <header className="readiness-verification-card__head">
        <h3>Verification checks</h3>
        <p>
          Configuration · Connectivity · Data Integrity · Performance · Permissions · Dependencies ·
          Audit Coverage · Operational Status
        </p>
      </header>

      <div className="verification-card__summary">
        <span>{passedChecks.length} passed</span>
        <span>{failedChecks.length} failed</span>
        <span>{checks.length} total</span>
      </div>

      <ul className="readiness-verification-card__list">
        {checks.map((check) => (
          <li key={check.id} className={`verification-card__item verification-card__item--${check.status}`}>
            <div className="readiness-verification-card__row">
              <strong>{READINESS_SUBSYSTEM_LABELS[check.subsystemId]}</strong>
              <span className={`readiness-result-badge readiness-result-badge--${check.status}`}>
                {READINESS_RESULT_LABELS[check.status]}
              </span>
            </div>
            <div className="readiness-verification-card__meta">
              <span>{check.checkRef}</span>
              <span>{READINESS_CHECK_TYPE_LABELS[check.checkType]}</span>
              <span>{check.passed ? "Passed" : "Failed"}</span>
            </div>
            <p>{check.message}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
