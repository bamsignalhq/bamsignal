#!/usr/bin/env node
import dotenv from "dotenv";
import { bootstrapOpsAdmin } from "../server/services/adminBootstrap.js";

dotenv.config();

const email = process.argv[2] || process.env.ADMIN_BOOTSTRAP_EMAIL || "ops@bamsignal.com";
const password = process.argv[3] || process.env.ADMIN_BOOTSTRAP_PASSWORD;

async function main() {
  const result = await bootstrapOpsAdmin({ email, password });
  if (!result.ok) {
    console.error("Bootstrap failed:", result.error);
    process.exit(1);
  }
  console.log(`Admin ready: ${result.email}`);
  console.log(`Supabase user: ${result.created ? "created" : "updated"} (${result.userId})`);
  if (result.generated && result.password) {
    console.log("\nGenerated password (copy now):");
    console.log(result.password);
  } else {
    console.log("Password set from ADMIN_BOOTSTRAP_PASSWORD.");
  }
  console.log("\nLogin at https://bamsignal.com/hard/auth");
  console.log("Set COMMAND_CENTER_PIN in Coolify for action confirmation.");
}

void main();
