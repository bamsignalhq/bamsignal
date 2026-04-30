import pg from "pg";
import { config } from "./config.js";

const { Pool } = pg;

export const pool = config.databaseUrl
  ? new Pool({
      connectionString: config.databaseUrl,
      ssl: process.env.PGSSLMODE === "disable" ? false : { rejectUnauthorized: false }
    })
  : null;

export const dbEnabled = Boolean(pool);

export async function query(text, params = []) {
  if (!pool) return { rows: [], rowCount: 0 };
  return pool.query(text, params);
}

export async function withDbRetry(task, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
      }
    }
  }
  throw lastError;
}

export async function insertTip(tip) {
  if (!pool) {
    return { ...tip, id: `dry-run-${Date.now()}` };
  }

  const result = await query(
    `insert into tips (match_name, league, prediction, odds, confidence, is_vip, booking_codes, source, status, starts_at)
     values ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9)
     returning *`,
    [
      tip.match_name,
      tip.league || null,
      tip.prediction,
      tip.odds,
      tip.confidence || null,
      tip.is_vip,
      tip.booking_codes,
      tip.source || null,
      tip.starts_at || null
    ]
  );
  return result.rows[0];
}
