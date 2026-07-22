/**
 * Messaging & realtime observability metrics (in-memory counters).
 */

const metrics = {
  messagesSent: 0,
  messagesDelivered: 0,
  messagesRead: 0,
  deliveryRetries: 0,
  failedDeliveries: 0,
  presenceUpdates: 0,
  typingEvents: 0,
  notificationQueueDepth: 0,
  notificationsSent: 0,
  notificationFailures: 0,
  deliveryQueueDepth: 0,
  offlineQueueDepth: 0,
  moderationEvents: 0,
  reconnectEvents: 0,
  realtimeLatencyMsTotal: 0,
  realtimeLatencySamples: 0
};

export function incrementMessagingMetric(key, amount = 1) {
  if (!Object.prototype.hasOwnProperty.call(metrics, key)) return;
  metrics[key] += Number(amount) || 1;
}

export function recordRealtimeLatency(ms) {
  const value = Number(ms);
  if (!Number.isFinite(value) || value < 0) return;
  metrics.realtimeLatencyMsTotal += value;
  metrics.realtimeLatencySamples += 1;
}

export function getMessagingObservabilityMetrics() {
  const avgLatency =
    metrics.realtimeLatencySamples > 0
      ? Math.round(metrics.realtimeLatencyMsTotal / metrics.realtimeLatencySamples)
      : 0;

  return {
    ...metrics,
    averageRealtimeLatencyMs: avgLatency,
    capturedAt: new Date().toISOString()
  };
}

export function resetMessagingObservabilityMetrics() {
  for (const key of Object.keys(metrics)) {
    metrics[key] = 0;
  }
}
