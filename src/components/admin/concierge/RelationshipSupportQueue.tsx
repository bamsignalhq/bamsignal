import { useMemo, useState } from "react";
import {
  JOURNEY_SUPPORT_LABEL,
  RELATIONSHIP_HEALTH_ALERT_PURPOSE_COPY,
  RELATIONSHIP_HEALTH_LABEL,
  SUPPORT_OPPORTUNITY_LABEL
} from "../../../constants/relationshipHealthAlerts";
import type { RelationshipHealthAlertEntry } from "../../../types/relationshipHealthAlerts";
import { getRelationshipSupportQueue } from "../../../utils/RelationshipHealthAlertsEngine";
import { HealthAlertBadge } from "./HealthAlertBadge";
import { RelationshipHealthAlertCard } from "./RelationshipHealthAlertCard";

type RelationshipSupportQueueProps = {
  /** Optional override — defaults to open support queue from store. */
  alerts?: RelationshipHealthAlertEntry[];
};

export function RelationshipSupportQueue({ alerts }: RelationshipSupportQueueProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const queue = useMemo(() => {
    void refreshKey;
    return alerts ?? getRelationshipSupportQueue();
  }, [alerts, refreshKey]);

  const selected = queue.find((alert) => alert.id === selectedId) ?? queue[0] ?? null;

  const handleUpdated = () => {
    setRefreshKey((value) => value + 1);
  };

  return (
    <div className="relationship-support-queue">
      <section className="relationship-support-queue__list-card concierge-consultant-card--glass">
        <header className="concierge-consultant-card__head">
          <h3>{SUPPORT_OPPORTUNITY_LABEL}</h3>
          <p>
            {RELATIONSHIP_HEALTH_LABEL} · {JOURNEY_SUPPORT_LABEL}
          </p>
        </header>

        <p className="relationship-support-queue__purpose">{RELATIONSHIP_HEALTH_ALERT_PURPOSE_COPY}</p>

        {queue.length ? (
          <ul className="relationship-support-queue__list">
            {queue.map((alert) => (
              <li key={alert.id}>
                <button
                  type="button"
                  className={`relationship-support-queue__item${
                    selected?.id === alert.id ? " is-active" : ""
                  }`}
                  onClick={() => setSelectedId(alert.id)}
                >
                  <HealthAlertBadge alertType={alert.alertType} severity={alert.severity} primary />
                  <span className="relationship-support-queue__couple">
                    {alert.coupleLabel ?? alert.journeyId}
                  </span>
                  <time dateTime={alert.createdAt}>
                    {new Date(alert.createdAt).toLocaleDateString()}
                  </time>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="concierge-consultant__empty">No support opportunities in the queue.</p>
        )}
      </section>

      {selected ? (
        <RelationshipHealthAlertCard alert={selected} onUpdated={handleUpdated} />
      ) : null}
    </div>
  );
}
