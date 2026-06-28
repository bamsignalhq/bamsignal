/**
 * Explicit production server bootstrap for smoke tests and integration scripts.
 * Importing server/production.js must not start HTTP — call this after import.
 */
let startPromise = null;

export async function startProductionServer() {
  if (startPromise) return startPromise;
  startPromise = (async () => {
    const mod = await import("../server/production.js");
    if (typeof mod.startServer !== "function") {
      throw new Error("server/production.js must export startServer()");
    }
    await mod.startServer();
    return mod;
  })();
  return startPromise;
}
