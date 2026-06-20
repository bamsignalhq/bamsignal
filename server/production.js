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
import { createApp, healthPayload } from "./app.js";

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
  const health = await healthPayload();
  if (!health.signupEmail) {
    console.warn(
      "[bamsignal] signupEmail=false — set RESEND_API_KEY, SUPABASE_SERVICE_ROLE_KEY, and SUPABASE_URL in Coolify."
    );
  }
});

void initDatabase()
  .then(async () => {
    const viewFix = await fixSecurityDefinerViews().catch((error) => {
      console.warn("[bamsignal] security definer view fix skipped:", error.message || error);
      return null;
    });
    if (viewFix?.fixed?.length) {
      console.log(`[bamsignal] security_invoker enabled on views: ${viewFix.fixed.join(", ")}`);
    }

    const functionFix = await fixFunctionSecurity().catch((error) => {
      console.warn("[bamsignal] function security fix skipped:", error.message || error);
      return null;
    });
    if (functionFix?.searchPathFixed?.length || functionFix?.rpcRevoked?.length) {
      console.log(
        `[bamsignal] function security hardened: search_path=${functionFix.searchPathFixed.join(", ") || "none"}; rpc_revoked=${functionFix.rpcRevoked.join(", ") || "none"}`
      );
    }

    const { processExpiredAccountDeletions } = await import("./memberTrust.js");
    const deletionResult = await processExpiredAccountDeletions().catch((error) => {
      console.warn("[bamsignal] account deletion sweep skipped:", error.message || error);
      return { processed: 0 };
    });
    if (deletionResult?.processed) {
      console.log(`[bamsignal] finalized ${deletionResult.processed} scheduled account deletion(s)`);
    }
  })
  .catch((error) => {
    console.error("[bamsignal] Database init error:", error.message || error);
  });

server.on("error", (error) => {
  console.error("[bamsignal] Server failed to start:", error);
  process.exit(1);
});

try {
  registerBotCommands();
  if (bot && process.env.TELEGRAM_ENABLE_POLLING === "true") {
    bot.launch().catch((error) => {
      console.error("[bamsignal] Telegram polling failed:", error);
    });
  }
} catch (error) {
  console.error("[bamsignal] Telegram setup skipped:", error);
}
