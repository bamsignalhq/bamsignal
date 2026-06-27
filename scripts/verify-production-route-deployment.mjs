#!/usr/bin/env node
/**
 * Production route deployment investigation — inventory, git/deploy diff, live probe.
 *
 * Usage: npm run verify:production-routes
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildServerRouteInventory,
  CRITICAL_PRODUCTION_API_ROUTES
} from "../shared/serverRouteInventory.mjs";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(rootPath, "docs/operations/deployment");
const productionBaseUrl = String(process.env.CERTIFICATION_BASE_URL || "https://bamsignal.com").replace(
  /\/$/,
  ""
);

function readBuildInfo() {
  try {
    const raw = readFileSync(join(rootPath, "src/buildInfo.ts"), "utf8");
    return {
      version: raw.match(/BUILD_VERSION = "([^"]+)"/)?.[1] || null,
      code: raw.match(/BUILD_CODE = "([^"]+)"/)?.[1] || null,
      cacheVersion: raw.match(/CACHE_VERSION = "([^"]+)"/)?.[1] || null,
      buildTime: raw.match(/BUILD_TIME = "([^"]+)"/)?.[1] || null
    };
  } catch {
    return { version: null, code: null, cacheVersion: null, buildTime: null };
  }
}

function git(command) {
  try {
    return execSync(command, { cwd: rootPath, encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

function parseProductionBuildMeta(html) {
  return html.match(/name="bamsignal-build"\s+content="([^"]+)"/)?.[1] || null;
}

async function probeRoute(baseUrl, path, method = "GET") {
  const started = performance.now();
  try {
    const response = await fetch(`${baseUrl}${path}`, { method });
    const text = await response.text().catch(() => "");
    return {
      path,
      method,
      status: response.status,
      durationMs: Math.round(performance.now() - started),
      express404: text.includes("Cannot GET ") || text.includes("Cannot HEAD "),
      contentType: response.headers.get("content-type")
    };
  } catch (error) {
    return {
      path,
      method,
      status: 0,
      durationMs: Math.round(performance.now() - started),
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

function renderMarkdown(report) {
  const lines = [
    "# Deployment Discrepancy Report",
    "",
    `**Generated:** ${report.generatedAt}`,
    "",
    "## Root cause",
    "",
    report.rootCause,
    "",
    "## Evidence",
    "",
    ...report.evidence.map((item) => `- ${item}`),
    "",
    "## Version comparison",
    "",
    "| Field | Local | Production |",
    "|-------|-------|------------|",
    `| Git commit | \`${report.git.localHeadShort}\` | deployed marker \`${report.production.buildId || "unknown"}\` |`,
    `| origin/main | \`${report.git.originMainShort || "unknown"}\` | Coolify builds from this ref |`,
    `| Commits ahead of origin | ${report.git.commitsAheadOfOrigin} | routes not pushed if > 0 |`,
    `| Build version | ${report.local.build.version}.${report.local.build.code} | ${report.production.buildId || "unknown"} |`,
    `| Build cache id | ${report.local.build.cacheVersion || "—"} | from HTML meta |`,
    "",
    "## Critical routes",
    "",
    "| Route | Local mount | Handler file | Production status |",
    "|-------|-------------|--------------|-------------------|",
    ...report.criticalRoutes.map(
      (row) =>
        `| \`${row.method} ${row.path}\` | ${row.mounted ? "yes" : "no"} | ${row.handlerExists ? "yes" : "no"} | ${row.productionStatus} |`
    ),
    "",
    "## Registered API routes (local inventory)",
    "",
    `Total routes parsed from server/app.js: **${report.inventory.routeCount}**`,
    "",
    ...report.inventory.routes
      .filter((route) => route.path.startsWith("/api/"))
      .slice(0, 40)
      .map((route) => `- \`${route.method} ${route.path}\``),
    report.inventory.routes.filter((route) => route.path.startsWith("/api/")).length > 40
      ? `- … +${report.inventory.routes.filter((route) => route.path.startsWith("/api/")).length - 40} more`
      : "",
    "",
    "## Deployment mismatch",
    "",
    report.deploymentMismatch,
    "",
    "## Required corrective action",
    "",
    ...report.correctiveAction.map((item, index) => `${index + 1}. ${item}`),
    ""
  ];
  return lines.filter(Boolean).join("\n");
}

async function main() {
  const inventory = buildServerRouteInventory({ rootPath });
  const localBuild = readBuildInfo();
  const localHead = git("git rev-parse HEAD");
  const originMain = git("git rev-parse origin/main");
  const commitsAhead = git("git rev-list --count origin/main..HEAD");
  const commitsBehind = git("git rev-list --count HEAD..origin/main");

  const landing = await fetch(`${productionBaseUrl}/`);
  const landingHtml = await landing.text();
  const productionBuildId = parseProductionBuildMeta(landingHtml);

  const productionProbes = [];
  for (const route of CRITICAL_PRODUCTION_API_ROUTES) {
    productionProbes.push(await probeRoute(productionBaseUrl, route.path, route.method));
  }

  const originHasRoutes = originMain
    ? (() => {
        try {
          const appSource = execSync(`git show origin/main:server/app.js`, {
            cwd: rootPath,
            encoding: "utf8"
          });
          return CRITICAL_PRODUCTION_API_ROUTES.every((entry) =>
            appSource.includes(`"${entry.path}"`)
          );
        } catch {
          return false;
        }
      })()
    : false;

  const production404 = productionProbes.every((probe) => probe.status === 404 && probe.express404);
  const localOk = inventory.allCriticalOk;
  const unpushed = Number(commitsAhead || 0) > 0 && !originHasRoutes;

  let rootCause;
  if (unpushed && production404 && localOk) {
    rootCause =
      "**Local repository contains `/api/feature-flags` and `/api/remote-config`, but `origin/main` does not.** Coolify builds from GitHub `main`, so production runs an older server bundle without these mounts. Production returns Express `Cannot GET` HTML 404 (route not registered), not SPA fallback.";
  } else if (production404 && localOk) {
    rootCause =
      "**Production container is running a stale server image** that predates route registration in `server/app.js`. Express returns native 404 HTML for unregistered paths.";
  } else {
    rootCause = "Production route probe failed — see evidence below.";
  }

  const criticalRoutes = inventory.criticalRoutes.map((entry) => {
    const probe = productionProbes.find((item) => item.path === entry.path);
    return {
      ...entry,
      productionStatus: probe ? `HTTP ${probe.status}${probe.express404 ? " (Express 404)" : ""}` : "unprobed"
    };
  });

  const report = {
    generatedAt: new Date().toISOString(),
    rootCause,
    evidence: [
      `Production \`GET /api/feature-flags\` → ${productionProbes[0]?.status} (${productionProbes[0]?.express404 ? "Express Cannot GET" : "other"})`,
      `Production \`GET /api/remote-config\` → ${productionProbes[1]?.status} (${productionProbes[1]?.express404 ? "Express Cannot GET" : "other"})`,
      `Production \`POST /api/auth/pin-login\` → ${(await probeRoute(productionBaseUrl, "/api/auth/pin-login", "POST")).status} (route exists on prod)`,
      `Local inventory: ${inventory.routeCount} routes; critical routes mounted=${inventory.allCriticalOk}`,
      `Local HEAD: ${localHead}`,
      `origin/main: ${originMain}`,
      `Ahead of origin/main: ${commitsAhead || 0} commits`,
      `origin/main includes feature-flags mount: ${originHasRoutes}`,
      `Production HTML build meta: ${productionBuildId || "unknown"}`
    ],
    git: {
      localHead,
      localHeadShort: localHead?.slice(0, 12) || null,
      originMain,
      originMainShort: originMain?.slice(0, 12) || null,
      commitsAheadOfOrigin: Number(commitsAhead || 0),
      commitsBehindOrigin: Number(commitsBehind || 0),
      originHasCriticalRoutes: originHasRoutes
    },
    local: {
      build: localBuild,
      inventoryRouteCount: inventory.routeCount
    },
    production: {
      baseUrl: productionBaseUrl,
      buildId: productionBuildId,
      probes: productionProbes
    },
    inventory,
    criticalRoutes,
    deploymentMismatch:
      unpushed
        ? `Git divergence: local main is ${commitsAhead} commits ahead of origin/main. Coolify never received commits that add feature-flags and remote-config (from \`af251e7\` onward). Production build marker \`${productionBuildId}\` matches pre-route release \`v1.0.14-17\`.`
        : `Production build \`${productionBuildId}\` does not match local \`${localBuild.cacheVersion}\`.`,
    correctiveAction: unpushed
      ? [
          "Push local `main` to `github.com/bamsignalhq/bamsignal` (`git push origin main`).",
          "Trigger Coolify redeploy (disable cache reuse / force rebuild if needed).",
          "Confirm production HTML meta updates to `bamsignal-v1.0.15-18-*` or newer.",
          "Verify `GET /api/feature-flags` and `GET /api/remote-config` return HTTP 200.",
          "Re-run `npm run smoke:production` and `npm run certify:rc`."
        ]
      : [
          "Force Coolify Docker rebuild from latest `origin/main`.",
          "Verify production build meta and route probes.",
          "Re-run smoke and RC certification."
        ]
  };

  mkdirSync(outDir, { recursive: true });
  const jsonPath = join(outDir, "deployment-discrepancy-report.json");
  const mdPath = join(outDir, "deployment-discrepancy-report.md");
  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  writeFileSync(mdPath, `${renderMarkdown(report)}\n`, "utf8");

  console.log("\n=== Production Route Deployment Investigation ===\n");
  console.log(`Root cause: ${rootCause.replace(/\*\*/g, "")}`);
  console.log(`Local routes: ${inventory.routeCount} · critical OK: ${inventory.allCriticalOk}`);
  console.log(`origin/main has routes: ${originHasRoutes} · ahead: ${commitsAhead || 0}`);
  console.log(`Production build: ${productionBuildId || "unknown"}`);
  for (const probe of productionProbes) {
    console.log(`  ${probe.method} ${probe.path} → ${probe.status}`);
  }
  console.log(`\nReport: ${mdPath}\n`);

  if (!inventory.allCriticalOk) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Production route deployment investigation failed:", error);
  process.exit(1);
});
