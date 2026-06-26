import type {
  LaunchCommandDeploymentRecord,
  LaunchCommandIncidentRecord,
  LaunchCommandServiceRecord
} from "../../../types/launchCommandCenter";

type LaunchCommandOperationsCardProps = {
  services: LaunchCommandServiceRecord[];
  incidents: LaunchCommandIncidentRecord[];
  deployments: LaunchCommandDeploymentRecord[];
};

export function LaunchCommandOperationsCard({
  services,
  incidents,
  deployments
}: LaunchCommandOperationsCardProps) {
  const activeIncidents = incidents.filter((item) => item.status !== "resolved");

  return (
    <section className="launch-command-card launch-command-operations-card concierge-consultant-card--glass cc-reveal">
      <header className="launch-command-card__head">
        <h3>Operations snapshot</h3>
        <p>Critical services, incidents, and current deployments.</p>
      </header>

      <h4>Critical services</h4>
      <ul className="launch-command-card__list">
        {services.map((service) => (
          <li key={service.id}>
            <div className="launch-command-card__row">
              <strong>{service.name}</strong>
              <span className={`launch-command-section-card__status launch-command-section-card__status--${service.status}`}>
                {service.status}
              </span>
            </div>
            <div className="launch-command-card__meta">
              <span>{service.latencyMs} ms</span>
              <span>{service.uptimePercent}% uptime</span>
            </div>
          </li>
        ))}
      </ul>

      <h4>Incidents</h4>
      {activeIncidents.length ? (
        <ul className="launch-command-card__list">
          {activeIncidents.map((incident) => (
            <li key={incident.id}>
              <div className="launch-command-card__row">
                <strong>{incident.incidentRef}</strong>
                <span>{incident.status}</span>
              </div>
              <p>{incident.title}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="launch-command-card__empty">No active incidents.</p>
      )}

      <h4>Deployments</h4>
      <ul className="launch-command-card__list">
        {deployments.map((deployment) => (
          <li key={deployment.id}>
            <div className="launch-command-card__row">
              <strong>{deployment.environment}</strong>
              <span>{deployment.version}</span>
            </div>
            <div className="launch-command-card__meta">
              <span>{deployment.status}</span>
              <span>{deployment.deployedBy}</span>
              <span>{new Date(deployment.deployedAt).toLocaleString()}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
