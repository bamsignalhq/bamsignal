import cron from "node-cron";
import { config } from "../config.js";
import { runDailySignalWorker } from "../services/signalWorker.js";

export function startDailySignalCron() {
  if (!config.signalWorker.enabled) {
    console.log("Daily signal worker disabled. Set SIGNAL_WORKER_ENABLED=true to run it.");
    return;
  }

  cron.schedule(config.signalWorker.cron, async () => {
    try {
      const result = await runDailySignalWorker({ broadcast: true });
      console.log("Daily signal worker completed", {
        date: result.date,
        freemium: result.freemium,
        vip: result.vip
      });
    } catch (error) {
      console.error("Daily signal worker failed", error);
    }
  }, {
    timezone: config.signalWorker.timezone
  });
}
