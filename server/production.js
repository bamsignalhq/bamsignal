import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config.js";
import { isSignupEmailConfigured, getSignupEmailHealthTrace } from "./supabaseEnv.js";
import { corsMiddleware } from "./cors.js";
import { fixFunctionSecurity } from "./fixFunctionSecurity.js";
import { fixSecurityDefinerViews } from "./fixSecurityDefinerViews.js";
import { getDatabaseStatus, initDatabase, pingDatabase } from "./db.js";
import { paystackRouter } from "./routes/paystack.js";
import { handleContactNodeRequest } from "./services/contactMail.js";
import { registerBotCommands, bot } from "./telegram.js";
import { mountHandler } from "./mountHandler.js";
import identityHandler from "../api/auth/identity.js";
import emailCodeHandler from "../api/auth/email-code.js";
import playReviewerFinishHandler from "../api/auth/play-reviewer-finish.js";
import paystackVerifyHandler from "../api/paystack/verify.js";
import paystackConnectivityHandler from "../api/diagnostics/paystack-connectivity.js";
import viewSecurityHandler from "../api/diagnostics/view-security.js";
import functionSecurityHandler from "../api/diagnostics/function-security.js";
import memberDataHandler from "../api/member/data.js";
import cityHomeHandler from "../api/city/home.js";
import citySpotlightHandler from "../api/city/spotlight.js";
import citySpotlightEventHandler from "../api/city/spotlight-event.js";
import adminCityHomeHandler from "../api/admin/city-home.js";
import adminCitySpotlightHandler from "../api/admin/city-spotlight.js";
import whatsappVerifyStartHandler from "../api/verify/whatsapp/start.js";
import whatsappVerifyConfirmHandler from "../api/verify/whatsapp/confirm.js";
import verificationSubmissionsHandler from "../api/verify/submissions.js";
import { getSendchampHealthTrace, isSendchampConfigured } from "./services/sendchamp.js";

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

const app = express();

app.use((req, res, next) => {
  const host = String(req.headers.host || "");
  if (host.startsWith("www.")) {
    const apex = host.replace(/^www\./i, "");
    return res.redirect(301, `https://${apex}${req.originalUrl}`);
  }
  next();
});

app.use(corsMiddleware);

app.use((req, res, next) => {
  if (
    req.path === "/webhooks/paystack" ||
    req.path === "/api/webhooks/paystack" ||
    req.path === "/api/paystack/webhook"
  ) {
    express.raw({ type: "application/json" })(req, res, () => {
      req.rawBody = req.body;
      next();
    });
    return;
  }
  express.json()(req, res, next);
});

async function healthPayload() {
  let database = getDatabaseStatus();
  if (database === "connected") {
    const alive = await pingDatabase();
    database = alive ? "connected" : "disconnected";
  }

  return {
    ok: true,
    service: "bamsignal",
    database,
    paystack: Boolean(config.paystackSecretKey),
    resend: Boolean(process.env.RESEND_API_KEY?.trim()),
    signupEmail: isSignupEmailConfigured(),
    signupEmailTrace: getSignupEmailHealthTrace(),
    firebase: Boolean(config.firebase.serviceAccount),
    telegram: Boolean(config.telegram.botToken),
    sendchamp: isSendchampConfigured(),
    sendchampTrace: getSendchampHealthTrace()
  };
}

app.get("/health", async (_req, res) => {
  res.status(200).json(await healthPayload());
});

app.head("/health", (_req, res) => {
  res.status(200).end();
});

app.post("/api/contact", handleContactNodeRequest);
mountHandler(app, "post", "/api/auth/email-code", emailCodeHandler);
mountHandler(app, "post", "/api/auth/play-reviewer-finish", playReviewerFinishHandler);
mountHandler(app, "post", "/api/auth/identity", identityHandler);
mountHandler(app, "post", "/api/verify/whatsapp/start", whatsappVerifyStartHandler);
mountHandler(app, "post", "/api/verify/whatsapp/confirm", whatsappVerifyConfirmHandler);
mountHandler(app, "post", "/api/verify/submissions", verificationSubmissionsHandler);
mountHandler(app, "get", "/api/verify/submissions", verificationSubmissionsHandler);
mountHandler(app, "post", "/api/member/data", memberDataHandler);
mountHandler(app, "post", "/api/paystack/verify", paystackVerifyHandler);
mountHandler(app, "get", "/api/diagnostics/paystack-connectivity", paystackConnectivityHandler);
mountHandler(app, "get", "/api/diagnostics/view-security", viewSecurityHandler);
mountHandler(app, "post", "/api/diagnostics/view-security", viewSecurityHandler);
mountHandler(app, "get", "/api/diagnostics/function-security", functionSecurityHandler);
mountHandler(app, "post", "/api/diagnostics/function-security", functionSecurityHandler);
mountHandler(app, "post", "/api/admin/city-home", adminCityHomeHandler);
mountHandler(app, "get", "/api/admin/city-spotlight", adminCitySpotlightHandler);
mountHandler(app, "get", "/api/city/home", cityHomeHandler);
mountHandler(app, "get", "/api/city/spotlight", citySpotlightHandler);
mountHandler(app, "post", "/api/city/spotlight-event", citySpotlightEventHandler);
app.use(paystackRouter);

app.use(express.static(distDir, { index: false, maxAge: "1d" }));

app.use((req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") return next();
  if (req.path.startsWith("/api/") || req.path.startsWith("/webhooks/")) return next();
  if (req.path === "/" || req.path.endsWith(".html")) {
    res.setHeader("Cache-Control", "no-cache");
  }
  res.sendFile(indexHtml, (error) => {
    if (error) next(error);
  });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  if (!res.headersSent) {
    res.status(500).json({ ok: false, error: error.message || "Internal server error" });
  }
});

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
