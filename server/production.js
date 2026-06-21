/**
 * Canonical BamSignal server entrypoint.
 * Docker/Coolify: CMD node server/production.js
 * Local: npm start
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initDatabase } from "./db.js";
import { fixFunctionSecurity } from "./fixFunctionSecurity.js";
import { fixSecurityDefinerViews } from "./fixSecurityDefinerViews.js";
import { registerBotCommands, bot } from "./telegram.js";
import { createApp } from "./app.js";
import { readinessPayload } from "./services/readiness.js";
import { logBackgroundTaskFailure, logReadyCheckFailed } from "./services/observability.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "..", "dist");
const indexHtml = path.join(distDir, "index.html");
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "0.0.0.0";

if (!fs.existsSync(indexHtml)) {
  console.error(`[bamsignal] Missing build output at ${indexHtml}. Run "npm run build" before starting production.`);
  process.exit(1);
}

process.on("uncaughtException", (error) => {
  console.error("[bamsignal] Uncaught exception:", error);
});

process.on("unhandledRejection", (reason) => {
  console.error("[bamsignal] Unhandled rejection:", reason);
});

const app = createApp({ distDir });

const server = app.listen(port, host, async () => {
  console.log(`[bamsignal] Running on http://${host}:${port}`);
  const readiness = await readinessPayload({ detailed: true });
  if (!readiness.ready) {
    logReadyCheckFailed({ source: "startup", ready: false });
    console.warn(
      "[bamsignal] Production readiness incomplete — GET /ready returns 503 until database, Paystack, signup email, and photo storage are configured."
    );
  }
  if (!readiness.signupEmail) {
    console.warn(
      "[bamsignal] signupEmail=false — set RESEND_API_KEY, SUPABASE_SERVICE_ROLE_KEY, and SUPABASE_URL in Coolify."
    );
  }
});

void initDatabase()
  .then(async () => {
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

    const { startRateLimitRetentionScheduler } = await import("./services/rateLimitRetention.js");
    const retentionScheduler = startRateLimitRetentionScheduler();
    if (retentionScheduler.started) {
      console.log(
        `[bamsignal] rate-limit retention cleanup scheduled every ${Math.round(retentionScheduler.intervalMs / 60_000)} minutes`
      );
    }
  })
  .catch((error) => {
    logBackgroundTaskFailure("database_init", error);
  });

server.on("error", (error) => {
  console.error("[bamsignal] Server failed to start:", error);
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
