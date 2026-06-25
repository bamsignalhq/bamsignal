import type { MonitoringCenterBundle } from "../types/monitoringCenter";
import type { MonitoringSectionId } from "../constants/monitoringCenter";
import { buildMonitoringSummary, filterServicesForSection } from "./monitoringCenterLogic";
import {
  getInfrastructureMetrics,
  listMaintenanceWindows,
  listMetricSnapshots,
  listMonitoringAlerts,
  listMonitoringIncidents,
  listMonitoringServices
} from "./monitoringCenterStore";

export function buildMonitoringCenterBundle(
  sectionId: MonitoringSectionId = "overview"
): MonitoringCenterBundle {
  const allServices = listMonitoringServices();
  const incidents = listMonitoringIncidents();
  const alerts = listMonitoringAlerts();
  const maintenance = listMaintenanceWindows();

  return {
    generatedAt: new Date().toISOString(),
    summary: buildMonitoringSummary(allServices, incidents, alerts, maintenance),
    services: filterServicesForSection(allServices, sectionId),
    infrastructure: getInfrastructureMetrics(),
    incidents,
    alerts,
    maintenance,
    metrics: listMetricSnapshots()
  };
}
