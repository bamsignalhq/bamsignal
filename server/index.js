import express from "express";
import { config } from "./config.js";
import { dbEnabled } from "./db.js";
import { publishTip } from "./controllers/publishTip.js";
import { paystackRouter } from "./routes/paystack.js";
import { affiliateRouter } from "./routes/affiliate.js";
import { dailySignalsRouter } from "./routes/dailySignals.js";
import { registerBotCommands, bot } from "./telegram.js";
import { startResultCron } from "./cron/results.js";
import { startDailySignalCron } from "./cron/dailySignals.js";

const app = express();

app.use((req, res, next) => {
  if (req.path === "/webhooks/paystack") {
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
    service: "bamsignal-automation",
    database: dbEnabled ? "connected" : "dry-run",
    telegram: Boolean(config.telegram.botToken),
    firebase: Boolean(config.firebase.serviceAccount),
    dailySignalWorker: config.signalWorker.enabled ? `${config.signalWorker.cron} ${config.signalWorker.timezone}` : "disabled"
  });
});

app.post("/publish-tip", publishTip);
app.use(paystackRouter);
app.use(affiliateRouter);
app.use(dailySignalsRouter);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ ok: false, error: error.message || "Internal server error" });
});

app.listen(config.port, () => {
  console.log(`BamSignal automation server running on http://localhost:${config.port}`);
});

registerBotCommands();
if (bot && process.env.TELEGRAM_ENABLE_POLLING === "true") {
  bot.launch();
}
startResultCron();
startDailySignalCron();
