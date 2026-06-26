import { OBSERVABILITY_SERVICE_STATUS_LABELS } from "../../../constants/productionObservability";
import type { ObservabilityDeploymentRecord } from "../../../types/productionObservability";
import { formatObservabilityCheckedAt } from "../../../utils/productionObservabilityLogic";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";

const STATUS_BADGE = {
  healthy: "healthy",
  warning: "warning",
  offline: "broken"
} as const;

type RecentDeploymentsCardProps = {
  deployments: ObservabilityDeploymentRecord[];
};

export function RecentDeploymentsCard({ deployments }: RecentDeploymentsCardProps) {
  return (
    <section className="observability-card concierge-consultant-card--glass cc-reveal">
      <header className="observability-card__head">
        <h3>Recent Deployments</h3>
        <p>Latest releases with commit, engineer, environment, and rollback availability.</p>
      </header>
      <ul className="observability-card__table">
        {deployments.map((deployment) => (
          <li key={deployment.id} className="observability-card__row">
            <div className="observability-card__row-main">
              <strong>{deployment.deploymentRef}</strong>
              <span className="observability-card__muted">{deployment.commit}</span>
            </div>
            <InstitutionalStatusBadge
              status={STATUS_BADGE[deployment.health]}
              label={OBSERVABILITY_SERVICE_STATUS_LABELS[deployment.health]}
            />
            <span>{deployment.environment}</span>
            <span>{deployment.engineer}</span>
            <span>{formatObservabilityCheckedAt(deployment.deployedAt)}</span>
            <span>{deployment.rollbackAvailable ? "Rollback available" : "No rollback"}</span>
            {deployment.buildVersion ? (
              <span className="observability-card__muted">v{deployment.buildVersion}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
