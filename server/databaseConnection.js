/**
 * Postgres connection layer — pool, query, and status only.
 * Domain persistence lives in server/db.js and server/services/*.
 */
import pg from "pg";
import {
  PG_POOL_CONNECTION_TIMEOUT_MS,
  PG_POOL_IDLE_TIMEOUT_MS,
  PG_POOL_MAX_DEFAULT
} from "../shared/operationalConstants.mjs";
import { config } from "./config.js";
import { logRetryExhausted, logThresholdedAlert } from "./services/observability.js";
import { sanitizeApiErrorForLog } from "./services/errorResponse.js";

const { Pool } = pg;

export const pool = config.databaseUrl
  ? new Pool({
      connectionString: config.databaseUrl,
      max: Math.max(1, Number(process.env.PG_POOL_MAX || PG_POOL_MAX_DEFAULT)),
      idleTimeoutMillis: PG_POOL_IDLE_TIMEOUT_MS,
      connectionTimeoutMillis: PG_POOL_CONNECTION_TIMEOUT_MS,
      ssl: process.env.PGSSLMODE === "disable" ? false : { rejectUnauthorized: false }
    })
  : null;

/** @type {"dry-run" | "connected" | "disconnected"} */
let dbConnectionStatus = config.databaseUrl ? "disconnected" : "dry-run";
let dbConnectionError = null;

function databaseErrorSummary(error, fallback = "Database unavailable") {
  const sanitized = sanitizeApiErrorForLog(error);
  return sanitized.category === "application_error" ? sanitized.message : fallback;
}

if (pool) {
  pool.on("error", (error) => {
    const sanitized = sanitizeApiErrorForLog(error);
    dbConnectionStatus = "disconnected";
    dbConnectionError = databaseErrorSummary(error, "Database pool error");
    logThresholdedAlert("db_unavailable", {
      reason: "pool_error",
      error: sanitized.message,
      errorCategory: sanitized.category
    });
  });
}

export const dbEnabled = Boolean(pool);

export function getDatabaseStatus() {
  if (!config.databaseUrl) return "dry-run";
  return dbConnectionStatus;
}

export function getDatabaseError() {
  return dbConnectionError;
}

export function isDatabaseReady() {
  return Boolean(pool) && dbConnectionStatus === "connected";
}

export function markDatabaseConnected() {
  dbConnectionStatus = "connected";
  dbConnectionError = null;
}

export function markDatabaseDisconnected(reason = "Database unavailable") {
  dbConnectionStatus = "disconnected";
  dbConnectionError = reason;
}

export function markDatabaseDryRun() {
  dbConnectionStatus = "dry-run";
  dbConnectionError = null;
}

export async function query(text, params = []) {
  if (!pool || !isDatabaseReady()) return { rows: [], rowCount: 0 };
  return pool.query(text, params);
}

export function normalizeUserKey({ email, phone } = {}) {
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();
  if (normalizedEmail.includes("@")) return `email:${normalizedEmail}`;

  const digits = String(phone || "")
    .replace(/\D/g, "")
    .replace(/^234/, "");
  if (digits) return `phone:${digits}`;
  return null;
}

export async function closeDatabase() {
  if (!pool) return { ok: true, skipped: true };
  try {
    await pool.end();
    dbConnectionStatus = "disconnected";
    dbConnectionError = null;
    return { ok: true };
  } catch (error) {
    const sanitized = sanitizeApiErrorForLog(error);
    dbConnectionError = databaseErrorSummary(error, "Database pool close failed");
    return { ok: false, reason: sanitized.message };
  }
}

export async function pingDatabase() {
  if (!pool) return false;
  if (dbConnectionStatus !== "connected") return false;
  try {
    await pool.query("select 1 as ok");
    return true;
  } catch (error) {
    dbConnectionStatus = "disconnected";
    dbConnectionError = databaseErrorSummary(error, "Database ping failed");
    return false;
  }
}

export async function withDbRetry(task, attempts = 3, context = {}) {
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
  logRetryExhausted("database", {
    attempts,
    operation: context.operation || null,
    error: lastError instanceof Error ? lastError.message : String(lastError || "unknown")
  });
  throw lastError;
}
