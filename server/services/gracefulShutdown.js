/**
 * Graceful shutdown coordinator — ordered teardown via service registry.
 */
import { getServiceRegistry } from "./serviceRegistry.js";
import { setHttpServerForRegistry } from "./serviceDefinitions.js";
import { logObservabilityEvent } from "./observability.js";

/** @type {boolean} */
let shutdownHandlersRegistered = false;
/** @type {boolean} */
let shutdownInProgress = false;

/**
 * @param {import("node:http").Server} server
 */
export function registerHttpServerForShutdown(server) {
  setHttpServerForRegistry(server);
}

/**
 * @param {{ reason: string, error?: unknown }} options
 */
export async function gracefulShutdown(options = { reason: "signal" }) {
  if (shutdownInProgress) return;
  shutdownInProgress = true;

  const reason = options.reason || "unknown";
  console.log(`[bamsignal] Graceful shutdown started (${reason})`);
  logObservabilityEvent("graceful_shutdown_started", { reason }, "info");

  try {
    const registry = getServiceRegistry();
    const result = await registry.shutdownAll();
    logObservabilityEvent(
      "graceful_shutdown_completed",
      { reason, ok: result.ok, services: result.results?.length ?? 0 },
      result.ok ? "info" : "warn"
    );
    console.log(`[bamsignal] Graceful shutdown completed (ok=${result.ok})`);
  } catch (error) {
    logObservabilityEvent(
      "graceful_shutdown_failed",
      { reason, error: error instanceof Error ? error.message : String(error) },
      "error"
    );
    console.error("[bamsignal] Graceful shutdown failed:", error);
  } finally {
    process.exit(options.error ? 1 : 0);
  }
}

export function registerGracefulShutdownHandlers() {
  if (shutdownHandlersRegistered) return;
  shutdownHandlersRegistered = true;

  const onSignal = (signal) => {
    void gracefulShutdown({ reason: signal });
  };

  process.on("SIGTERM", onSignal);
  process.on("SIGINT", onSignal);

  process.on("uncaughtException", (error) => {
    console.error("[bamsignal] Uncaught exception:", error);
    void gracefulShutdown({ reason: "uncaughtException", error });
  });

  process.on("unhandledRejection", (reason) => {
    console.error("[bamsignal] Unhandled rejection:", reason);
    void gracefulShutdown({ reason: "unhandledRejection", error: reason });
  });
}

export function resetGracefulShutdownForTests() {
  shutdownHandlersRegistered = false;
  shutdownInProgress = false;
  setHttpServerForRegistry(null);
}
