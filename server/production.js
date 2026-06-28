/**
 * Canonical BamSignal server entrypoint.
 * Docker/Coolify: CMD node server/production.js
 * Local: npm start
 *
 * Importing this module is side-effect free — HTTP starts only via startServer()
 * or when executed as the process entry module.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { fixFunctionSecurity } from "./fixFunctionSecurity.js";
import { fixSecurityDefinerViews } from "./fixSecurityDefinerViews.js";
import { registerBotCommands, bot } from "./telegram.js";
import { createApp } from "./app.js";
import { readinessPayload } from "./services/readiness.js";
import { bootstrapStartup, bootstrapServiceRegistry, enforceProductionStartupGate } from "./services/startupBootstrap.js";
import {
  registerGracefulShutdownHandlers,
  registerHttpServerForShutdown
} from "./services/gracefulShutdown.js";
import { logBackgroundTaskFailure } from "./services/observability.js";
import { startRateLimitRetentionScheduler } from "./services/rateLimitRetention.js";
import { runStartupMigrations } from "./startupMigrations.js";
import { buildServerRouteInventory } from "../shared/serverRouteInventory.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "..", "dist");
const indexHtml = path.join(distDir, "index.html");

function isEntryModule() {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return import.meta.url === pathToFileURL(path.resolve(entry)).href;
  } catch {
    return false;
  }
}

async function runPostDatabaseStartup() {
  const viewFix = await fixSecurityDefinerViews().catch((error) => {
    logBackgroundTaskFailure("security_definer_view_fix", error);
    return null;
  });
  if (viewFix?.fixed?.length) {
    console.log(`[bamsignal] security_invoker enabled on views: ${viewFix.fixed.join(", ")}`);
  }

  const functionFix = await fixFunctionSecurity().catch((error) => {
    logBackgroundTaskFailure("function_security_fix", error);
    return null;
  });
  if (functionFix?.searchPathFixed?.length || functionFix?.rpcRevoked?.length) {
    console.log(
      `[bamsignal] function security hardened: search_path=${functionFix.searchPathFixed.join(", ") || "none"}; rpc_revoked=${functionFix.rpcRevoked.join(", ") || "none"}`
    );
  }

  const { processExpiredAccountDeletions } = await import("./memberTrust.js");
  const deletionResult = await processExpiredAccountDeletions().catch((error) => {
    logBackgroundTaskFailure("account_deletion_sweep", error);
    return { processed: 0 };
  });
  if (deletionResult?.processed) {
    console.log(`[bamsignal] finalized ${deletionResult.processed} scheduled account deletion(s)`);
  }
}

/** @returns {Promise<import("node:http").Server>} */
export async function startServer() {
  registerGracefulShutdownHandlers();

  const port = Number(process.env.PORT || 3000);
  const host = process.env.HOST || "0.0.0.0";

  const validation = await bootstrapStartup(process.env);
  enforceProductionStartupGate(validation);

  if (!fs.existsSync(indexHtml)) {
    console.error(`[bamsignal] Missing build output at ${indexHtml}. Run "npm run build" before starting production.`);
    process.exit(1);
  }

  try {
    await runStartupMigrations();
  } catch (error) {
    console.error("[bamsignal] Migration failed:", error);
    process.exit(1);
  }

  await bootstrapServiceRegistry(process.env);
  startRateLimitRetentionScheduler();

  const app = createApp({ distDir });
  const routeInventory = buildServerRouteInventory();
  console.log(
    `[bamsignal] Route inventory: ${routeInventory.routeCount} registered; critical config APIs=${routeInventory.allCriticalOk ? "ok" : "MISSING"}`
  );
  if (!routeInventory.allCriticalOk) {
    console.error("[bamsignal] FATAL: /api/feature-flags or /api/remote-config not mounted in server/app.js");
    process.exit(1);
  }

  return new Promise((resolve, reject) => {
    const server = app.listen(port, host, async () => {
      registerHttpServerForShutdown(server);
      console.log(
        `[bamsignal] Running on http://${host}:${port} (commit=${process.env.BAMSIGNAL_GIT_COMMIT || "unknown"})`
      );
      const readiness = await readinessPayload({ detailed: false });
      if (!readiness.ready) {
        console.warn("[bamsignal] GET /ready returns 503 until CRITICAL services and database are available.");
      }
      resolve(server);
    });

    void runPostDatabaseStartup().catch((error) => {
      logBackgroundTaskFailure("post_database_startup", error);
    });

    server.on("error", (error) => {
      console.error("[bamsignal] Server failed to start:", error);
      reject(error);
      process.exit(1);
    });

    try {
      registerBotCommands();
      if (bot && process.env.TELEGRAM_ENABLE_POLLING === "true") {
        bot.launch().catch((error) => {
          logBackgroundTaskFailure("telegram_polling", error);
        });
      }
    } catch (error) {
      logBackgroundTaskFailure("telegram_setup", error);
    }
  });
}

if (isEntryModule()) {
  startServer().catch((error) => {
    console.error("[bamsignal] Failed to start:", error);
    process.exit(1);
  });
}
