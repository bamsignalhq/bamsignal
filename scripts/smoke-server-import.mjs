/**
 * Verify production server modules resolve (catches missing shared/*.mjs, etc.).
 * Uses a free port so local dev on :3000 does not block the check.
 */
const port = Number(process.env.SMOKE_PORT || process.env.PORT || 39451);
process.env.PORT = String(port);

try {
  await import("../server/production.js");
  console.log("server ok");
  process.exit(0);
} catch (error) {
  console.error("server import failed:", error);
  process.exit(1);
}
