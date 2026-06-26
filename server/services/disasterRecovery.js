/**
 * Backup & Disaster Recovery Center™ — server-side helpers.
 */

export const DISASTER_RECOVERY_DB_TABLES = [
  "disaster_backup_monitors",
  "disaster_recovery_operations",
  "disaster_recovery_plans",
  "disaster_recovery_reports"
];

export function disasterRecoveryRouteRegistered(source) {
  return source.includes("/hard/disaster-recovery") && source.includes("disasterrecovery");
}

export function buildDisasterRecoverySummaryLine(summary) {
  return `healthy=${summary.healthyMonitors} failed=${summary.failedMonitors}`;
}

export function countMonitorsByStatus(monitors) {
  return monitors.reduce((counts, monitor) => {
    counts[monitor.status] = (counts[monitor.status] ?? 0) + 1;
    return counts;
  }, {});
}

export function getDisasterRecoveryDatabaseTableManifest() {
  return DISASTER_RECOVERY_DB_TABLES.map((tableName) => ({
    tableName,
    domain: "disaster-recovery"
  }));
}

export function integrityRateFromMonitors(monitors) {
  if (!monitors?.length) return 0;
  const verified = monitors.filter((item) => item.lastVerifiedAt).length;
  return Math.round((verified / monitors.length) * 100);
}
