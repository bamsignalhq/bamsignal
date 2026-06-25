import type { MaintenanceWindowRecord } from "../../../types/monitoringCenter";
import { MONITORED_PLATFORM_SERVICE_LABELS } from "../../../constants/monitoringCenter";

type MaintenanceCardProps = {
  windows: MaintenanceWindowRecord[];
};

export function MaintenanceCard({ windows }: MaintenanceCardProps) {
  const sorted = [...windows].sort(
    (left, right) => new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime()
  );

  return (
    <section className="monitoring-card maintenance-card concierge-consultant-card--glass cc-reveal">
      <header className="monitoring-card__head">
        <h3>Maintenance</h3>
        <p>Scheduled and active maintenance windows with affected services.</p>
      </header>
      {sorted.length ? (
        <ul className="maintenance-card__list">
          {sorted.map((window) => (
            <li key={window.id}>
              <div className="maintenance-card__row">
                <strong>{window.title}</strong>
                <span className={`maintenance-card__status maintenance-card__status--${window.status}`}>
                  {window.status}
                </span>
              </div>
              <p>{window.windowRef}</p>
              <p>
                {new Date(window.startsAt).toLocaleString()} → {new Date(window.endsAt).toLocaleString()}
              </p>
              <p className="maintenance-card__services">
                {window.affectedServices
                  .map((id) => MONITORED_PLATFORM_SERVICE_LABELS[id] ?? id)
                  .join(", ")}
              </p>
              {window.notes ? <p>{window.notes}</p> : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="monitoring-card__empty">No maintenance windows scheduled.</p>
      )}
    </section>
  );
}
