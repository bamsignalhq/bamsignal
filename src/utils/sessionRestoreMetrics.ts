type DurationSample = {
  durationMs: number;
  at: number;
};

const restoreSamples: DurationSample[] = [];
const routeSamples: DurationSample[] = [];
const hydrationSamples: DurationSample[] = [];
const MAX_SAMPLES = 48;

function pushSample(bucket: DurationSample[], durationMs: number) {
  bucket.push({ durationMs: Math.max(0, Math.round(durationMs)), at: Date.now() });
  if (bucket.length > MAX_SAMPLES) bucket.shift();
}

function percentile(sorted: number[], ratio: number): number {
  if (!sorted.length) return 0;
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * ratio) - 1));
  return sorted[index];
}

function summarize(samples: DurationSample[]) {
  if (!samples.length) {
    return { count: 0, averageMs: 0, p95Ms: 0, worstMs: 0 };
  }
  const values = samples.map((sample) => sample.durationMs).sort((a, b) => a - b);
  const total = values.reduce((sum, value) => sum + value, 0);
  return {
    count: values.length,
    averageMs: Math.round(total / values.length),
    p95Ms: percentile(values, 0.95),
    worstMs: values[values.length - 1]
  };
}

export function recordSessionRestoreDuration(durationMs: number) {
  pushSample(restoreSamples, durationMs);
  if (import.meta.env.DEV) {
    console.info("[bamsignal] session_restore_duration_ms", Math.round(durationMs));
  }
}

export function recordRouteTransitionDuration(durationMs: number) {
  pushSample(routeSamples, durationMs);
}

export function recordHydrationDuration(durationMs: number) {
  pushSample(hydrationSamples, durationMs);
}

export function getSessionRestoreMetrics() {
  return {
    sessionRestore: summarize(restoreSamples),
    routeTransition: summarize(routeSamples),
    hydration: summarize(hydrationSamples)
  };
}
