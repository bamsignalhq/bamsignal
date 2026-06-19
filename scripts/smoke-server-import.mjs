/**
 * Verify production server modules resolve (catches missing shared/*.mjs, etc.).
 * Uses a free port so local dev on :3000 does not block the check.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const port = Number(process.env.SMOKE_PORT || process.env.PORT || 39451);
process.env.PORT = String(port);

const productionPath = join(dirname(fileURLToPath(import.meta.url)), "..", "server", "production.js");
const productionSource = readFileSync(productionPath, "utf8");
const requiredRoutes = ["/api/auth/pin-login", "/api/auth/pin-reset", "/api/auth/email-code", "/api/member/data"];
for (const route of requiredRoutes) {
  if (!productionSource.includes(route)) {
    console.error(`server smoke failed: missing route mount for ${route}`);
    process.exit(1);
  }
}

try {
  await import("../server/production.js");
  console.log("server ok");
  process.exit(0);
} catch (error) {
  console.error("server import failed:", error);
  process.exit(1);
}
