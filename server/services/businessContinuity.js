/**
 * Business Continuity & Disaster Recovery Center™ — server-side logic and persistence.
 */

import { query, isDatabaseReady } from "../db.js";

export const CONTINUITY_HEALTH_STATUSES = [
  "healthy",
  "degraded",
  "partial-outage",
  "major-outage",
  "maintenance"
];

export const MONITORED_PROVIDER_IDS = [
  "supabase",
  "paystack",
  "google-calendar",
  "zoom",
  "google-meet",
  "resend",
  "sendchamp",
  "storage",
  "authentication",
  "cron-jobs"
];

export const RECOVERY_PLAYBOOK_DOMAINS = [
  "database-outage",
  "payment-outage",
  "email-outage",
  "whatsapp-outage",
  "calendar-outage",
  "zoom-outage",
  "authentication-outage",
  "storage-outage",
  "server-outage",
  "dns-outage"
];

export const BUSINESS_CONTINUITY_DB_TABLES = [
  "incident_reports",
  "recovery_plans",
  "backup_jobs",
  "system_health_snapshots",
  "provider_status",
  "continuity_exercises"
];

const STATUS_RANK = {
  healthy: 0,
  maintenance: 1,
  degraded: 2,
  "partial-outage": 3,
  "major-outage": 4
};

export function getBusinessContinuityDatabaseTableManifest() {
  return BUSINESS_CONTINUITY_DB_TABLES.map((tableName) => ({
    tableName,
    domain: "business-continuity"
  }));
}

export function canAccessBusinessContinuityConsole(permissions = []) {
  return permissions.includes("ManageOperations") || permissions.includes("ManageRecovery");
}

export function deriveOverallContinuityStatus(providerStatuses = []) {
  if (!providerStatuses.length) return "healthy";
  let worst = "healthy";
  for (const item of providerStatuses) {
    const status = item.status ?? "healthy";
    if (STATUS_RANK[status] > STATUS_RANK[worst]) {
      worst = status;
    }
  }
  return worst;
}

export function countActiveIncidents(incidents = []) {
  return incidents.filter((item) => !["resolved", "closed"].includes(item.status)).length;
}

export function assessBackupHealth(backupJobs = []) {
  const latestByArea = new Map();
  for (const job of backupJobs) {
    const existing = latestByArea.get(job.areaId);
    const completedAt = Date.parse(job.completedAt ?? job.createdAt ?? 0);
    const existingAt = existing ? Date.parse(existing.completedAt ?? existing.createdAt ?? 0) : 0;
    if (!existing || completedAt >= existingAt) {
      latestByArea.set(job.areaId, job);
    }
  }

  const latest = [...latestByArea.values()];
  if (!latest.length) {
    return { health: "degraded", verifiedCount: 0, total: 0, latest: null };
  }

  const failed = latest.filter((job) => job.health === "major-outage" || job.status === "failed");
  const unverified = latest.filter((job) => !job.verified);
  const degraded = latest.filter((job) => job.health === "degraded");

  let health = "healthy";
  if (failed.length) health = "major-outage";
  else if (degraded.length || unverified.length) health = "degraded";

  return {
    health,
    verifiedCount: latest.filter((job) => job.verified).length,
    total: latest.length,
    latest: latest.sort(
      (a, b) =>
        Date.parse(b.completedAt ?? b.createdAt ?? 0) - Date.parse(a.completedAt ?? a.createdAt ?? 0)
    )[0]
  };
}

export function buildRiskAssessment(providerStatuses = [], backupAssessment = {}, activeIncidents = 0) {
  const criticalProviders = providerStatuses.filter((item) =>
    ["supabase", "paystack", "authentication", "storage", "cron-jobs"].includes(item.providerId)
  );
  const degradedCritical = criticalProviders.filter(
    (item) => item.status && item.status !== "healthy"
  ).length;

  const providerScore = Math.max(0, 100 - degradedCritical * 18);
  const backupScore =
    backupAssessment.health === "healthy"
      ? 95
      : backupAssessment.health === "degraded"
        ? 72
        : 40;
  const incidentScore = Math.max(0, 100 - activeIncidents * 25);

  return [
    {
      id: "provider-resilience",
      label: "Provider resilience",
      score: providerScore,
      status:
        providerScore >= 85 ? "healthy" : providerScore >= 65 ? "degraded" : "partial-outage",
      note: `${degradedCritical} critical provider(s) not fully healthy`
    },
    {
      id: "backup-readiness",
      label: "Backup readiness",
      score: backupScore,
      status: backupAssessment.health ?? "healthy",
      note: `${backupAssessment.verifiedCount ?? 0}/${backupAssessment.total ?? 0} areas verified`
    },
    {
      id: "incident-exposure",
      label: "Incident exposure",
      score: incidentScore,
      status:
        activeIncidents === 0 ? "healthy" : activeIncidents === 1 ? "degraded" : "partial-outage",
      note: `${activeIncidents} active incident(s)`
    }
  ];
}

export function validateRecoveryPlaybook(plan) {
  if (!plan?.domainId) return { ok: false, reason: "missing-domain" };
  if (!RECOVERY_PLAYBOOK_DOMAINS.includes(plan.domainId)) {
    return { ok: false, reason: "unknown-domain" };
  }
  if (!Array.isArray(plan.procedureSteps) || plan.procedureSteps.length < 3) {
    return { ok: false, reason: "insufficient-steps" };
  }
  return { ok: true };
}

export function appendIncidentTimeline(incident, entry) {
  const timeline = Array.isArray(incident.timeline) ? [...incident.timeline] : [];
  timeline.push({
    at: entry.at ?? new Date().toISOString(),
    actor: entry.actor ?? "system",
    note: entry.note ?? ""
  });
  return { ...incident, timeline, updatedAt: new Date().toISOString() };
}

export async function listIncidentReports(limit = 50) {
  if (!isDatabaseReady()) return [];
  const result = await query(
    `select * from incident_reports order by started_at desc limit $1`,
    [limit]
  );
  return result.rows ?? [];
}

export async function listRecoveryPlans() {
  if (!isDatabaseReady()) return [];
  const result = await query(`select * from recovery_plans order by title asc`);
  return result.rows ?? [];
}

export async function listBackupJobs(limit = 50) {
  if (!isDatabaseReady()) return [];
  const result = await query(
    `select * from backup_jobs order by completed_at desc nulls last limit $1`,
    [limit]
  );
  return result.rows ?? [];
}

export async function listProviderStatus() {
  if (!isDatabaseReady()) return [];
  const result = await query(`select * from provider_status order by provider_id asc`);
  return result.rows ?? [];
}

export async function listContinuityExercises(limit = 20) {
  if (!isDatabaseReady()) return [];
  const result = await query(
    `select * from continuity_exercises order by scheduled_at desc limit $1`,
    [limit]
  );
  return result.rows ?? [];
}

export async function getLatestHealthSnapshot() {
  if (!isDatabaseReady()) return null;
  const result = await query(
    `select * from system_health_snapshots order by snapshot_at desc limit 1`
  );
  return result.rows?.[0] ?? null;
}
