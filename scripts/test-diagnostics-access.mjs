/**
 * Static + smoke checks for /api/diagnostics/* authorization.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

function assertCheck(condition, message) {
  if (condition) return;
  console.error(`diagnostics access test failed: ${message}`);
  process.exit(1);
}

const diagnosticsAccessSource = readFileSync(
  join(rootPath, "server/services/diagnosticsAccess.js"),
  "utf8"
);
const viewSecuritySource = readFileSync(join(rootPath, "api/diagnostics/view-security.js"), "utf8");
const functionSecuritySource = readFileSync(
  join(rootPath, "api/diagnostics/function-security.js"),
  "utf8"
);
const paystackConnectivitySource = readFileSync(
  join(rootPath, "api/diagnostics/paystack-connectivity.js"),
  "utf8"
);

assertCheck(
  diagnosticsAccessSource.includes("export async function requireDiagnosticsAccess") &&
    diagnosticsAccessSource.includes('headers?.["x-diagnostics-secret"]') &&
    diagnosticsAccessSource.includes("verifySupabaseAdmin") &&
    diagnosticsAccessSource.includes("DIAGNOSTICS_SECRET") &&
    diagnosticsAccessSource.includes("process.env.CRON_SECRET"),
  "diagnosticsAccess must accept x-diagnostics-secret or verified admin session"
);

for (const [label, source, sensitiveCall] of [
  ["view-security", viewSecuritySource, "securityInvokerViewStatus()"],
  ["function-security", functionSecuritySource, "functionSecurityStatus()"],
  ["paystack-connectivity", paystackConnectivitySource, "probePaystackConnectivity()"]
]) {
  assertCheck(
    source.includes("requireDiagnosticsAccess(req)") &&
      source.includes("sendDiagnosticsAccessDenied"),
    `${label} must use shared diagnostics access helper`
  );
  assertCheck(
    !source.includes("function isAuthorized") && !source.includes("x-bamsignal-secret"),
    `${label} must not keep legacy public auth bypass`
  );
  assertCheck(
    source.indexOf("requireDiagnosticsAccess(req)") < source.indexOf(sensitiveCall),
    `${label} must authorize before returning diagnostics payload`
  );
  assertCheck(
    !source.includes("Diagnostics secret required"),
    `${label} must not reveal diagnostics purpose in auth errors`
  );
}

process.env.CRON_SECRET = "diagnostics-test-secret";
const { hasDiagnosticsSecret } = await import("../server/services/diagnosticsAccess.js");
assertCheck(
  hasDiagnosticsSecret({ headers: { "x-diagnostics-secret": "diagnostics-test-secret" } }),
  "matching x-diagnostics-secret must authorize"
);
assertCheck(
  !hasDiagnosticsSecret({ headers: { "x-diagnostics-secret": "wrong-secret" } }),
  "wrong x-diagnostics-secret must not authorize"
);
assertCheck(
  !hasDiagnosticsSecret({ headers: { "x-bamsignal-secret": "diagnostics-test-secret" } }),
  "legacy x-bamsignal-secret header must not authorize diagnostics"
);

const port = Number(process.env.SMOKE_PORT || process.env.DIAGNOSTICS_SMOKE_PORT || 39453);
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
  throw new Error("server did not become ready for diagnostics access smoke");
}

try {
  await import("../server/production.js");
  const baseUrl = `http://127.0.0.1:${port}`;

  await waitForServer(baseUrl);

  const endpoints = [
    { method: "GET", path: "/api/diagnostics/view-security" },
    { method: "POST", path: "/api/diagnostics/view-security" },
    { method: "GET", path: "/api/diagnostics/function-security" },
    { method: "POST", path: "/api/diagnostics/function-security" },
    { method: "GET", path: "/api/diagnostics/paystack-connectivity" }
  ];

  for (const endpoint of endpoints) {
    const response = await fetch(`${baseUrl}${endpoint.path}`, { method: endpoint.method });
    assertCheck(
      response.status === 404,
      `${endpoint.method} ${endpoint.path} without secret must return 404 (got ${response.status})`
    );
    const body = await response.text();
    assertCheck(!body.includes("views") && !body.includes("functions") && !body.includes("paystack"), `${endpoint.method} ${endpoint.path} must not leak diagnostics payload`);
  }

  const authorizedResponse = await fetch(`${baseUrl}/api/diagnostics/paystack-connectivity`, {
    headers: { "x-diagnostics-secret": "diagnostics-test-secret" }
  });
  assertCheck(
    authorizedResponse.status === 200,
    `paystack diagnostics with secret must return 200 (got ${authorizedResponse.status})`
  );
  const authorizedPayload = await authorizedResponse.json();
  assertCheck(
    typeof authorizedPayload?.paystack === "object",
    "authorized paystack diagnostics must return probe payload"
  );

  console.log("diagnostics access tests ok");
  process.exit(0);
} catch (error) {
  console.error("diagnostics access tests failed:", error);
  process.exit(1);
}
