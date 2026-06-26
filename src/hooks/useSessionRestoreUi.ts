import { useEffect, useState } from "react";

export const SESSION_RESTORE_INSTANT_MS = 250;
export const SESSION_RESTORE_INLINE_MS = 1000;
export const SESSION_RESTORE_STALLED_MS = 5000;

export type SessionRestoreUiPhase = "idle" | "instant" | "inline" | "minimal" | "stalled";

export function resolveSessionRestorePhase(elapsedMs: number, active: boolean): SessionRestoreUiPhase {
  if (!active) return "idle";
  if (elapsedMs < SESSION_RESTORE_INSTANT_MS) return "instant";
  if (elapsedMs < SESSION_RESTORE_INLINE_MS) return "inline";
  if (elapsedMs < SESSION_RESTORE_STALLED_MS) return "minimal";
  return "stalled";
}

export function useSessionRestoreUi(active: boolean) {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (!active) {
      setElapsedMs(0);
      return;
    }

    const startedAt = performance.now();
    setElapsedMs(0);

    const tick = () => {
      setElapsedMs(performance.now() - startedAt);
    };

    tick();
    const interval = window.setInterval(tick, 50);
    return () => window.clearInterval(interval);
  }, [active]);

  const phase = resolveSessionRestorePhase(elapsedMs, active);

  return {
    phase,
    elapsedMs,
    showInline: phase === "inline",
    showMinimal: phase === "minimal" || phase === "stalled",
    showStalledActions: phase === "stalled"
  };
}
