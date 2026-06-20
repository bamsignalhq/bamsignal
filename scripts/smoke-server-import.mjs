/**
 * Docker-safe server smoke test — server/, api/, shared/, scripts/ only.
 * Static src/ checks live in scripts/source-integrity-check.mjs (dev/pre-push).
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const port = Number(process.env.SMOKE_PORT || process.env.PORT || 39451);
process.env.PORT = String(port);

function assertSmoke(condition, message) {
  if (condition) return;
  console.error(`server smoke failed: ${message}`);
  process.exit(1);
}

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");
const productionPath = join(rootPath, "server", "production.js");
const serverAppPath = join(rootPath, "server", "app.js");
const indexPath = join(rootPath, "server", "index.js");
const productionSource = readFileSync(productionPath, "utf8");
const serverAppSource = readFileSync(serverAppPath, "utf8");

assertSmoke(
  !existsSync(indexPath),
  "server/index.js must not exist — use server/production.js as the only entrypoint"
);
assertSmoke(
  productionSource.includes('from "./app.js"') && productionSource.includes("createApp({ distDir })"),
  "server/production.js must delegate app creation to server/app.js"
);

const requiredRouteMounts = [
  { method: "post", route: "/api/auth/pin-login" },
  { method: "post", route: "/api/auth/pin-reset" },
  { method: "post", route: "/api/auth/email-code" },
  { method: "post", route: "/api/member/data" },
  { method: "post", route: "/api/member/photos" },
  { method: "post", route: "/api/paystack/verify" }
];
for (const { method, route } of requiredRouteMounts) {
  const mountPattern = new RegExp(
    `mountHandler\\(\\s*app\\s*,\\s*["']${method}["']\\s*,\\s*["']${route.replace(/\//g, "\\/")}["']`
  );
  const expressPattern = new RegExp(`app\\.${method}\\(\\s*["']${route.replace(/\//g, "\\/")}["']`);
  if (!mountPattern.test(serverAppSource) && !expressPattern.test(serverAppSource)) {
    console.error(`server smoke failed: missing ${method.toUpperCase()} route mount for ${route} in server/app.js`);
    process.exit(1);
  }
}

async function waitForServer(baseUrl) {
  let lastError;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/health`, { method: "HEAD" });
      if (response.ok) return;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw lastError || new Error("server did not become ready");
}

try {
  await import("../server/production.js");
  const baseUrl = `http://127.0.0.1:${port}`;
  await waitForServer(baseUrl);

  const healthResponse = await fetch(`${baseUrl}/health`);
  if (!healthResponse.ok) {
    console.error(`server smoke failed: GET /health returned ${healthResponse.status}`);
    process.exit(1);
  }
  const health = await healthResponse.json();
  if (!health?.ok || health.service !== "bamsignal") {
    console.error("server smoke failed: GET /health payload missing ok/service");
    process.exit(1);
  }

  const routeChecks = [
    {
      path: "/api/auth/pin-login",
      body: { username: "__smoke__", pin: "000000" }
    },
    {
      path: "/api/auth/pin-reset?action=__smoke__",
      body: { action: "__smoke__" }
    },
    {
      path: "/api/paystack/verify",
      body: { action: "__smoke__" }
    },
    {
      path: "/api/member/photos?action=__smoke__",
      body: { action: "__smoke__" }
    },
    {
      path: "/api/paystack/webhook",
      body: {}
    },
    {
      path: "/api/webhooks/paystack",
      body: {}
    },
    {
      path: "/webhooks/paystack",
      body: {}
    }
  ];

  for (const check of routeChecks) {
    const response = await fetch(`${baseUrl}${check.path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(check.body)
    });
    if (response.status === 404) {
      console.error(`server smoke failed: route is not mounted: ${check.path}`);
      process.exit(1);
    }
  }

  console.log("server ok");
  process.exit(0);
} catch (error) {
  console.error("server import failed:", error);
  process.exit(1);
}
