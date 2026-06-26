export function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[Math.max(0, index)];
}

export function summarizeLatencies(latencies) {
  if (!latencies.length) {
    return { count: 0, avg: 0, p50: 0, p95: 0, p99: 0, max: 0 };
  }
  const sum = latencies.reduce((total, value) => total + value, 0);
  return {
    count: latencies.length,
    avg: Math.round(sum / latencies.length),
    p50: Math.round(percentile(latencies, 50)),
    p95: Math.round(percentile(latencies, 95)),
    p99: Math.round(percentile(latencies, 99)),
    max: Math.round(Math.max(...latencies))
  };
}

export function createMetricsCollector({ maxConcurrency = 100 } = {}) {
  const stepLatencies = [];
  const journeyLatencies = [];
  const endpointStats = new Map();
  const failures = [];
  const failureCategories = new Map();
  const retryAttempts = [];
  const retrySuccesses = [];
  const queueWaitSamples = [];
  const workerUtilSamples = [];
  const eventLoopLagSamples = [];
  let inFlight = 0;
  let maxQueueDepth = 0;
  let ramMbPeak = 0;
  const readyLatencies = [];
  const healthLatencies = [];
  const cpuStart = process.cpuUsage();
  let ramStartMb = 0;
  let connectionReuseHint = 0;

  function trackRam() {
    const heapMb = Math.round(process.memoryUsage().heapUsed / (1024 * 1024));
    ramMbPeak = Math.max(ramMbPeak, heapMb);
    if (!ramStartMb) ramStartMb = heapMb;
    return heapMb;
  }

  function trackEventLoopLag() {
    const started = Date.now();
    setImmediate(() => {
      eventLoopLagSamples.push(Math.max(0, Date.now() - started));
    });
  }

  function recordFailureCategory(category, detail) {
    if (!category) return;
    const entry = failureCategories.get(category) || { category, count: 0, samples: [] };
    entry.count += 1;
    if (entry.samples.length < 5) {
      entry.samples.push(detail);
    }
    failureCategories.set(category, entry);
  }

  function recordEndpoint(path, method, latencyMs, status, ok, meta = {}) {
    const key = `${method} ${path}`;
    const entry = endpointStats.get(key) || {
      path,
      method,
      latencies: [],
      failures: 0,
      requests: 0,
      retries: 0
    };
    entry.requests += 1;
    entry.latencies.push(latencyMs);
    if ((meta.attempts || 1) > 1) {
      entry.retries += meta.attempts - 1;
      connectionReuseHint += 1;
    }
    if (!ok) {
      entry.failures += 1;
      failures.push({ path, method, status, latencyMs, error: meta.error, category: meta.category });
      recordFailureCategory(meta.category, { path, method, status, error: meta.error });
    }
    endpointStats.set(key, entry);
    stepLatencies.push(latencyMs);
  }

  function recordRetryAttempt(path, method, attempt, result) {
    retryAttempts.push({
      path,
      method,
      attempt,
      status: result.status,
      error: result.error
    });
  }

  function recordRetrySuccess(path, method, retriesUsed) {
    retrySuccesses.push({ path, method, retriesUsed });
  }

  function beginRequest() {
    inFlight += 1;
    maxQueueDepth = Math.max(maxQueueDepth, inFlight);
  }

  function endRequest() {
    inFlight = Math.max(0, inFlight - 1);
  }

  function recordQueueWait(queueWaitMs) {
    queueWaitSamples.push(queueWaitMs);
  }

  function recordWorkerActive(activeWorkers, poolSize) {
    workerUtilSamples.push(Math.round((activeWorkers / Math.max(1, poolSize)) * 100));
  }

  function recordJourney(durationMs) {
    journeyLatencies.push(durationMs);
  }

  function recordProbe(kind, latencyMs) {
    if (kind === "health") healthLatencies.push(latencyMs);
    if (kind === "ready") readyLatencies.push(latencyMs);
    stepLatencies.push(latencyMs);
  }

  function finalize() {
    trackRam();
    const cpuEnd = process.cpuUsage(cpuStart);
    const cpuUserMs = Math.round(cpuEnd.user / 1000);
    const cpuSystemMs = Math.round(cpuEnd.system / 1000);

    const endpoints = [...endpointStats.values()].map((item) => ({
      path: item.path,
      method: item.method,
      requests: item.requests,
      failures: item.failures,
      retries: item.retries,
      ...summarizeLatencies(item.latencies)
    }));

    endpoints.sort((a, b) => b.p95 - a.p95);

    const totalRequests = endpoints.reduce((sum, item) => sum + item.requests, 0);
    const totalFailures = failures.length;

    return {
      api: summarizeLatencies(stepLatencies),
      journeys: summarizeLatencies(journeyLatencies),
      health: summarizeLatencies(healthLatencies),
      database: summarizeLatencies(readyLatencies),
      endpoints,
      failures: totalFailures,
      failureRatePercent:
        totalRequests > 0 ? Math.round((totalFailures / totalRequests) * 1000) / 10 : 0,
      queueDepth: {
        max: maxQueueDepth,
        final: inFlight
      },
      instrumentation: {
        queueWait: summarizeLatencies(queueWaitSamples),
        workerUtilization: summarizeLatencies(workerUtilSamples),
        eventLoopLag: summarizeLatencies(eventLoopLagSamples),
        retryAttempts: retryAttempts.length,
        retryRecoveries: retrySuccesses.length,
        connectionReuseHint,
        maxConcurrency
      },
      failureClassification: [...failureCategories.values()].sort((a, b) => b.count - a.count),
      cpu: {
        userMs: cpuUserMs,
        systemMs: cpuSystemMs,
        totalMs: cpuUserMs + cpuSystemMs
      },
      ram: {
        startMb: ramStartMb,
        peakMb: ramMbPeak
      },
      totalRequests
    };
  }

  return {
    trackRam,
    trackEventLoopLag,
    recordEndpoint,
    recordRetryAttempt,
    recordRetrySuccess,
    beginRequest,
    endRequest,
    recordQueueWait,
    recordWorkerActive,
    recordJourney,
    recordProbe,
    finalize,
    get maxQueueDepth() {
      return maxQueueDepth;
    }
  };
}
