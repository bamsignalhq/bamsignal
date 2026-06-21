import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import pg from "pg";

const { Pool } = pg;

const MIGRATION_FILENAME_PATTERN = /^\d+_.+\.sql$/i;

export async function listMigrationFiles(migrationsDir) {
  const entries = await readdir(migrationsDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && MIGRATION_FILENAME_PATTERN.test(entry.name))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
}

export async function ensureMigrationLedger(pool) {
  await pool.query(`
    create table if not exists schema_migrations (
      id text primary key,
      applied_at timestamptz not null default now()
    )
  `);
}

export async function readAppliedMigrationIds(pool) {
  const result = await pool.query("select id from schema_migrations order by id asc");
  return new Set(result.rows.map((row) => String(row.id)));
}

export async function applyMigrationFile(pool, migrationId, sql) {
  await pool.query("begin");
  try {
    await pool.query(sql);
    await pool.query(
      `insert into schema_migrations (id, applied_at)
       values ($1, now())
       on conflict (id) do nothing`,
      [migrationId]
    );
    await pool.query("commit");
    return { applied: true, id: migrationId };
  } catch (error) {
    await pool.query("rollback");
    throw error;
  }
}

export async function runMigrations({
  databaseUrl,
  migrationsDir,
  ssl = process.env.PGSSLMODE === "disable" ? false : { rejectUnauthorized: false }
}) {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to run migrations.");
  }

  const pool = new Pool({ connectionString: databaseUrl, ssl });
  const applied = [];
  const skipped = [];

  try {
    await ensureMigrationLedger(pool);
    const appliedIds = await readAppliedMigrationIds(pool);
    const files = await listMigrationFiles(migrationsDir);

    for (const filename of files) {
      const migrationId = filename.replace(/\.sql$/i, "");
      if (appliedIds.has(migrationId)) {
        skipped.push(migrationId);
        continue;
      }
      const sql = await readFile(join(migrationsDir, filename), "utf8");
      await applyMigrationFile(pool, migrationId, sql);
      applied.push(migrationId);
    }

    return { ok: true, applied, skipped, total: files.length };
  } finally {
    await pool.end();
  }
}
