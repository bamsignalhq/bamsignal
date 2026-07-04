#!/usr/bin/env node
/**
 * Repair fulfilled boost payments missing app_member_boosts entitlement rows.
 *
 * Usage:
 *   node scripts/repair-boost-entitlements.mjs --dry-run
 *   node scripts/repair-boost-entitlements.mjs --reference bs_priority-signal-once_xxx
 *   node scripts/repair-boost-entitlements.mjs --limit 50
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

function parseArgs(argv) {
  const args = {
    dryRun: false,
    reference: "",
    limit: 100
  };
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--dry-run") args.dryRun = true;
    else if (token === "--reference") args.reference = String(argv[++i] || "").trim();
    else if (token === "--limit") args.limit = Number(argv[++i] || 100);
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  process.chdir(rootPath);

  const { checkSchema } = await import("../server/db.js");
  await checkSchema({ force: true });

  const { repairAllMissingBoostEntitlements, repairBoostEntitlementForReference } = await import(
    "../server/services/boostIntegrity.js"
  );

  console.log(`Boost entitlement repair — dryRun=${args.dryRun}`);

  if (args.reference) {
    const result = await repairBoostEntitlementForReference(args.reference, {
      dryRun: args.dryRun,
      source: "repair_command"
    });
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.ok ? 0 : 1);
  }

  const batch = await repairAllMissingBoostEntitlements({
    dryRun: args.dryRun,
    limit: args.limit,
    source: "repair_command"
  });

  console.log(
    JSON.stringify(
      {
        scanned: batch.scanned,
        repaired: batch.repaired,
        idempotent: batch.idempotent,
        failed: batch.failed,
        dryRun: batch.dryRun
      },
      null,
      2
    )
  );

  if (batch.results?.length) {
    console.log("\nDetails:");
    for (const row of batch.results) {
      console.log(`- ${row.reference}: ${row.ok ? "ok" : "failed"}${row.dryRun ? " (dry-run)" : ""}`);
    }
  }

  process.exit(batch.failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
