#!/usr/bin/env node
import dotenv from "dotenv";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runMigrations } from "../server/migrationRunner.js";

dotenv.config();

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");
const migrationsDir = join(rootPath, "migrations");
const databaseUrl = process.env.DATABASE_URL?.trim();

async function main() {
  if (!databaseUrl) {
    console.error("DATABASE_URL is required to run migrations.");
    process.exit(1);
  }

  const result = await runMigrations({ databaseUrl, migrationsDir });
  console.log(
    `migrations ok: applied=${result.applied.length} skipped=${result.skipped.length} total=${result.total}`
  );
  if (result.applied.length) {
    console.log(`applied: ${result.applied.join(", ")}`);
  }
}

main().catch((error) => {
  console.error("[migrate]", error.message || error);
  process.exit(1);
});
