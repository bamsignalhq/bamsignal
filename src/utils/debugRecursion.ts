/**
 * Temporary production-debug toolkit for stack overflow / infinite render loops.
 * Enable: localStorage.setItem("bamsignal:debug-recursion", "1") then reload.
 */

import { STORAGE_KEYS } from "../constants/limits";
import { safeGetJSON } from "./safeStorage";

export const DEBUG_RECURSION_KEY = "bamsignal:debug-recursion";
export const DEBUG_RECURSION_REPORT_KEY = "bamsignal:debug-recursion-report";
export const RENDER_BURST_THRESHOLD = 50;

export type HydrationDebugState = {
  memberHydrating?: boolean;
  memberSessionReady?: boolean;
  memberSessionEpoch?: number;
  authLoading?: boolean;
  isAuthed?: boolean;
  profileComplete?: boolean | null;
  memberAccessReady?: boolean;
};

type RenderCounter = { total: number; burst: number; lastAt: number; burstStart: number };
type EffectCounter = { runs: number; lastDepsKey: string; repeatCount: number };
type SessionCall = { label: string; at: number; stack: string };

declare global {
  interface Window {
    __BAMSIGNAL_DEBUG__?: HydrationDebugState;
    __BAMSIGNAL_RENDER_COUNTS__?: Record<string, RenderCounter>;
    __BAMSIGNAL_EFFECT_COUNTS__?: Record<string, EffectCounter>;
    __BAMSIGNAL_NAV_LOG__?: Array<{ from: string; to: string; replace: boolean; at: number }>;
    __BAMSIGNAL_SESSION_CALLS__?: SessionCall[];
    __BAMSIGNAL_NORMALIZE_DEPTH__?: Record<string, number>;
  }
}

export function isDebugRecursionEnabled(): boolean {
  if (import.meta.env.DEV) return true;
  try {
    return localStorage.getItem(DEBUG_RECURSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function shouldUsePlainErrorFallback(): boolean {
  return isDebugRecursionEnabled();
}

function memberId(): string {
  const user = safeGetJSON<{ email?: string; phone?: string }>(STORAGE_KEYS.userProfile, {});
  return user.email || user.phone || "";
}

function renderCounts(): Record<string, RenderCounter> {
  if (!window.__BAMSIGNAL_RENDER_COUNTS__) window.__BAMSIGNAL_RENDER_COUNTS__ = {};
  return window.__BAMSIGNAL_RENDER_COUNTS__;
}

function effectCounts(): Record<string, EffectCounter> {
  if (!window.__BAMSIGNAL_EFFECT_COUNTS__) window.__BAMSIGNAL_EFFECT_COUNTS__ = {};
  return window.__BAMSIGNAL_EFFECT_COUNTS__;
}

function navLog() {
  if (!window.__BAMSIGNAL_NAV_LOG__) window.__BAMSIGNAL_NAV_LOG__ = [];
  return window.__BAMSIGNAL_NAV_LOG__;
}

function sessionCalls(): SessionCall[] {
  if (!window.__BAMSIGNAL_SESSION_CALLS__) window.__BAMSIGNAL_SESSION_CALLS__ = [];
  return window.__BAMSIGNAL_SESSION_CALLS__;
}

function normalizeDepthMap(): Record<string, number> {
  if (!window.__BAMSIGNAL_NORMALIZE_DEPTH__) window.__BAMSIGNAL_NORMALIZE_DEPTH__ = {};
  return window.__BAMSIGNAL_NORMALIZE_DEPTH__;
}

export function setHydrationDebugState(state: HydrationDebugState): void {
  window.__BAMSIGNAL_DEBUG__ = { ...(window.__BAMSIGNAL_DEBUG__ ?? {}), ...state };
}

export function getHydrationDebugState(): HydrationDebugState {
  return window.__BAMSIGNAL_DEBUG__ ?? {};
}

function persistReport(report: Record<string, unknown>): void {
  try {
    sessionStorage.setItem(DEBUG_RECURSION_REPORT_KEY, JSON.stringify(report));
  } catch {
    /* ignore */
  }
}

export function logRecursionReport(kind: string, detail: Record<string, unknown>): void {
  const report = {
    kind,
    at: new Date().toISOString(),
    pathname: window.location.pathname,
    route: `${window.location.pathname}${window.location.search}`,
    memberId: memberId(),
    hydration: getHydrationDebugState(),
    renderCounts: window.__BAMSIGNAL_RENDER_COUNTS__,
    effectCounts: window.__BAMSIGNAL_EFFECT_COUNTS__,
    navLog: window.__BAMSIGNAL_NAV_LOG__,
    sessionCalls: window.__BAMSIGNAL_SESSION_CALLS__,
    normalizeDepth: window.__BAMSIGNAL_NORMALIZE_DEPTH__,
    ...detail
  };
  console.error(`[debug-recursion:${kind}]`, report);
  persistReport(report);
}

export function debugRender(component: string, props?: Record<string, unknown>): void {
  if (!isDebugRecursionEnabled()) return;
  const now = Date.now();
  const counts = renderCounts();
  const prev = counts[component];
  const gapMs = prev ? now - prev.lastAt : Infinity;
  const newBurst = !prev || gapMs > 500;
  const burst = newBurst ? 1 : prev.burst + 1;
  const total = (prev?.total ?? 0) + 1;

  counts[component] = {
    total,
    burst,
    lastAt: now,
    burstStart: newBurst ? now : prev!.burstStart
  };

  if (burst >= RENDER_BURST_THRESHOLD) {
    logRecursionReport("render-burst", {
      component,
      renderCount: total,
      burstRenders: burst,
      props: props ?? null,
      hydration: getHydrationDebugState(),
      navLog: navLog().slice(-10)
    });
    throw new Error(`[debug-recursion] render burst: ${component} (${burst} renders)`);
  }
}

export function debugEffect(hook: string, deps: unknown[], run: () => void | (() => void)): void {
  if (!isDebugRecursionEnabled()) {
    run();
    return;
  }
  const depsKey = safeDepsKey(deps);
  const counts = effectCounts();
  const prev = counts[hook] ?? { runs: 0, lastDepsKey: "", repeatCount: 0 };
  const sameDeps = prev.lastDepsKey === depsKey;
  const repeatCount = sameDeps ? prev.repeatCount + 1 : 0;
  counts[hook] = {
    runs: prev.runs + 1,
    lastDepsKey: depsKey,
    repeatCount
  };

  if (repeatCount >= 20) {
    logRecursionReport("effect-loop", {
      hook,
      runs: counts[hook].runs,
      repeatCount,
      deps: depsKey
    });
    throw new Error(`[debug-recursion] effect loop: ${hook}`);
  }

  run();
}

function safeDepsKey(deps: unknown[]): string {
  try {
    return JSON.stringify(deps);
  } catch {
    return String(deps.length);
  }
}

export function debugNavigation(from: string, to: string, replace: boolean): void {
  if (!isDebugRecursionEnabled()) return;
  const log = navLog();
  log.push({ from, to, replace, at: Date.now() });
  if (log.length > 100) log.shift();

  if (from === to) {
    logRecursionReport("nav-self", { from, to, replace });
  }

  const tail = log.slice(-6);
  for (let i = 0; i < tail.length - 2; i += 1) {
    const a = tail[i];
    const b = tail[i + 1];
    const c = tail[i + 2];
    if (a.from === c.to && a.to === b.from && b.to === c.from) {
      logRecursionReport("nav-ab-a", { loop: [a, b, c] });
    }
  }
}

export function debugSessionCall(label: string): void {
  if (!isDebugRecursionEnabled()) return;
  const calls = sessionCalls();
  const stack = new Error().stack?.split("\n").slice(2, 8).join("\n") ?? "";
  calls.push({ label, at: Date.now(), stack });
  const same = calls.filter((c) => c.label === label);
  if (same.length > 1) {
    logRecursionReport("session-repeat", {
      label,
      callCount: same.length,
      calls: same.slice(-5)
    });
  }
}

const NORMALIZE_ABORT_DEPTH = 20;

export function enterNormalize(name: string): void {
  if (!isDebugRecursionEnabled()) return;
  const map = normalizeDepthMap();
  map[name] = (map[name] ?? 0) + 1;
  if (map[name] > NORMALIZE_ABORT_DEPTH) {
    logRecursionReport("normalize-depth", {
      name,
      depth: map[name],
      stack: new Error().stack
    });
    throw new Error(`[debug-recursion] normalize depth exceeded: ${name}`);
  }
}

export function exitNormalize(name: string): void {
  if (!isDebugRecursionEnabled()) return;
  const map = normalizeDepthMap();
  if (map[name]) map[name] -= 1;
}

export function logStackOverflowCrash(input: {
  component: string;
  error: Error;
  componentStack?: string | null;
  renderCount?: number;
}): void {
  const isStackOverflow =
    input.error.message.includes("Maximum call stack") ||
    input.error.message.includes("stack size exceeded") ||
    input.error.name === "RangeError";

  const payload = {
    kind: isStackOverflow ? "stack-overflow" : "route-error",
    component: input.component,
    message: input.error.message,
    stack: input.error.stack ?? "",
    componentStack: input.componentStack ?? "",
    pathname: window.location.pathname,
    route: `${window.location.pathname}${window.location.search}`,
    memberId: memberId(),
    hydration: getHydrationDebugState(),
    renderCount: input.renderCount ?? renderCounts()[input.component]?.total,
    renderCounts: window.__BAMSIGNAL_RENDER_COUNTS__,
    effectCounts: window.__BAMSIGNAL_EFFECT_COUNTS__,
    navLog: window.__BAMSIGNAL_NAV_LOG__,
    sessionCalls: window.__BAMSIGNAL_SESSION_CALLS__,
    normalizeDepth: window.__BAMSIGNAL_NORMALIZE_DEPTH__
  };

  console.error("[stack-overflow-crash]", payload);
  persistReport(payload);
  try {
    sessionStorage.setItem("bamsignal:last-crash", JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}
