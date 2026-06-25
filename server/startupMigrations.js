import path from "node:path";
import { fileURLToPath } from "node:url";
import { runMigrations } from "./migrationRunner.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultMigrationsDir = path.join(__dirname, "..", "migrations");

/**
 * Apply SQL migrations before serving traffic (Coolify / Docker production).
 * Set RUN_MIGRATIONS_ON_STARTUP=false to skip (e.g. external migration job).
 */
export async function runStartupMigrations(options = {}) {
  const databaseUrl = String(options.databaseUrl || process.env.DATABASE_URL || "").trim();
  if (!databaseUrl) {
    return { skipped: true, reason: "no_database_url" };
  }

  if (process.env.RUN_MIGRATIONS_ON_STARTUP === "false") {
    return { skipped: true, reason: "disabled" };
  }

  const migrationsDir = options.migrationsDir || defaultMigrationsDir;
  const result = await runMigrations({ databaseUrl, migrationsDir });
  console.log(
    `[bamsignal] migrations ok: applied=${result.applied.length} skipped=${result.skipped.length} total=${result.total}`
  );
  if (result.applied.length) {
    console.log(`[bamsignal] migrations applied: ${result.applied.join(", ")}`);
  }
  return result;
}
