export const SESSION_RESTORE_INSTANT_MS = 250;
export const SESSION_RESTORE_INLINE_MS = 1000;
export const SESSION_RESTORE_STALLED_MS = 5000;

export function resolveSessionRestorePhase(elapsedMs, active) {
  if (!active) return "idle";
  if (elapsedMs < SESSION_RESTORE_INSTANT_MS) return "instant";
  if (elapsedMs < SESSION_RESTORE_INLINE_MS) return "inline";
  if (elapsedMs < SESSION_RESTORE_STALLED_MS) return "minimal";
  return "stalled";
}
