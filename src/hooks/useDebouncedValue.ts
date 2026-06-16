import { useEffect, useRef, useState } from "react";

/** Debounce value updates; first value applies immediately (no mount delay). */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  const skipDelay = useRef(true);

  useEffect(() => {
    if (skipDelay.current) {
      skipDelay.current = false;
      setDebounced(value);
      return;
    }
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
