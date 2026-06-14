import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config.js";
import { dbEnabled } from "./db.js";
import { paystackRouter } from "./routes/paystack.js";
import { handleContactNodeRequest } from "./services/contactMail.js";
import { registerBotCommands, bot } from "./telegram.js";
import { mountHandler } from "./mountHandler.js";
import identityHandler from "../api/auth/identity.js";
import paystackVerifyHandler from "../api/paystack/verify.js";

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
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("[bamsignal] Unhandled rejection:", reason);
  process.exit(1);
});

const app = express();

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

function healthPayload() {
  return {
    ok: true,
    service: "bamsignal",
    database: dbEnabled ? "connected" : "dry-run",
    telegram: Boolean(config.telegram.botToken),
    firebase: Boolean(config.firebase.serviceAccount)
  };
}

app.get("/health", (_req, res) => {
  res.status(200).json(healthPayload());
});

app.head("/health", (_req, res) => {
  res.status(200).end();
});

app.post("/api/contact", handleContactNodeRequest);
mountHandler(app, "post", "/api/auth/identity", identityHandler);
mountHandler(app, "post", "/api/paystack/verify", paystackVerifyHandler);
app.use(paystackRouter);

app.use(express.static(distDir, { index: false, maxAge: "1d" }));

app.use((req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") return next();
  if (req.path.startsWith("/api/") || req.path.startsWith("/webhooks/")) return next();
  res.sendFile(indexHtml, (error) => {
    if (error) next(error);
  });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ ok: false, error: error.message || "Internal server error" });
});

const server = app.listen(port, host, () => {
  console.log(`BamSignal running on http://${host}:${port}`);
});

server.on("error", (error) => {
  console.error("[bamsignal] Server failed to start:", error);
  process.exit(1);
});

registerBotCommands();
if (bot && process.env.TELEGRAM_ENABLE_POLLING === "true") {
  bot.launch().catch((error) => {
    console.error("[bamsignal] Telegram polling failed:", error);
  });
}
