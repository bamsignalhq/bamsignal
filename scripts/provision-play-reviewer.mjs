#!/usr/bin/env node
/**
 * Provision Google Play reviewer test account (reviewer@bamsignal.com).
 * Usage: node scripts/provision-play-reviewer.mjs
 * Requires DATABASE_URL; uses Postgres auth schema when service role is unavailable.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { initDatabase, isDatabaseReady } from "../server/db.js";
import {
  PLAY_REVIEWER,
  generateStrongPlayReviewerPin,
  provisionPlayReviewerAccount
} from "../server/provisionPlayReviewer.js";
import { createConfirmedSupabaseUser } from "../server/services/signupOtp.js";
import { query } from "../server/db.js";

dotenv.config();
dotenv.config({ path: ".env.local", override: true });

function writeAccessDoc(pin) {
  const docPath = path.join(process.cwd(), "PLAY_REVIEW_ACCESS.md");
  const content = `# Google Play reviewer access (local only — do not commit)

Generated: ${new Date().toISOString()}

## Login credentials

| Field | Value |
|-------|-------|
| **Username** | \`${PLAY_REVIEWER.username}\` |
| **PIN** | \`${pin}\` |
| **Email (internal)** | \`${PLAY_REVIEWER.email}\` |

Members sign in with **username + 6-digit PIN** on the BamSignal login screen.

## Play Console — App access

Paste into Google Play Console → App content → App access:

\`\`\`
BamSignal uses username + PIN login (no Google Sign-In).

Username: playreview
PIN: ${pin}

After login, the account has completed onboarding and can access Home, Discover, Likes, Messages, Profile, Safety, and Payment screens. This is a standard member account with no admin or ops console access.
\`\`\`

## Notes

- Rotate the PIN after review: re-run \`node scripts/provision-play-reviewer.mjs\`
- Account city: Lagos (discoverable on city home)
- Admin access is disabled for this email
`;

  fs.writeFileSync(docPath, content, "utf8");
  console.log(`Wrote ${docPath}`);
}

async function ensureAuthUserViaAdmin(pin) {
  const existing = await query(
    "select id from auth.users where lower(email) = lower($1) limit 1",
    [PLAY_REVIEWER.email]
  );
  if (existing.rows[0]?.id) {
    return { id: existing.rows[0].id, created: false };
  }

  await createConfirmedSupabaseUser({
    email: PLAY_REVIEWER.email,
    password: pin,
    name: PLAY_REVIEWER.name,
    username: PLAY_REVIEWER.username,
    phone: PLAY_REVIEWER.phone
  });
  const row = await query("select id from auth.users where lower(email) = lower($1) limit 1", [
    PLAY_REVIEWER.email
  ]);
  return { id: row.rows[0]?.id, created: true };
}

async function main() {
  const pin = process.env.PLAY_REVIEWER_PIN?.trim() || generateStrongPlayReviewerPin();

  const init = await initDatabase();
  if (!init.ok || !isDatabaseReady()) {
    throw new Error(init.reason || "DATABASE_URL is not connected.");
  }

  const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
  if (hasServiceRole) {
    await ensureAuthUserViaAdmin(pin);
  }

  const result = await provisionPlayReviewerAccount(pin);
  writeAccessDoc(pin);

  console.log("Play reviewer account ready.");
  console.log(`- Auth + member profile provisioned (${result.memberProfileId})`);
  console.log(`- Username: ${PLAY_REVIEWER.username}`);
  console.log(`- PIN written to PLAY_REVIEW_ACCESS.md (gitignored)`);
}

main().catch((error) => {
  console.error("[provision-play-reviewer]", error.message || error);
  process.exit(1);
});
