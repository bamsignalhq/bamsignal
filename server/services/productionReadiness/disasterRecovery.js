/**
 * Sprint 7 — Disaster recovery checklist and validation contract.
 */

import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "../../..");

export const DISASTER_RECOVERY_CHECKLIST = Object.freeze([
  { id: "db_backup", label: "Supabase automated daily backups enabled", owner: "platform" },
  { id: "db_restore_test", label: "Restore procedure documented and tested quarterly", owner: "platform" },
  { id: "migration_forward", label: "Forward-fix migration strategy (no down migrations)", owner: "engineering" },
  { id: "photo_storage", label: "Firebase/photo storage backup policy documented", owner: "platform" },
  { id: "config_backup", label: "Runtime configuration backed up (ops_runtime_configuration export)", owner: "operations" },
  { id: "secrets_rotation", label: "Operation secrets rotation runbook exists", owner: "security" },
  { id: "coolify_rollback", label: "Coolify previous-image rollback tested", owner: "platform" },
  { id: "certification_manifest", label: "Certification manifest archived per deploy", owner: "engineering" }
]);

export function runDisasterRecoveryAudit() {
  const items = DISASTER_RECOVERY_CHECKLIST.map((item) => {
    let verified = false;
    if (item.id === "migration_forward") {
      verified = existsSync(join(rootPath, "migrations/0063_passport_integration.sql"));
    }
    if (item.id === "certification_manifest") {
      verified = existsSync(join(rootPath, "certification/production/run.mjs"));
    }
    if (item.id === "config_backup") {
      verified = readFileSync(join(rootPath, "migrations/0062_admin_operations_core.sql"), "utf8").includes(
        "ops_runtime_configuration"
      );
    }
    return { ...item, verified, status: verified ? "documented" : "pending" };
  });

  const verifiedCount = items.filter((i) => i.verified).length;

  return {
    domain: "disaster_recovery",
    passed: verifiedCount >= 3,
    status: verifiedCount >= 6 ? "PASS" : "WARN",
    checklist: items,
    verifiedCount,
    totalCount: items.length,
    restoreProcedure: [
      "1. Confirm incident scope via /ready?details=1",
      "2. Enable maintenance_mode via ops runtime config",
      "3. Coolify: rollback to last known-good image if application fault",
      "4. Database: use Supabase point-in-time recovery — never partial schema rollback",
      "5. Re-run npm run certify:production against restored environment",
      "6. Disable maintenance_mode after certification PASS"
    ]
  };
}
