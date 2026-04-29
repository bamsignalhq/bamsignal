import cron from "node-cron";
import axios from "axios";
import { config } from "../config.js";
import { query } from "../db.js";
import { postResultProof } from "../telegram.js";

async function fetchResult(tip) {
  if (!config.liveScore.apiUrl || !config.liveScore.apiKey) return null;

  const response = await axios.get(config.liveScore.apiUrl, {
    headers: { Authorization: `Bearer ${config.liveScore.apiKey}` },
    params: {
      match_name: tip.match_name,
      starts_at: tip.starts_at
    },
    timeout: 10000
  });

  return response.data;
}

function normalizeStatus(result) {
  if (!result?.finished) return null;
  return result.won ? "won" : "lost";
}

export async function checkPendingResults() {
  const pending = await query(
    `select * from tips
     where status = 'pending'
       and starts_at is not null
       and starts_at < now()
     order by starts_at asc
     limit 25`
  );

  const updates = [];
  for (const tip of pending.rows) {
    const result = await fetchResult(tip);
    const status = normalizeStatus(result);
    if (!status) continue;

    const updated = await query(
      `update tips
       set status = $1,
           result_payload = $2,
           settled_at = now()
       where id = $3
       returning *`,
      [status, result, tip.id]
    );

    const settledTip = updated.rows[0];
    await postResultProof(settledTip);
    updates.push({ id: tip.id, status });
  }

  return updates;
}

export function startResultCron() {
  cron.schedule("*/15 * * * *", async () => {
    try {
      await checkPendingResults();
    } catch (error) {
      console.error("Result cron failed", error);
    }
  });
}
