/** Parse registered Express routes from server/app.js source (static analysis). */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

export const CRITICAL_PRODUCTION_API_ROUTES = [
  { method: "GET", path: "/api/feature-flags", handlerFile: "api/feature-flags/index.js" },
  { method: "GET", path: "/api/remote-config", handlerFile: "api/remote-config/index.js" }
];

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function parseRoutesFromAppSource(source) {
  const routes = [];

  const mountPattern =
    /mountHandler\s*\(\s*app\s*,\s*["'](\w+)["']\s*,\s*["']([^"']+)["']/g;
  for (const match of source.matchAll(mountPattern)) {
    routes.push({ method: match[1].toUpperCase(), path: match[2], mount: "mountHandler" });
  }

  const directPattern = /app\.(get|post|head|put|delete|patch)\s*\(\s*["']([^"']+)["']/g;
  for (const match of source.matchAll(directPattern)) {
    routes.push({ method: match[1].toUpperCase(), path: match[2], mount: "express" });
  }

  const seen = new Set();
  return routes.filter((route) => {
    const key = `${route.method} ${route.path}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function buildServerRouteInventory(options = {}) {
  const root = options.rootPath || rootPath;
  const appPath = join(root, "server/app.js");
  const source = readFileSync(appPath, "utf8");
  const routes = parseRoutesFromAppSource(source).sort((a, b) =>
    a.path === b.path ? a.method.localeCompare(b.method) : a.path.localeCompare(b.path)
  );

  const critical = CRITICAL_PRODUCTION_API_ROUTES.map((entry) => {
    const mounted = routes.some(
      (route) => route.method === entry.method && route.path === entry.path
    );
    const handlerExists = existsSync(join(root, entry.handlerFile));
    return {
      ...entry,
      mounted,
      handlerExists,
      ok: mounted && handlerExists
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    appPath: "server/app.js",
    routeCount: routes.length,
    routes,
    criticalRoutes: critical,
    allCriticalOk: critical.every((entry) => entry.ok)
  };
}

export function assertCriticalRoutesRegistered(options = {}) {
  const inventory = buildServerRouteInventory(options);
  const missing = inventory.criticalRoutes.filter((entry) => !entry.ok);
  if (missing.length) {
    const details = missing
      .map((entry) => {
        if (!entry.handlerExists) return `${entry.method} ${entry.path} (handler missing: ${entry.handlerFile})`;
        return `${entry.method} ${entry.path} (not mounted in server/app.js)`;
      })
      .join("; ");
    throw new Error(`Critical production API routes missing: ${details}`);
  }
  return inventory;
}
