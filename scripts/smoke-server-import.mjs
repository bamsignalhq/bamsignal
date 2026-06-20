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
const requiredRouteMounts = [
  { method: "post", route: "/api/auth/pin-login" },
  { method: "post", route: "/api/auth/pin-reset" },
  { method: "post", route: "/api/auth/email-code" },
  { method: "post", route: "/api/member/data" }
];
for (const { method, route } of requiredRouteMounts) {
  const mountPattern = new RegExp(
    `mountHandler\\(\\s*app\\s*,\\s*["']${method}["']\\s*,\\s*["']${route.replace(/\//g, "\\/")}["']`
  );
  const expressPattern = new RegExp(`app\\.${method}\\(\\s*["']${route.replace(/\//g, "\\/")}["']`);
  if (!mountPattern.test(productionSource) && !expressPattern.test(productionSource)) {
    console.error(`server smoke failed: missing ${method.toUpperCase()} route mount for ${route}`);
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
  const routeChecks = [
    {
      path: "/api/auth/pin-login",
      body: { username: "__smoke__", pin: "000000" }
    },
    {
      path: "/api/auth/pin-reset?action=__smoke__",
      body: { action: "__smoke__" }
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
