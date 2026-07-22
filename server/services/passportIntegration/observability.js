/** Passport integration observability — signals, sync, consent. */

const metrics = {
  signalsQueued: 0,
  signalsProcessed: 0,
  signalsAccepted: 0,
  signalsRejected: 0,
  syncFailures: 0,
  syncLatencyTotalMs: 0,
  syncLatencyCount: 0,
  passportUpdates: 0,
  reputationUpdates: 0,
  consentChecks: 0,
  consentFailures: 0,
  trustEventsPublished: 0,
  ingestionFailures: 0
};

const sourceHealth = {};

export function incrementPassportIntegrationMetric(key, amount = 1) {
  if (key.startsWith("source_")) {
    sourceHealth[key] = (sourceHealth[key] || 0) + amount;
    return;
  }
  if (Object.prototype.hasOwnProperty.call(metrics, key)) {
    metrics[key] += amount;
  }
}

export function recordSyncLatency(ms) {
  metrics.syncLatencyTotalMs += ms;
  metrics.syncLatencyCount += 1;
}

export function getPassportIntegrationMetrics() {
  const avgSyncMs =
    metrics.syncLatencyCount > 0
      ? Math.round(metrics.syncLatencyTotalMs / metrics.syncLatencyCount)
      : 0;
  return {
    ...metrics,
    avgSyncLatencyMs: avgSyncMs,
    sourceSystemHealth: { ...sourceHealth },
    generatedAt: new Date().toISOString()
  };
}

export function resetPassportIntegrationMetrics() {
  for (const key of Object.keys(metrics)) {
    metrics[key] = 0;
  }
  for (const key of Object.keys(sourceHealth)) {
    delete sourceHealth[key];
  }
}
