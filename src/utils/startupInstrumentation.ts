export type StartupPhase =
  | "app_boot"
  | "supabase_get_session"
  | "supabase_validate_user"
  | "member_api_headers"
  | "go_to_app"
  | "onboarding_status"
  | "member_register"
  | "member_pull"
  | "member_bundle_hydration"
  | "first_paint"
  | "background_tasks";

type StartupMark = {
  phase: StartupPhase;
  at: number;
  durationMs?: number;
  meta?: Record<string, string | number | boolean | null>;
};

const marks: StartupMark[] = [];
let bootStartedAt = typeof performance !== "undefined" ? performance.now() : 0;
let firstPaintAt: number | null = null;

export function resetStartupInstrumentation() {
  marks.length = 0;
  bootStartedAt = performance.now();
  firstPaintAt = null;
}

export function markStartupPhase(
  phase: StartupPhase,
  meta?: Record<string, string | number | boolean | null>
) {
  const at = performance.now();
  const previous = [...marks].reverse().find((entry) => entry.phase === phase);
  const durationMs = previous ? Math.round(at - previous.at) : Math.round(at - bootStartedAt);
  marks.push({ phase, at, durationMs, meta });
  if (import.meta.env.DEV) {
    console.info("[bamsignal][startup]", phase, `${durationMs}ms`, meta ?? {});
  }
}

export function markStartupFirstPaint(meta?: Record<string, string | number | boolean | null>) {
  if (firstPaintAt !== null) return;
  firstPaintAt = performance.now();
  marks.push({
    phase: "first_paint",
    at: firstPaintAt,
    durationMs: Math.round(firstPaintAt - bootStartedAt),
    meta
  });
  if (import.meta.env.DEV) {
    console.info("[bamsignal][startup] first_paint", `${Math.round(firstPaintAt - bootStartedAt)}ms`, meta ?? {});
  }
}

function percentile(values: number[], ratio: number): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * ratio) - 1));
  return sorted[index];
}

export function getStartupWaterfall() {
  return marks.map((entry) => ({
    phase: entry.phase,
    durationMs: entry.durationMs ?? 0,
    meta: entry.meta ?? null
  }));
}

export function getStartupSummary() {
  const firstPaint = marks.find((entry) => entry.phase === "first_paint");
  const durations = marks
    .filter((entry) => entry.phase !== "first_paint" && entry.phase !== "background_tasks")
    .map((entry) => entry.durationMs ?? 0);
  const total = firstPaint?.durationMs ?? (marks.length ? Math.round(performance.now() - bootStartedAt) : 0);
  return {
    firstPaintMs: firstPaint?.durationMs ?? null,
    totalTrackedMs: total,
    averagePhaseMs: durations.length
      ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length)
      : 0,
    p95PhaseMs: percentile(durations, 0.95),
    worstPhaseMs: durations.length ? Math.max(...durations) : 0,
    waterfall: getStartupWaterfall()
  };
}

if (typeof window !== "undefined") {
  resetStartupInstrumentation();
  markStartupPhase("app_boot");
}
