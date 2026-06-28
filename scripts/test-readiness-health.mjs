/**
 * Liveness vs readiness health checks — production must not look healthy when deps are down.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { startProductionServer } from "../shared/startProductionServer.mjs";
import {
  isReadinessChecksReady,
  livenessPayload,
  readinessPayload
} from "../server/services/readiness.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const dockerfile = readFileSync(join(rootPath, "Dockerfile"), "utf8");
const appSource = readFileSync(join(rootPath, "server/app.js"), "utf8");
const readinessSource = readFileSync(join(rootPath, "server/services/readiness.js"), "utf8");

assert(
  dockerfile.includes("/ready") && !dockerfile.match(/HEALTHCHECK[\s\S]*\/health/),
  "Docker HEALTHCHECK must probe /ready, not /health"
);
assert(
  appSource.includes('app.get("/health"') &&
    appSource.includes("livenessPayload()") &&
    appSource.includes('app.get("/ready"') &&
    appSource.includes("readinessPayload"),
  "server must expose separate /health liveness and /ready readiness routes"
);
assert(
  readinessSource.includes("criticalReady") &&
    readinessSource.includes("getServiceRegistry") &&
    readinessSource.includes("checkSchema"),
  "readiness must check CRITICAL features via registry, database connectivity, and expose schema in detailed mode"
);

const live = livenessPayload();
assert(live.ok === true && live.service === "bamsignal", "liveness payload must stay minimal");
assert(!("database" in live), "liveness must not expose dependency status");

assert(
  isReadinessChecksReady({
    criticalReady: true,
    databaseReady: true
  }),
  "readiness helper must pass when critical features and database are ready"
);
assert(
  !isReadinessChecksReady({
    criticalReady: false,
    databaseReady: true
  }),
  "readiness helper must fail when critical features are missing"
);
assert(
  !isReadinessChecksReady({
    criticalReady: true,
    databaseReady: false
  }),
  "readiness helper must fail when database is unavailable"
);

const port = Number(process.env.SMOKE_PORT || process.env.READINESS_SMOKE_PORT || 39455);
process.env.PORT = String(port);

async function waitForServer(baseUrl) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/health`, { method: "HEAD" });
      if (response.ok) return;
    } catch {
      // retry
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("server did not become ready for readiness smoke");
}

try {
  await startProductionServer();
  const baseUrl = `http://127.0.0.1:${port}`;
  await waitForServer(baseUrl);

  const healthResponse = await fetch(`${baseUrl}/health`);
  assert(healthResponse.status === 200, `/health must return 200 (got ${healthResponse.status})`);
  const health = await healthResponse.json();
  assert(health.ok === true && health.service === "bamsignal", "/health must return minimal liveness payload");
  assert(
    Object.keys(health).every((key) => key === "ok" || key === "service" || key === "alive"),
    "/health must not expose dependency diagnostics publicly"
  );

  const readyResponse = await fetch(`${baseUrl}/ready`);
  assert(readyResponse.status === 503, `/ready must return 503 without production secrets (got ${readyResponse.status})`);
  const ready = await readyResponse.json();
  assert(ready.ok === false && ready.ready === false, "/ready must report not ready when deps are missing");
  assert(
    !("signupEmailTrace" in ready) &&
      !("sendchampTrace" in ready) &&
      !("database" in ready) &&
      !("paystack" in ready) &&
      !("photoStorage" in ready),
    "/ready must not leak internal dependency details publicly"
  );

  const publicPayload = await readinessPayload({ detailed: false });
  assert(publicPayload.ready === false, "readiness payload must be false in smoke env without secrets");

  console.log("readiness health tests ok");
  process.exit(0);
} catch (error) {
  console.error("readiness health tests failed:", error);
  process.exit(1);
}
