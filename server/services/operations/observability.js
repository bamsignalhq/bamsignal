/** In-process operational observability metrics. */

const metrics = {
  moderationQueueDepth: 0,
  supportQueueDepth: 0,
  conciergeQueueDepth: 0,
  moderatorWorkload: 0,
  supportWorkload: 0,
  conciergeWorkload: 0,
  moderationAvgMinutes: 0,
  supportResponseAvgMinutes: 0,
  supportResolutionAvgMinutes: 0,
  appealVolume: 0,
  escalations: 0,
  safetyActions: 0,
  auditRecords: 0,
  adminEventsPublished: 0,
  supportTicketsOpened: 0,
  supportTicketsResolved: 0,
  supportEscalations: 0,
  conciergeCasesCompleted: 0,
  conciergeEscalations: 0,
  incidentCount: 0,
  operationalSlaBreaches: 0
};

const safetyActionCounters = {};

export function incrementOperationsMetric(key, amount = 1) {
  if (key.startsWith("safety_")) {
    safetyActionCounters[key] = (safetyActionCounters[key] || 0) + amount;
    return;
  }
  if (Object.prototype.hasOwnProperty.call(metrics, key)) {
    metrics[key] += amount;
  }
}

export function setOperationsMetric(key, value) {
  if (Object.prototype.hasOwnProperty.call(metrics, key)) {
    metrics[key] = value;
  }
}

export function getOperationsObservabilityMetrics() {
  return {
    ...metrics,
    safetyActionsByType: { ...safetyActionCounters },
    generatedAt: new Date().toISOString()
  };
}

export function resetOperationsObservabilityMetrics() {
  for (const key of Object.keys(metrics)) {
    metrics[key] = 0;
  }
  for (const key of Object.keys(safetyActionCounters)) {
    delete safetyActionCounters[key];
  }
}

export async function refreshOperationalQueueDepths() {
  const { isDatabaseReady, query } = await import("../../db.js");
  if (!isDatabaseReady()) return;

  try {
    const mod = await query(
      `select count(*)::int as count from ops_moderation_report_state
       where status in ('submitted','triaged','assigned','investigating','awaiting_response')`
    );
    setOperationsMetric("moderationQueueDepth", Number(mod.rows[0]?.count || 0));

    const sup = await query(
      `select count(*)::int as count from ops_support_ticket_state
       where status in ('open','assigned','awaiting_member','awaiting_staff','escalated')`
    );
    setOperationsMetric("supportQueueDepth", Number(sup.rows[0]?.count || 0));

    const con = await query(
      `select count(*)::int as count from ops_concierge_queue_state
       where status in ('queued','assigned','in_progress','awaiting_review')`
    );
    setOperationsMetric("conciergeQueueDepth", Number(con.rows[0]?.count || 0));
  } catch {
    // Tables may not exist until migrated
  }
}
