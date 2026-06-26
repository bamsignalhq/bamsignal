import { DISASTER_REPORT_METRICS } from "../constants/disasterRecovery";
import type {
  BackupDisasterRecoveryCenterBundle,
  DisasterBackupMonitorRecord,
  DisasterRecoveryOperationRecord,
  DisasterRecoverySummary,
  DisasterReportMetric
} from "../types/disasterRecovery";
import {
  listDisasterBackupMonitors,
  listDisasterComparisons,
  listDisasterOperations,
  listDisasterPlans
} from "./disasterRecoveryStore";

export function buildDisasterRecoverySummary(
  monitors: DisasterBackupMonitorRecord[]
): DisasterRecoverySummary {
  return {
    healthyMonitors: monitors.filter((item) => item.status === "healthy").length,
    warningMonitors: monitors.filter((item) => item.status === "warning").length,
    failedMonitors: monitors.filter((item) => item.status === "failed").length,
    lastCheckedAt: new Date().toISOString()
  };
}

function latestBackupAt(monitors: DisasterBackupMonitorRecord[]): string {
  if (!monitors.length) return "—";
  const latest = monitors.reduce((max, item) =>
    item.lastBackupAt > max ? item.lastBackupAt : max
  , monitors[0].lastBackupAt);
  return new Date(latest).toLocaleString();
}

function meanRecoveryDurationMinutes(operations: DisasterRecoveryOperationRecord[]): number {
  const completed = operations.filter(
    (op) =>
      op.status === "completed" &&
      op.completedAt &&
      (op.operationId === "recovery-simulation" || op.operationId === "restore")
  );
  if (!completed.length) return 0;
  const total = completed.reduce((sum, op) => {
    const start = new Date(op.initiatedAt).getTime();
    const end = new Date(op.completedAt!).getTime();
    return sum + Math.max(0, end - start) / 60_000;
  }, 0);
  return Math.round(total / completed.length);
}

function integrityRate(monitors: DisasterBackupMonitorRecord[]): number {
  if (!monitors.length) return 0;
  const verified = monitors.filter((item) => item.lastVerifiedAt).length;
  return Math.round((verified / monitors.length) * 100);
}

function failureCount(
  monitors: DisasterBackupMonitorRecord[],
  operations: DisasterRecoveryOperationRecord[]
): number {
  const monitorFailures = monitors.filter((item) => item.status === "failed").length;
  const opFailures = operations.filter((item) => item.status === "failed").length;
  return monitorFailures + opFailures;
}

export function buildDisasterReportMetrics(
  monitors: DisasterBackupMonitorRecord[],
  operations: DisasterRecoveryOperationRecord[]
): DisasterReportMetric[] {
  const duration = meanRecoveryDurationMinutes(operations);
  const integrity = integrityRate(monitors);
  const failures = failureCount(monitors, operations);

  const values: Record<string, string> = {
    "last-backup": latestBackupAt(monitors),
    "recovery-duration": duration > 0 ? `${duration} min` : "—",
    integrity: `${integrity}%`,
    failures: String(failures)
  };

  return DISASTER_REPORT_METRICS.map((metric) => ({
    id: metric.id,
    label: metric.label,
    value: values[metric.id] ?? "—",
    numericValue: Number(values[metric.id]?.replace(/[^\d.]/g, "") || 0)
  }));
}

export function sortDisasterOperations(
  operations: DisasterRecoveryOperationRecord[]
): DisasterRecoveryOperationRecord[] {
  return [...operations].sort(
    (left, right) => new Date(right.initiatedAt).getTime() - new Date(left.initiatedAt).getTime()
  );
}

export function buildBackupDisasterRecoveryCenterBundle(): BackupDisasterRecoveryCenterBundle {
  const monitors = listDisasterBackupMonitors();
  const operations = sortDisasterOperations(listDisasterOperations());
  const plans = listDisasterPlans();
  const comparisons = listDisasterComparisons();
  const summary = buildDisasterRecoverySummary(monitors);

  return {
    generatedAt: new Date().toISOString(),
    summary,
    metrics: buildDisasterReportMetrics(monitors, operations),
    monitors,
    operations,
    plans,
    comparisons,
    recentOperations: operations.slice(0, 10)
  };
}

export function countMonitorsByStatus(monitors: DisasterBackupMonitorRecord[]) {
  return monitors.reduce<Record<string, number>>((counts, monitor) => {
    counts[monitor.status] = (counts[monitor.status] ?? 0) + 1;
    return counts;
  }, {});
}
