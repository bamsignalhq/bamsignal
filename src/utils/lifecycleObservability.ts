type LifecycleContext = Record<string, string | number | boolean | null | undefined>;

function emit(event: string, context: LifecycleContext = {}): void {
  if (import.meta.env.PROD) return;
  console.info(`[bamsignal] ${event}`, { at: new Date().toISOString(), ...context });
}

export function logClientTimerCleanup(name: string, context: LifecycleContext = {}): void {
  emit("timer_cleanup", { name, ...context });
}

export function logClientListenerCleanup(name: string, context: LifecycleContext = {}): void {
  emit("listener_cleanup", { name, ...context });
}

export function logClientRetryExhausted(service: string, context: LifecycleContext = {}): void {
  emit("retry_exhausted", { service, ...context });
}

export function logClientWebsocketClosed(context: LifecycleContext = {}): void {
  emit("websocket_closed", context);
}

/** Register an interval that clears itself and logs cleanup on unmount. */
export function trackInterval(
  callback: () => void,
  ms: number,
  name: string
): { clear: () => void } {
  const id = window.setInterval(callback, ms);
  return {
    clear: () => {
      window.clearInterval(id);
      logClientTimerCleanup(name, { kind: "interval" });
    }
  };
}

/** Register a timeout that logs cleanup when cleared early. */
export function trackTimeout(callback: () => void, ms: number, name: string): { clear: () => void } {
  const id = window.setTimeout(callback, ms);
  return {
    clear: () => {
      window.clearTimeout(id);
      logClientTimerCleanup(name, { kind: "timeout" });
    }
  };
}
