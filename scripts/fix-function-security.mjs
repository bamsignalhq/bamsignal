#!/usr/bin/env node
import dotenv from "dotenv";
import { initDatabase } from "../server/db.js";
import { fixFunctionSecurity } from "../server/fixFunctionSecurity.js";

dotenv.config();
dotenv.config({ path: ".env.local", override: true });

const init = await initDatabase();
if (!init.ok) {
  console.error("[fix-function-security]", init.reason || "DATABASE_URL is not connected.");
  process.exit(1);
}

const result = await fixFunctionSecurity();
console.log(JSON.stringify(result, null, 2));
