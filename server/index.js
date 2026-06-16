import express from "express";
import { config } from "./config.js";
import { getDatabaseStatus, initDatabase, pingDatabase } from "./db.js";
import { getFirebaseHealth } from "./firebase.js";
import { paystackRouter } from "./routes/paystack.js";
import { handleContactNodeRequest } from "./services/contactMail.js";
import { registerBotCommands, bot } from "./telegram.js";

const app = express();

app.use((req, res, next) => {
  if (req.path === "/webhooks/paystack") {
    express.raw({ type: "application/json" })(req, res, () => {
      req.rawBody = req.body;
      next();
    });
    return;
  }
  express.json({ limit: "12mb" })(req, res, next);
});

app.get("/health", async (_req, res) => {
  let database = getDatabaseStatus();
  if (database === "connected") {
    const alive = await pingDatabase();
    database = alive ? "connected" : "disconnected";
  }

  res.json({
    ok: true,
    service: "bamsignal-api",
    database,
    ...getFirebaseHealth(),
    telegram: Boolean(config.telegram.botToken)
  });
});

app.post("/api/contact", handleContactNodeRequest);
app.use(paystackRouter);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ ok: false, error: error.message || "Internal server error" });
});

app.listen(config.port, () => {
  console.log(`BamSignal API server running on http://localhost:${config.port}`);
  void initDatabase().catch((error) => {
    console.error("[bamsignal] Database init error:", error.message || error);
  });
});

registerBotCommands();
if (bot && process.env.TELEGRAM_ENABLE_POLLING === "true") {
  bot.launch();
}
