import { PLATFORM_LOAD_JOURNEY_TYPES } from "../../../shared/platformLoadCertification.mjs";
import { buildMemberJourney, isExpectedStatus, resolveStepBody, thinkDelayMs } from "./journeys.mjs";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchStep(baseUrl, step, memberId, metrics, timeoutMs) {
  const url = `${baseUrl}${step.path}`;
  const method = step.method || "GET";
  const headers = {
    Accept: step.kind === "page" ? "text/html" : "application/json"
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
    const response = await fetch(url, {
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

  if (step.kind === "probe") {
    metrics.recordProbe(step.path.includes("ready") ? "ready" : "health", latencyMs);
  } else {
    metrics.recordEndpoint(step.path, method, latencyMs, status, ok);
  }

  return { ok, status, latencyMs, error };
}

async function runMemberJourney(baseUrl, memberIndex, metrics, timeoutMs, fast) {
  const journey = buildMemberJourney(memberIndex);
  const started = performance.now();
  let failed = false;
  const stepResults = [];

  for (const step of journey.steps) {
    await sleep(thinkDelayMs(step.kind === "page" ? "page" : "default", fast));
    metrics.trackRam();
    const result = await fetchStep(baseUrl, step, journey.memberId, metrics, timeoutMs);
    stepResults.push({
      id: step.id,
      phase: step.phase,
      ok: result.ok,
      status: result.status,
      latencyMs: result.latencyMs,
      error: result.error
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

  async function worker() {
    while (true) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= virtualMembers) return;
      results[index] = await runMemberJourney(baseUrl, index, metrics, timeoutMs, fast);
      completed += 1;
      if (onProgress && (completed % 50 === 0 || completed === virtualMembers)) {
        onProgress(completed, virtualMembers);
      }
    }
  }

  const workers = Array.from({ length: Math.min(maxConcurrency, virtualMembers) }, () => worker());
  await Promise.all(workers);
  return results;
}

function sampleReadyLoop(baseUrl, metrics, intervalMs, stopSignal) {
  const timer = setInterval(async () => {
    if (stopSignal.stopped) return;
    const started = performance.now();
    metrics.beginRequest();
    try {
      await fetch(`${baseUrl}/ready`, { method: "GET" });
    } catch {
      // record high latency below
    } finally {
      metrics.endRequest();
      metrics.recordProbe("ready", Math.round(performance.now() - started));
      metrics.trackRam();
    }
  }, intervalMs);
  return () => {
    stopSignal.stopped = true;
    clearInterval(timer);
  };
}

export async function simulatePlatformLoad({ baseUrl, virtualMembers, maxConcurrency, timeoutMs, sampleReadyEveryMs, fast = false }) {
  const { createMetricsCollector } = await import("./metrics.mjs");
  const metrics = createMetricsCollector();
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
