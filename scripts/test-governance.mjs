#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertExecutiveDecisionAppendOnly,
  assertNotSelfApproval,
  buildGovernanceAuthorizationContext,
  canAccessGovernanceConsole,
  expireDelegations,
  getGovernanceDatabaseTableManifest,
  operatorHasGovernancePermission,
  processApprovalDecision,
  recordPolicyAcknowledgement,
  resolveInheritedPermissions,
  resolveOperatorGovernancePermissions
} from "../server/services/institutionalGovernance.js";
import { getInstitutionalGovernanceSeedState } from "../server/services/institutionalGovernanceSeed.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

const adminSource = readFileSync(join(rootPath, "src/constants/institutionalGovernanceAdmin.ts"), "utf8");
assert(adminSource.includes('INSTITUTIONAL_GOVERNANCE_ADMIN_PATH = "/hard/governance"'), "governance route");

const constantsSource = readFileSync(join(rootPath, "src/constants/institutionalGovernance.ts"), "utf8");
assert(constantsSource.includes("Institutional Governance System™"), "governance brand");
assert(constantsSource.includes("Founder"), "founder role");
assert(constantsSource.includes("Chief Executive Officer"), "ceo role");
assert(constantsSource.includes("manage-governance"), "manage governance permission");
assert(constantsSource.includes("GOVERNANCE_FUTURE_ARCHITECTURE"), "future architecture documented");
assert(constantsSource.includes("Board of Directors"), "board future item");
assert(constantsSource.includes("governance_roles"), "governance_roles table");

const migrationSource = readFileSync(
  join(rootPath, "supabase/migrations/202606251400_institutional_governance.sql"),
  "utf8"
);
assert(migrationSource.includes("uuid primary key"), "uuid primary keys");
assert(migrationSource.includes("deleted_at"), "soft delete fields");
assert(migrationSource.includes("executive_decisions"), "executive_decisions table");

const permissionsSource = readFileSync(join(rootPath, "src/constants/permissions.ts"), "utf8");
assert(permissionsSource.includes("ManageGovernance"), "legacy ManageGovernance permission");
assert(permissionsSource.includes("buildLegacyRolePermissionMap"), "permissions derived from governance");
assert(permissionsSource.includes("/hard/governance"), "governance route permission mapped");

const operatorSource = readFileSync(join(rootPath, "src/utils/operatorPermissions.ts"), "utf8");
assert(operatorSource.includes("operatorHasGovernanceLegacyPermission"), "operator permissions use governance");

const middlewareSource = readFileSync(
  join(rootPath, "server/middleware/governanceAuthorization.js"),
  "utf8"
);
assert(middlewareSource.includes("requireGovernancePermission"), "authorization middleware exists");

const conciergeRouteSource = readFileSync(join(rootPath, "server/routes/conciergePersistence.js"), "utf8");
assert(conciergeRouteSource.includes("requireGovernancePermission"), "concierge route uses governance middleware");

const engineSource = readFileSync(join(rootPath, "src/utils/governanceEngine.ts"), "utf8");
assert(engineSource.includes("buildInstitutionalGovernanceBundle"), "governance engine exists");

const storeSource = readFileSync(join(rootPath, "src/utils/governanceStore.ts"), "utf8");
assert(storeSource.includes("appendAuditCenterEvent"), "governance audit logging");

const adminComponents = [
  "GovernanceOverviewCard.tsx",
  "AuthorityMatrixCard.tsx",
  "RoleManagementCard.tsx",
  "PermissionExplorerCard.tsx",
  "ApprovalQueueCard.tsx",
  "DelegationCard.tsx",
  "DecisionRegisterCard.tsx",
  "PolicyAcknowledgementCard.tsx",
  "InstitutionHealthCard.tsx",
  "GovernanceMetricsCard.tsx",
  "InstitutionalGovernancePage.tsx"
];

for (const file of adminComponents) {
  const source = readFileSync(join(rootPath, "src/components/admin/governance", file), "utf8");
  assert(source.length > 0, `${file} exists`);
}

const adminHubSource = readFileSync(join(rootPath, "src/pages/AdminHubPage.tsx"), "utf8");
assert(adminHubSource.includes("InstitutionalGovernancePage"), "admin hub mounts governance page");

const navSource = readFileSync(join(rootPath, "src/components/admin/adminConsoleNav.ts"), "utf8");
assert(navSource.includes('"governance"'), "admin nav includes governance tab");

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:governance"), "package.json defines test:governance");

const mainSource = readFileSync(join(rootPath, "src/main.tsx"), "utf8");
const entryAdminSource = readFileSync(join(rootPath, "src/styles/entry-admin.css"), "utf8");
assert((entryAdminSource.includes("institutional-governance.css") || mainSource.includes("institutional-governance.css")), "governance styles imported");

const seedState = getInstitutionalGovernanceSeedState();
const founderContext = buildGovernanceAuthorizationContext(
  seedState,
  "founder@bamsignal.com",
  "Admin"
);
const opsContext = buildGovernanceAuthorizationContext(seedState, "ops@bamsignal.com", "Operations");

assert(
  operatorHasGovernancePermission(founderContext, "manage-governance"),
  "founder has manage-governance"
);
assert(
  !operatorHasGovernancePermission(opsContext, "manage-governance"),
  "operations role lacks manage-governance by default"
);
assert(canAccessGovernanceConsole(founderContext), "founder can access governance console");

const inherited = resolveInheritedPermissions("relationship-consultant", seedState.directPermissionsByRole, founderContext.rolesBySlug);
assert(inherited.includes("manage-introductions"), "permission inheritance includes direct grants");

const expiredDelegations = expireDelegations(seedState.delegations, new Date("2026-02-01T00:00:00.000Z"));
assert(
  expiredDelegations.some((item) => item.status === "expired"),
  "delegation expiry"
);

const activePermissions = resolveOperatorGovernancePermissions({
  legacyRole: "Operations",
  operatorEmail: "ops-coordinator@bamsignal.com",
  assignments: seedState.assignments,
  delegations: seedState.delegations.filter((item) => item.id !== "dl100000-0000-4000-8000-000000000002"),
  directPermissionsByRole: seedState.directPermissionsByRole,
  rolesBySlug: founderContext.rolesBySlug,
  at: new Date("2026-06-20T00:00:00.000Z")
});
assert(activePermissions.includes("manage-operations"), "delegation grants permissions");

const request = seedState.approvals[0];
let threw = false;
try {
  assertNotSelfApproval(request, request.makerEmail);
} catch {
  threw = true;
}
assert(threw, "no self approval");

const approvalResult = processApprovalDecision(request, [], {
  approverEmail: "founder@bamsignal.com",
  decision: "approved",
  reason: "Verified"
});
assert(approvalResult.request.status === "approved", "approval workflow completes");

const policyResult = recordPolicyAcknowledgement([], {
  id: "ack_test",
  policyId: "policy_test",
  policyVersion: "2026.1",
  operatorEmail: "ops@bamsignal.com",
  acknowledgedAt: new Date().toISOString(),
  digitalSignature: "sig_test"
});
assert(policyResult.created, "policy acknowledgement recorded");

threw = false;
try {
  assertExecutiveDecisionAppendOnly(
    [{ id: "d1", decisionRef: "REF-1" }],
    []
  );
} catch {
  threw = true;
}
assert(threw, "executive decisions append only");

const manifest = getGovernanceDatabaseTableManifest();
assert(manifest.length === 12, "database persistence manifest has twelve tables");

if (failed) {
  console.error(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("Institutional Governance checks passed.");
