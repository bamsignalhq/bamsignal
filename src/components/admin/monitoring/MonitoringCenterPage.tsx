import { useMemo, useState } from "react";
import {
  MONITORING_FUTURE_ARCHITECTURE,
  MONITORING_SECTIONS
} from "../../../constants/monitoringCenter";
import {
  MONITORING_CENTER_ADMIN_BRAND,
  MONITORING_CENTER_ADMIN_PATH
} from "../../../constants/monitoringCenterAdmin";
import type { MonitoringSectionId } from "../../../constants/monitoringCenter";
import { buildMonitoringCenterBundle } from "../../../utils/monitoringCenterEngine";
import {
  listIntegrationServices,
  listQueueServices
} from "../../../utils/monitoringCenterLogic";
import { listMonitoringServices } from "../../../utils/monitoringCenterStore";
import { AlertFeedCard } from "./AlertFeedCard";
import { IncidentTimelineCard } from "./IncidentTimelineCard";
import { InfrastructureCard } from "./InfrastructureCard";
import { IntegrationHealthCard } from "./IntegrationHealthCard";
import { MaintenanceCard } from "./MaintenanceCard";
import { QueueHealthCard } from "./QueueHealthCard";
import { ServiceHealthCard } from "./ServiceHealthCard";
import { SystemHealthCard } from "./SystemHealthCard";

export function MonitoringCenterPage() {
  const [section, setSection] = useState<MonitoringSectionId>("overview");
  const [refreshKey, setRefreshKey] = useState(0);

  const bundle = useMemo(() => {
    void refreshKey;
    return buildMonitoringCenterBundle(section);
  }, [section, refreshKey]);

  const allServices = useMemo(() => {
    void refreshKey;
    return listMonitoringServices();
  }, [refreshKey]);

  const integrationServices = useMemo(() => listIntegrationServices(allServices), [allServices]);
  const queueServices = useMemo(() => listQueueServices(allServices), [allServices]);

  const showOverview = section === "overview";
  const showServices = section === "overview" || section === "services";
  const showInfrastructure = section === "overview" || section === "infrastructure";
  const showIntegrations = section === "overview" || section === "integrations";
  const showQueues = section === "overview" || section === "queues" || section === "jobs";
  const showIncidents = section === "overview" || section === "incidents";
  const showMaintenance = section === "overview" || section === "maintenance";
  const showAlerts = section === "overview" || section === "alerts";
  const showLogs = section === "logs";

  return (
    <div className="monitoring-center-page">
      <header className="monitoring-center-page__head">
        <div>
          <h2>{MONITORING_CENTER_ADMIN_BRAND}</h2>
          <p>
            Institutional Network Operations Center — real-time visibility into service health,
            incidents, alerts, maintenance, infrastructure, and recovery. No guessing whether
            systems are healthy.
          </p>
        </div>
        <button
          type="button"
          className="concierge-consultant-btn"
          onClick={() => setRefreshKey((value) => value + 1)}
        >
          Refresh
        </button>
      </header>

      <nav className="monitoring-center-page__sections" aria-label="Monitoring sections">
        {MONITORING_SECTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`monitoring-center-page__section-btn${
              section === item.id ? " is-active" : ""
            }`}
            onClick={() => setSection(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {showOverview ? <SystemHealthCard summary={bundle.summary} /> : null}

      {showLogs ? (
        <p className="monitoring-center-page__logs-note">
          Log aggregation is documented for future OpenTelemetry integration. Use Audit Center and
          server observability events for current operational logs.
        </p>
      ) : null}

      <div className="monitoring-center-page__body">
        <div className="monitoring-center-page__column">
          {showServices ? <ServiceHealthCard services={bundle.services} /> : null}
          {showIntegrations ? <IntegrationHealthCard services={integrationServices} /> : null}
          {showQueues ? <QueueHealthCard services={queueServices} /> : null}
          {showIncidents ? <IncidentTimelineCard incidents={bundle.incidents} /> : null}
        </div>
        <div className="monitoring-center-page__column">
          {showInfrastructure ? (
            <InfrastructureCard infrastructure={bundle.infrastructure} metrics={bundle.metrics} />
          ) : null}
          {showAlerts ? <AlertFeedCard alerts={bundle.alerts} /> : null}
          {showMaintenance ? <MaintenanceCard windows={bundle.maintenance} /> : null}
        </div>
      </div>

      <footer className="monitoring-center-page__future">
        <h4>Future architecture (documented only)</h4>
        <p>{MONITORING_FUTURE_ARCHITECTURE.map((item) => item.label).join(" · ")}</p>
        <span>Route: {MONITORING_CENTER_ADMIN_PATH}</span>
        <span>Generated {new Date(bundle.generatedAt).toLocaleString()}</span>
      </footer>
    </div>
  );
}
