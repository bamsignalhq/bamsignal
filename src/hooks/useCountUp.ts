import { useEffect, useState } from "react";

/** Subtle count-up animation for dashboard momentum */
export function useCountUp(target: number, durationMs = 650, enabled = true): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!enabled || target <= 0) {
      setValue(target);
      return;
    }

    setValue(0);
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    const frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs, enabled]);

  return value;
}
