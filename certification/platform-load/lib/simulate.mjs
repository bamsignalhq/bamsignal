import { performance } from "node:perf_hooks";
import { PLATFORM_LOAD_JOURNEY_TYPES } from "../../../shared/platformLoadCertification.mjs";
import { classifyRequestFailure, isRetriableRequest, retryBackoffMs } from "./failures.mjs";
import { getLoadCertHttpAgent, loadCertFetch } from "./httpClient.mjs";
import { buildMemberJourney, isExpectedStatus, resolveStepBody, thinkDelayMs } from "./journeys.mjs";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchStepOnce(baseUrl, step, memberId, metrics, timeoutMs) {
  const url = `${baseUrl}${step.path}`;
  const method = step.method || "GET";
  const headers = {
    Accept: step.kind === "page" ? "text/html" : "application/json",
    Connection: "keep-alive"
  };
  if (method !== "GET" && method !== "HEAD") {
    headers["Content-Type"] = "application/json";
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  metrics.beginRequest();
  const started = performance.now();

  let status = 0;
  let error = null;

  try {
    const response = await loadCertFetch(url, {
      method,
      headers,
      body: method === "GET" || method === "HEAD" ? undefined : JSON.stringify(resolveStepBody(step, memberId)),
      signal: controller.signal
    });
    status = response.status;
    if (step.kind === "page" || step.kind === "api") {
      await response.text().catch(() => "");
    }
  } catch (err) {
    error = err?.name === "AbortError" ? "timeout" : String(err?.message || err);
    status = 0;
  } finally {
    clearTimeout(timer);
    metrics.endRequest();
  }

  const latencyMs = Math.round(performance.now() - started);
  const ok = !error && isExpectedStatus(step, status);
  return { ok, status, latencyMs, error };
}

async function fetchStep(baseUrl, step, memberId, metrics, timeoutMs) {
  let attempt = 1;
  let lastResult = null;

  while (true) {
    const result = await fetchStepOnce(baseUrl, step, memberId, metrics, timeoutMs);
    lastResult = result;

    if (result.ok) {
      if (attempt > 1) {
        metrics.recordRetrySuccess(step.path, step.method || "GET", attempt - 1);
      }
      break;
    }

    if (!isRetriableRequest(step, result, attempt)) {
      break;
    }

    metrics.recordRetryAttempt(step.path, step.method || "GET", attempt, result);
    await sleep(retryBackoffMs(attempt));
    attempt += 1;
  }

  const { ok, status, latencyMs, error } = lastResult;
  const category = ok ? null : classifyRequestFailure({ status, error, retried: attempt > 1 });

  if (step.kind === "probe") {
    metrics.recordProbe(step.path.includes("ready") ? "ready" : "health", latencyMs);
  } else {
    metrics.recordEndpoint(step.path, step.method || "GET", latencyMs, status, ok, {
      error,
      category,
      attempts: attempt
    });
  }

  return { ok, status, latencyMs, error, category, attempts: attempt };
}

async function runMemberJourney(baseUrl, memberIndex, metrics, timeoutMs, fast) {
  const journey = buildMemberJourney(memberIndex);
  const started = performance.now();
  let failed = false;
  const stepResults = [];

  for (const step of journey.steps) {
    await sleep(thinkDelayMs(step.kind === "page" ? "page" : "default", fast));
    metrics.trackRam();
    metrics.trackEventLoopLag();
    const result = await fetchStep(baseUrl, step, journey.memberId, metrics, timeoutMs);
    stepResults.push({
      id: step.id,
      phase: step.phase,
      ok: result.ok,
      status: result.status,
      latencyMs: result.latencyMs,
      error: result.error,
      category: result.category,
      attempts: result.attempts
    });
    if (!result.ok) failed = true;
  }

  const durationMs = Math.round(performance.now() - started);
  metrics.recordJourney(durationMs, failed);

  return {
    memberId: journey.memberId,
    journeyType: journey.journeyType,
    durationMs,
    failed,
    steps: stepResults
  };
}

async function runPool(baseUrl, virtualMembers, maxConcurrency, metrics, timeoutMs, fast, onProgress) {
  const results = new Array(virtualMembers);
  let nextIndex = 0;
  let completed = 0;
  let activeWorkers = 0;

  async function worker(workerId) {
    while (true) {
      const queueWaitStarted = performance.now();
      const index = nextIndex;
      nextIndex += 1;
      if (index >= virtualMembers) return;

      const queueWaitMs = Math.round(performance.now() - queueWaitStarted);
      metrics.recordQueueWait(queueWaitMs);

      activeWorkers += 1;
      metrics.recordWorkerActive(activeWorkers, maxConcurrency);
      try {
        results[index] = await runMemberJourney(baseUrl, index, metrics, timeoutMs, fast);
      } finally {
        activeWorkers -= 1;
        metrics.recordWorkerActive(activeWorkers, maxConcurrency);
      }

      completed += 1;
      if (onProgress && (completed % 50 === 0 || completed === virtualMembers)) {
        onProgress(completed, virtualMembers);
      }
    }
  }

  const workers = Array.from({ length: Math.min(maxConcurrency, virtualMembers) }, (_item, workerId) =>
    worker(workerId)
  );
  await Promise.all(workers);
  return results;
}

function sampleReadyLoop(baseUrl, metrics, intervalMs, stopSignal) {
  const timer = setInterval(async () => {
    if (stopSignal.stopped) return;
    const started = performance.now();
    metrics.beginRequest();
    try {
      await loadCertFetch(`${baseUrl}/ready`, { method: "GET" });
    } catch {
      // record high latency below
    } finally {
      metrics.endRequest();
      metrics.recordProbe("ready", Math.round(performance.now() - started));
      metrics.trackRam();
      metrics.trackEventLoopLag();
    }
  }, intervalMs);
  return () => {
    stopSignal.stopped = true;
    clearInterval(timer);
  };
}

export async function simulatePlatformLoad({ baseUrl, virtualMembers, maxConcurrency, timeoutMs, sampleReadyEveryMs, fast = false }) {
  const { createMetricsCollector } = await import("./metrics.mjs");
  getLoadCertHttpAgent(Math.max(maxConcurrency + 32, 128));
  const metrics = createMetricsCollector({ maxConcurrency });
  metrics.trackRam();

  const stopSignal = { stopped: false };
  const stopSampling = sampleReadyLoop(baseUrl, metrics, sampleReadyEveryMs, stopSignal);

  const startedAt = Date.now();
  const journeys = await runPool(baseUrl, virtualMembers, maxConcurrency, metrics, timeoutMs, fast, (done, total) => {
    console.log(`  Members simulated: ${done}/${total} · queue depth ${metrics.maxQueueDepth}`);
  });

  stopSampling();
  const durationMs = Date.now() - startedAt;
  const measurement = metrics.finalize();

  const journeysFailed = journeys.filter((item) => item.failed).length;
  const journeysPassed = journeys.length - journeysFailed;

  const byType = PLATFORM_LOAD_JOURNEY_TYPES.map((type) => {
    const subset = journeys.filter((item) => item.journeyType === type.id);
    const failed = subset.filter((item) => item.failed).length;
    return {
      id: type.id,
      label: type.label,
      members: subset.length,
      failed,
      passed: subset.length - failed
    };
  });

  return {
    startedAt: new Date(startedAt).toISOString(),
    durationMs,
    virtualMembers,
    maxConcurrency,
    journeys,
    journeysPassed,
    journeysFailed,
    byType,
    measurement
  };
}
