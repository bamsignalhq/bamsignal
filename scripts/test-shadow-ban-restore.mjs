#!/usr/bin/env node
/**
 * Smoke test: shadow ban + restore + audit log.
 * Requires DATABASE_URL and a member profile id (argv[2]).
 *
 * Usage:
 *   node scripts/test-shadow-ban-restore.mjs <profileId>
 */
import dotenv from "dotenv";
import {
  applyShadowBan,
  liftShadowBan,
  listShadowBannedUsers
} from "../server/services/moderation.js";
import { initDatabase, query } from "../server/db.js";

dotenv.config();

const profileId = process.argv[2];
const operator = process.env.COMMAND_CENTER_EMAILS?.split(",")[0]?.trim() || "ops@bamsignal.com";

async function main() {
  if (!profileId) {
    console.error("Usage: node scripts/test-shadow-ban-restore.mjs <profileId>");
    process.exit(1);
  }

  const init = await initDatabase();
  if (!init.ok) {
    console.error("Database not ready:", init.reason);
    process.exit(1);
  }

  console.log("1) Applying shadow ban…");
  const banned = await applyShadowBan({
    profileId,
    operatorEmail: operator,
    reason: "Test shadow ban"
  });
  if (!banned.ok) {
    console.error("Shadow ban failed:", banned.error);
    process.exit(1);
  }
  console.log("   OK");

  const listed = await listShadowBannedUsers();
  const found = listed.some((row) => row.profileId === profileId);
  console.log(`2) Listed in shadow banned users: ${found ? "yes" : "no"}`);
  if (!found) process.exit(1);

  console.log("3) Lifting shadow ban…");
  const lifted = await liftShadowBan({
    profileId,
    operatorEmail: operator,
    reason: "Test restoration"
  });
  if (!lifted.ok) {
    console.error("Lift failed:", lifted.error);
    process.exit(1);
  }
  console.log("   OK");

  const audit = await query(
    `select action, operator_email, reason, created_at
     from moderation_audit_log
     where target_profile_id = $1
     order by created_at desc
     limit 5`,
    [profileId]
  );
  console.log("4) Recent audit log:");
  for (const row of audit.rows) {
    console.log(`   - ${row.action} by ${row.operator_email}: ${row.reason}`);
  }

  const hasLift = audit.rows.some((row) => row.action === "shadow_ban_lifted");
  console.log(`5) Audit contains shadow_ban_lifted: ${hasLift ? "yes" : "no"}`);
  process.exit(hasLift ? 0 : 1);
}

void main();
