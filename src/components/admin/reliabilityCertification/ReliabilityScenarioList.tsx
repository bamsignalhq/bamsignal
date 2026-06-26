import type { ReliabilityScenarioResult, ReliabilityVerificationDimension } from "../../../types/reliabilityCertification";
import { reliabilityVerifyLabel } from "../../../utils/reliabilityCertificationLogic";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";

type ReliabilityScenarioListProps = {
  scenarios: ReliabilityScenarioResult[];
};

export function ReliabilityScenarioList({ scenarios }: ReliabilityScenarioListProps) {
  return (
    <section className="institutional-card reliability-scenario-card concierge-consultant-card--glass cc-reveal">
      <header className="institutional-card__head">
        <h3>Failure simulations</h3>
        <p>Dependency outages, timeouts, and auth edge cases.</p>
      </header>
      <ul className="institutional-card__list">
        {scenarios.map((scenario) => (
          <li key={scenario.id}>
            <div className="institutional-card__row">
              <strong>{scenario.label}</strong>
              <InstitutionalStatusBadge status={scenario.passed ? "consistent" : "inconsistent"} />
            </div>
            <p>
              Recovered: {scenario.recoverySuccess ? "yes" : "no"}
              {scenario.recoveryTimeMs != null ? ` · ${scenario.recoveryTimeMs}ms` : ""}
            </p>
            <p>{scenario.detail}</p>
            <ul className="institutional-card__fixes">
              {Object.entries(scenario.verification).map(([key, value]) => (
                <li key={key}>
                  {reliabilityVerifyLabel(key as ReliabilityVerificationDimension)}:{" "}
                  {value ? "verified" : "missing"}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
