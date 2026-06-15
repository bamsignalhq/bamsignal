#!/usr/bin/env node
import dotenv from "dotenv";
import { initDatabase } from "../server/db.js";
import { fixSecurityDefinerViews } from "../server/fixSecurityDefinerViews.js";

dotenv.config();
dotenv.config({ path: ".env.local", override: true });

const init = await initDatabase();
if (!init.ok) {
  console.error("[fix-security-definer-views]", init.reason || "DATABASE_URL is not connected.");
  process.exit(1);
}

const result = await fixSecurityDefinerViews();

if (!result.ok) {
  console.error("[fix-security-definer-views]", result.reason || "Fix failed.");
  process.exit(1);
}

console.log(
  result.fixed.length
    ? `Updated views: ${result.fixed.join(", ")}`
    : "No matching views found (already fixed or not deployed on this database)."
);
