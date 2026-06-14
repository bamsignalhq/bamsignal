import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config.js";
import { dbEnabled } from "./db.js";
import { paystackRouter } from "./routes/paystack.js";
import { handleContactNodeRequest } from "./services/contactMail.js";
import { registerBotCommands, bot } from "./telegram.js";
import { mountHandler } from "./mountHandler.js";
import contactHandler from "../api/contact.js";
import identityHandler from "../api/auth/identity.js";
import paystackVerifyHandler from "../api/paystack/verify.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "..", "dist");

const app = express();

app.use((req, res, next) => {
  if (req.path === "/webhooks/paystack" || req.path === "/api/webhooks/paystack") {
    express.raw({ type: "application/json" })(req, res, () => {
      req.rawBody = req.body;
      next();
    });
    return;
  }
  express.json()(req, res, next);
});

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "bamsignal",
    database: dbEnabled ? "connected" : "dry-run",
    telegram: Boolean(config.telegram.botToken),
    firebase: Boolean(config.firebase.serviceAccount)
  });
});

app.post("/api/contact", handleContactNodeRequest);
mountHandler(app, "post", "/api/auth/identity", identityHandler);
mountHandler(app, "post", "/api/paystack/verify", paystackVerifyHandler);
app.use(paystackRouter);

app.use(express.static(distDir, { index: false, maxAge: "1d" }));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/webhooks/")) {
    return next();
  }
  res.sendFile(path.join(distDir, "index.html"), (error) => {
    if (error) next(error);
  });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ ok: false, error: error.message || "Internal server error" });
});

const host = process.env.HOST || "0.0.0.0";
app.listen(config.port, host, () => {
  console.log(`BamSignal running on http://${host}:${config.port}`);
});

registerBotCommands();
if (bot && process.env.TELEGRAM_ENABLE_POLLING === "true") {
  bot.launch();
}
