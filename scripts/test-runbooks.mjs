/**
 * Verify disaster recovery runbooks exist and cover required topics.
 */
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const runbooks = [
  {
    path: "docs/runbooks/database-backup.md",
    mustInclude: ["pg_dump", "Supabase", "payment_fulfillments", "Retention"]
  },
  {
    path: "docs/runbooks/database-restore.md",
    mustInclude: ["pg_restore", "PITR", "auth.users", "verify-database"]
  },
  {
    path: "docs/runbooks/storage-backup.md",
    mustInclude: ["profile-photos", "cover-photos", "voice-intros", "orphan"]
  },
  {
    path: "docs/runbooks/storage-restore.md",
    mustInclude: ["SUPABASE_SERVICE_ROLE_KEY", "ready", "orphan"]
  },
  {
    path: "docs/runbooks/deployment-recovery.md",
    mustInclude: ["Coolify", "/ready", "DATABASE_URL", "RESEND_API_KEY"]
  },
  {
    path: "docs/runbooks/payment-recovery.md",
    mustInclude: [
      "payment_fulfillments",
      "webhook",
      "Paystack",
      "completePaymentFulfillment"
    ]
  },
  {
    path: "docs/runbooks/wallet-recovery.md",
    mustInclude: ["baygold_purchases", "resume_token", "STANKINGS_PLATFORM", "wallet_funding"]
  },
  {
    path: "docs/runbooks/messaging-recovery.md",
    mustInclude: ["/ready", "persist", "database"]
  },
  {
    path: "docs/runbooks/notification-recovery.md",
    mustInclude: ["signupEmail", "RESEND", "ready"]
  },
  {
    path: "docs/runbooks/support-escalation.md",
    mustInclude: ["support@bamsignal.com", "Founder", "P1"]
  },
  {
    path: "docs/runbooks/moderation-incidents.md",
    mustInclude: ["report", "photo", "P1"]
  },
  {
    path: "docs/runbooks/incident-response.md",
    mustInclude: ["deployment-recovery", "wallet-recovery", "alerts"]
  },
  {
    path: "docs/runbooks/configuration-backup.md",
    mustInclude: ["Coolify", "feature", "never commit"]
  },
  {
    path: "docs/runbooks/secrets-recovery.md",
    mustInclude: ["PAYSTACK", "rotation", "Coolify"]
  }
];

for (const book of runbooks) {
  const fullPath = join(rootPath, book.path);
  assert(existsSync(fullPath), `missing runbook: ${book.path}`);
  const text = readFileSync(fullPath, "utf8");
  for (const phrase of book.mustInclude) {
    assert(text.includes(phrase), `${book.path} must mention "${phrase}"`);
  }
  assert(!text.match(/sk_live_[a-z0-9]+/i), `${book.path} must not contain live secret patterns`);
  assert(!text.match(/postgresql:\/\/[^:]+:[^@]+@/), `${book.path} must not contain DB URLs with credentials`);
}

const readmePath = join(rootPath, "docs/runbooks/README.md");
assert(existsSync(readmePath), "missing docs/runbooks/README.md");
const readme = readFileSync(readmePath, "utf8");
assert(readme.includes("wallet-recovery"), "README must index wallet-recovery");
assert(readme.includes("incident-response"), "README must index incident-response");

console.log("PASS: runbook tests");
