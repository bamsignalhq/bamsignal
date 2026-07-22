const counters = {
  successfulPayments: 0,
  failedPayments: 0,
  webhookFailures: 0,
  duplicateWebhooks: 0,
  refunds: 0,
  refundRequests: 0,
  subscriptionRenewals: 0,
  revenueKobo: 0,
  boostPurchases: 0,
  premiumPurchases: 0,
  gatewayLatencyMsTotal: 0,
  gatewayLatencySamples: 0
};

export function incrementFinancialMetric(name, amount = 1) {
  if (Object.prototype.hasOwnProperty.call(counters, name)) {
    counters[name] += Math.max(0, Number(amount) || 0);
  }
}

export function recordGatewayLatency(ms) {
  const value = Number(ms);
  if (!Number.isFinite(value) || value < 0) return;
  counters.gatewayLatencyMsTotal += value;
  counters.gatewayLatencySamples += 1;
}

export function getFinancialObservabilityMetrics() {
  const avgGatewayLatencyMs =
    counters.gatewayLatencySamples > 0
      ? Math.round(counters.gatewayLatencyMsTotal / counters.gatewayLatencySamples)
      : 0;

  return {
    ...counters,
    avgGatewayLatencyMs,
    generatedAt: new Date().toISOString()
  };
}

export function classifyProductMetric(productType = "") {
  const type = String(productType || "").toLowerCase();
  if (type.includes("boost")) incrementFinancialMetric("boostPurchases");
  if (type.includes("premium") || type.includes("subscription") || type.includes("membership")) {
    incrementFinancialMetric("premiumPurchases");
  }
}
