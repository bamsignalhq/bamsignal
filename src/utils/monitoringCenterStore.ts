import type { MonitoringAuditActionId } from "../constants/monitoringCenter";
import {
  INFRASTRUCTURE_METRICS_SEED,
  MAINTENANCE_WINDOW_SEED,
  METRIC_SNAPSHOT_SEED,
  MONITORING_ALERT_SEED,
  MONITORING_INCIDENT_SEED,
  MONITORING_SERVICE_SEED
} from "../data/monitoringCenterSeed";
import type { MonitoringAlertRecord, MonitoringIncidentRecord } from "../types/monitoringCenter";
import { appendAuditCenterEvent } from "./auditCenterEngine";
import { acknowledgeAlert, appendIncidentTimeline, resolveAlert } from "./monitoringCenterLogic";
import { readJson, writeJson } from "./storage";

const STORAGE_KEY = "bamsignal.monitoringCenter.v1";

type MonitoringCenterState = {
  services: typeof MONITORING_SERVICE_SEED;
  incidents: typeof MONITORING_INCIDENT_SEED;
  alerts: typeof MONITORING_ALERT_SEED;
  maintenance: typeof MAINTENANCE_WINDOW_SEED;
  infrastructure: typeof INFRASTRUCTURE_METRICS_SEED;
  metrics: typeof METRIC_SNAPSHOT_SEED;
  updatedAt: string;
};

function defaultState(): MonitoringCenterState {
  return {
    services: [...MONITORING_SERVICE_SEED],
    incidents: [...MONITORING_INCIDENT_SEED],
    alerts: [...MONITORING_ALERT_SEED],
    maintenance: [...MAINTENANCE_WINDOW_SEED],
    infrastructure: { ...INFRASTRUCTURE_METRICS_SEED },
    metrics: [...METRIC_SNAPSHOT_SEED],
    updatedAt: new Date().toISOString()
  };
}

function loadState(): MonitoringCenterState {
  const stored = readJson<MonitoringCenterState>(STORAGE_KEY, defaultState());
  if (!stored?.services?.length) return defaultState();
  return { ...defaultState(), ...stored };
}

function saveState(state: MonitoringCenterState): void {
  writeJson(STORAGE_KEY, { ...state, updatedAt: new Date().toISOString() });
}

function logMonitoringAudit(action: MonitoringAuditActionId, detail: string, entityRef: string): void {
  appendAuditCenterEvent({
    actor: "monitoring-center",
    role: "Operations",
    action: "permissions-updates",
    entity: "permission",
    entityRef,
    result: "success",
    ipPlaceholder: "—",
    detail: `[${action}] ${detail}`
  });
}

export function listMonitoringServices() {
  return loadState().services;
}

export function listMonitoringIncidents() {
  return loadState().incidents;
}

export function listMonitoringAlerts() {
  return loadState().alerts;
}

export function listMaintenanceWindows() {
  return loadState().maintenance;
}

export function getInfrastructureMetrics() {
  return loadState().infrastructure;
}

export function listMetricSnapshots() {
  return loadState().metrics;
}

export function appendMonitoringIncidentNote(
  incidentId: string,
  actor: string,
  note: string
): MonitoringIncidentRecord | null {
  const state = loadState();
  const index = state.incidents.findIndex((item) => item.id === incidentId);
  if (index < 0) return null;
  state.incidents[index] = appendIncidentTimeline(state.incidents[index], { actor, note });
  saveState(state);
  logMonitoringAudit("incident-updated", `${state.incidents[index].incidentRef} — ${note}`, state.incidents[index].incidentRef);
  return state.incidents[index];
}

export function acknowledgeMonitoringAlert(alertId: string, actor: string): MonitoringAlertRecord | null {
  const state = loadState();
  const index = state.alerts.findIndex((item) => item.id === alertId);
  if (index < 0) return null;
  state.alerts[index] = acknowledgeAlert(state.alerts[index], actor);
  saveState(state);
  logMonitoringAudit("alert-acknowledged", `${state.alerts[index].alertRef} by ${actor}`, state.alerts[index].alertRef);
  return state.alerts[index];
}

export function resolveMonitoringAlert(alertId: string, actor: string): MonitoringAlertRecord | null {
  const state = loadState();
  const index = state.alerts.findIndex((item) => item.id === alertId);
  if (index < 0) return null;
  state.alerts[index] = resolveAlert(state.alerts[index], actor);
  saveState(state);
  logMonitoringAudit("alert-resolved", `${state.alerts[index].alertRef} by ${actor}`, state.alerts[index].alertRef);
  return state.alerts[index];
}
