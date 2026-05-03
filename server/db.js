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

  await ensureTipsTable();

  const result = await query(
    `insert into tips (match_name, league, prediction, odds, confidence, is_vip, booking_codes, source, status, starts_at, fixture_payload)
     values ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9, $10)
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
      tip.starts_at || null,
      tip.fixture_payload || null
    ]
  );
  return result.rows[0];
}

export async function ensureTipsTable() {
  if (!pool) return;

  await query(`
    create table if not exists tips (
      id uuid primary key default gen_random_uuid(),
      match_name text not null,
      league text,
      prediction text not null,
      odds numeric(8, 2) not null,
      confidence integer,
      is_vip boolean not null default false,
      booking_codes jsonb not null default '{}'::jsonb,
      source text,
      status text not null default 'pending',
      starts_at timestamptz,
      fixture_payload jsonb,
      result_payload jsonb,
      settled_at timestamptz,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);

  await query("alter table tips add column if not exists fixture_payload jsonb");
  await query("alter table tips add column if not exists settled_at timestamptz");

  await query("create index if not exists tips_created_at_idx on tips (created_at)");
  await query("create index if not exists tips_visibility_idx on tips (is_vip, created_at desc)");
}

export async function ensureDailyGamesTable() {
  if (!pool) return;

  await query(`
    create table if not exists daily_games (
      id uuid primary key default gen_random_uuid(),
      game_date date not null,
      match_name text not null,
      league text,
      prediction text not null,
      odds numeric(8, 2) not null,
      confidence integer,
      is_vip boolean not null default false,
      booking_codes jsonb not null default '{}'::jsonb,
      source text,
      status text not null default 'pending',
      starts_at timestamptz,
      fixture_payload jsonb,
      result_payload jsonb,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      unique (game_date, match_name, prediction, is_vip)
    )
  `);

  await query("create index if not exists daily_games_game_date_idx on daily_games (game_date)");
  await query("create index if not exists daily_games_visibility_idx on daily_games (game_date, is_vip)");
  await query("alter table daily_games add column if not exists result_payload jsonb");
}

export async function upsertDailyGames(gameDate, tips) {
  if (!pool) {
    return tips.map((tip, index) => ({ ...tip, id: `dry-daily-${gameDate}-${index}`, game_date: gameDate }));
  }

  await ensureDailyGamesTable();

  const saved = [];
  for (const tip of tips) {
    const result = await query(
      `insert into daily_games (
        game_date, match_name, league, prediction, odds, confidence, is_vip,
        booking_codes, source, status, starts_at, fixture_payload
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', $10, $11)
      on conflict (game_date, match_name, prediction, is_vip)
      do update set
        league = excluded.league,
        odds = excluded.odds,
        confidence = excluded.confidence,
        booking_codes = excluded.booking_codes,
        source = excluded.source,
        starts_at = excluded.starts_at,
        fixture_payload = excluded.fixture_payload,
        updated_at = now()
      returning *`,
      [
        gameDate,
        tip.match_name,
        tip.league || null,
        tip.prediction,
        tip.odds,
        tip.confidence || null,
        tip.is_vip,
        tip.booking_codes || {},
        tip.source || null,
        tip.starts_at || null,
        tip.fixture_payload || null
      ]
    );
    saved.push(result.rows[0]);
  }

  return saved;
}

export async function deleteDailyGamesBySource(gameDate, source) {
  if (!pool || !source) return { rowCount: 0 };

  await ensureDailyGamesTable();

  return query(
    `delete from daily_games
     where game_date = $1::date
       and source = $2`,
    [gameDate, source]
  );
}
